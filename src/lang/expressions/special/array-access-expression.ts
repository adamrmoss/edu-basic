import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';
import { EduBasicType } from '../../edu-basic-value';
import { VariableExpression } from './variable-expression';

export class ArrayAccessExpression extends Expression
{
    public constructor(
        public readonly arrayExpr: Expression,
        public readonly index: Expression
    )
    {
        super();
    }

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

        const indexValue = this.index.evaluate(context);
        const oneBased = ArrayAccessExpression.toOneBasedIndex(indexValue);
        if (oneBased === null)
        {
            return ArrayAccessExpression.getDefaultValueForType(arrayValue.elementType);
        }

        const jsIndex = oneBased - 1;
        if (jsIndex < 0 || jsIndex >= arrayValue.value.length)
        {
            return ArrayAccessExpression.getDefaultValueForType(arrayValue.elementType);
        }

        return arrayValue.value[jsIndex] ?? ArrayAccessExpression.getDefaultValueForType(arrayValue.elementType);
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
