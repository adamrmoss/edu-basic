import { Expression } from '../expression';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';
import { VariableExpression } from './variable-expression';

export class ArraySliceExpression extends Expression
{
    public constructor(
        public readonly baseExpr: Expression,
        public readonly start: Expression | null,
        public readonly end: Expression | null
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        let baseValue = this.baseExpr.evaluate(context);

        if (baseValue.type !== EduBasicType.Array && this.baseExpr instanceof VariableExpression)
        {
            const baseName = this.baseExpr.name;
            const sigil = baseName.charAt(baseName.length - 1);
            const isTypedArrayBase = sigil === '%' || sigil === '#' || sigil === '$' || sigil === '&';

            if (isTypedArrayBase)
            {
                baseValue = context.getVariable(`${baseName}[]`);
            }
        }

        if (baseValue.type !== EduBasicType.Array)
        {
            throw new Error('ArraySliceExpression: base expression is not an array');
        }

        if (baseValue.dimensions && baseValue.dimensions.length > 1)
        {
            throw new Error('Array slicing is only supported for 1D arrays');
        }

        const dims = baseValue.dimensions;
        const lower = dims && dims.length === 1 ? dims[0].lower : 1;
        const length = dims && dims.length === 1 ? dims[0].length : baseValue.value.length;
        const stride = dims && dims.length === 1 ? dims[0].stride : 1;
        const upper = lower + length - 1;

        const startOneBased = this.start ? this.toOneBasedIndex(this.start.evaluate(context)) : lower;
        const endOneBased = this.end ? this.toOneBasedIndex(this.end.evaluate(context)) : upper;

        if (startOneBased === null || endOneBased === null)
        {
            throw new Error('Array index is out of bounds');
        }

        if (startOneBased < lower || startOneBased > upper || endOneBased < lower || endOneBased > upper)
        {
            throw new Error('Array index is out of bounds');
        }

        if (endOneBased < startOneBased)
        {
            return { type: EduBasicType.Array, value: [], elementType: baseValue.elementType };
        }

        const count = endOneBased - startOneBased + 1;
        const values: EduBasicValue[] = new Array(count);

        const startOffset = startOneBased - lower;
        for (let i = 0; i < count; i++)
        {
            const flatIndex = (startOffset + i) * stride;
            values[i] = baseValue.value[flatIndex];
        }

        return { type: EduBasicType.Array, value: values, elementType: baseValue.elementType };
    }

    public toString(omitOuterParens?: boolean): string
    {
        const startText = this.start ? this.start.toString() : '...';
        const endText = this.end ? this.end.toString() : '...';
        return `${this.baseExpr.toString()}[${startText} TO ${endText}]`;
    }

    private toOneBasedIndex(value: EduBasicValue): number | null
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
}

