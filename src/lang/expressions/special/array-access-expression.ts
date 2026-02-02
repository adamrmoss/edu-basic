import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';
import { EduBasicType } from '../../edu-basic-value';
import { VariableExpression } from './variable-expression';

/**
 * Expression node that indexes into a 1D array using a single bracket index.
 */
export class ArrayAccessExpression extends Expression
{
    /**
     * Base expression expected to evaluate to an array.
     */
    public readonly arrayExpr: Expression;

    /**
     * Index expression (1-based) used to select the element.
     */
    public readonly index: Expression;

    /**
     * Create a new array access expression.
     *
     * @param arrayExpr Base expression expected to evaluate to an array.
     * @param index Index expression (1-based).
     */
    public constructor(arrayExpr: Expression, index: Expression)
    {
        super();
        this.arrayExpr = arrayExpr;
        this.index = index;
    }

    /**
     * Evaluate the array and index, then return the referenced element.
     *
     * @param context Execution context to evaluate against.
     * @returns The referenced element value (or a type-appropriate default).
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        let arrayValue = this.arrayExpr.evaluate(context);

        if (arrayValue.type !== EduBasicType.Array && this.arrayExpr instanceof VariableExpression)
        {
            const baseName = this.arrayExpr.name;
            const arrayName = baseName.endsWith('[]') ? baseName : `${baseName}[]`;
            arrayValue = context.getVariable(arrayName);
        }

        if (arrayValue.type !== EduBasicType.Array)
        {
            throw new Error('ArrayAccessExpression: base expression is not an array');
        }

        const dimensions = arrayValue.dimensions;
        if (dimensions && dimensions.length > 1)
        {
            throw new Error('ArrayAccessExpression: multi-dimensional arrays require comma-separated indices (e.g., a#[i, j])');
        }

        const indexValue = this.index.evaluate(context);
        const oneBased = ArrayAccessExpression.toOneBasedIndex(indexValue);
        if (oneBased === null)
        {
            throw new Error('Array index is out of bounds');
        }

        const lower = dimensions && dimensions.length === 1 ? dimensions[0].lower : 1;
        const length = dimensions && dimensions.length === 1 ? dimensions[0].length : arrayValue.value.length;
        const stride = dimensions && dimensions.length === 1 ? dimensions[0].stride : 1;

        const offset = oneBased - lower;
        const flatIndex = offset * stride;
        if (offset < 0 || offset >= length || flatIndex < 0 || flatIndex >= arrayValue.value.length)
        {
            throw new Error('Array index is out of bounds');
        }

        return arrayValue.value[flatIndex] ?? ArrayAccessExpression.getDefaultValueForType(arrayValue.elementType);
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.arrayExpr.toString()}[${this.index.toString()}]`;
    }

    private static toOneBasedIndex(value: EduBasicValue): number | null
    {
        switch (value.type)
        {
            case EduBasicType.Integer:
                return Math.trunc(value.value);
            case EduBasicType.Real:
                return Math.trunc(value.value);
            case EduBasicType.Complex:
                return Math.trunc(value.value.real);
            case EduBasicType.String:
            {
                const parsed = Number.parseInt(value.value, 10);
                return Number.isFinite(parsed) ? parsed : null;
            }
            default:
                return null;
        }
    }

    private static getDefaultValueForType(type: EduBasicType): EduBasicValue
    {
        switch (type)
        {
            case EduBasicType.Integer:
                return { type: EduBasicType.Integer, value: 0 };
            case EduBasicType.Real:
                return { type: EduBasicType.Real, value: 0.0 };
            case EduBasicType.String:
                return { type: EduBasicType.String, value: '' };
            case EduBasicType.Complex:
                return { type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } };
            case EduBasicType.Array:
                return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer };
            case EduBasicType.Structure:
                return { type: EduBasicType.Structure, value: new Map() };
        }
    }
}
