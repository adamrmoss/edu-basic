import { Expression } from '../expression';
import { ArrayDimension, EduBasicType, EduBasicValue, coerceArrayElements, coerceValue, findMostSpecificCommonType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

/**
 * Expression node representing an array literal (`[a, b, c]`).
 */
export class ArrayLiteralExpression extends Expression
{
    /**
     * Element expressions in the literal.
     */
    public readonly elements: Expression[];

    /**
     * Create a new array literal expression.
     *
     * @param elements Element expressions.
     */
    public constructor(elements: Expression[])
    {
        super();
        this.elements = elements;
    }

    /**
     * Evaluate the element expressions and build a runtime array value.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime array value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        // Evaluate elements; if all scalars coerce to common type; if all arrays flatten to 2D; no jagged.
        const evaluated = this.elements.map(e => e.evaluate(context));

        const hasArrays = evaluated.some(v => v.type === EduBasicType.Array);
        const hasScalars = evaluated.some(v => v.type !== EduBasicType.Array);

        if (!hasArrays)
        {
            return coerceArrayElements(evaluated);
        }

        if (hasScalars)
        {
            throw new Error('Jagged arrays are not supported');
        }

        const subArrays = evaluated as Array<{ type: EduBasicType.Array; value: EduBasicValue[]; elementType: EduBasicType; dimensions?: ArrayDimension[] }>;

        const outerLength = subArrays.length;
        if (outerLength === 0)
        {
            return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer, dimensions: [{ lower: 1, length: 0, stride: 1 }] };
        }

        const first = subArrays[0];
        const firstRank = first.dimensions && first.dimensions.length > 0 ? first.dimensions.length : 1;
        if (firstRank !== 1)
        {
            throw new Error('Multi-dimensional array literals must be written using nested 1D arrays');
        }

        const firstRowLength = first.dimensions && first.dimensions.length === 1 ? first.dimensions[0].length : first.value.length;
        const flatValues: EduBasicValue[] = [];

        for (const row of subArrays)
        {
            const rank = row.dimensions && row.dimensions.length > 0 ? row.dimensions.length : 1;
            if (rank !== 1)
            {
                throw new Error('Jagged arrays are not supported');
            }

            const rowLength = row.dimensions && row.dimensions.length === 1 ? row.dimensions[0].length : row.value.length;
            if (rowLength !== firstRowLength)
            {
                throw new Error('Jagged arrays are not supported');
            }

            for (const v of row.value)
            {
                if (v.type === EduBasicType.Array)
                {
                    throw new Error('Jagged arrays are not supported');
                }
                flatValues.push(v);
            }
        }

        const coerced = this.coerceFlatValues(flatValues);
        const dimensions = this.createOneBasedDimensions([outerLength, firstRowLength]);

        return { type: EduBasicType.Array, value: coerced.values, elementType: coerced.elementType, dimensions };
    }

    public toString(omitOuterParens?: boolean): string
    {
        if (this.elements.length === 0)
        {
            return '[ ]';
        }

        return `[${this.elements.map(e => e.toString()).join(', ')}]`;
    }

    private coerceFlatValues(values: EduBasicValue[]): { values: EduBasicValue[]; elementType: EduBasicType }
    {
        if (values.length === 0)
        {
            return { values: [], elementType: EduBasicType.Integer };
        }

        const types = values.map(v => v.type);
        const uniqueTypes = new Set(types);

        if (uniqueTypes.has(EduBasicType.Array))
        {
            throw new Error('Jagged arrays are not supported');
        }

        if (uniqueTypes.has(EduBasicType.String))
        {
            if (uniqueTypes.size !== 1)
            {
                throw new Error('Array literal cannot mix strings with other types');
            }
            return { values, elementType: EduBasicType.String };
        }

        if (uniqueTypes.has(EduBasicType.Structure))
        {
            if (uniqueTypes.size !== 1)
            {
                throw new Error('Array literal cannot mix structures with other types');
            }
            return { values, elementType: EduBasicType.Structure };
        }

        const commonType = findMostSpecificCommonType(types);
        if (commonType === null)
        {
            throw new Error('Array literal elements must be of compatible numeric types (Integer, Real, Complex)');
        }

        return { values: values.map(v => coerceValue(v, commonType)), elementType: commonType };
    }

    private createOneBasedDimensions(lengths: number[]): ArrayDimension[]
    {
        const dims: ArrayDimension[] = lengths.map(l => ({ lower: 1, length: l, stride: 0 }));

        let stride = 1;
        for (let i = dims.length - 1; i >= 0; i--)
        {
            dims[i].stride = stride;
            stride *= dims[i].length;
        }

        return dims;
    }
}

