import { Expression } from '../expression';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

/**
 * Angle conversion operators.
 */
export enum AngleConversionOperator
{
    Deg = 'DEG',
    Rad = 'RAD',
}

/**
 * Expression node for applying angle conversion to a numeric operand.
 */
export class AngleConversionExpression extends Expression
{
    /**
     * Operand expression expected to evaluate to a numeric value.
     */
    public readonly operand: Expression;

    /**
     * Conversion operator to apply.
     */
    public readonly operator: AngleConversionOperator;

    /**
     * Create a new angle conversion expression.
     *
     * @param operand Operand expression expected to be numeric.
     * @param operator Conversion operator to apply.
     */
    public constructor(operand: Expression, operator: AngleConversionOperator)
    {
        super();
        this.operand = operand;
        this.operator = operator;
    }

    /**
     * Evaluate the operand and apply the selected conversion.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const value = this.operand.evaluate(context);

        let num: number;
        switch (value.type)
        {
            case EduBasicType.Integer:
                num = value.value;
                break;
            case EduBasicType.Real:
                num = value.value;
                break;
            default:
                throw new Error(`${this.operator} operator requires numeric operand, got ${value.type}`);
        }

        switch (this.operator)
        {
            // Degrees -> radians
            case AngleConversionOperator.Deg:
                return { type: EduBasicType.Real, value: num * Math.PI / 180 };
            // Radians -> degrees
            case AngleConversionOperator.Rad:
                return { type: EduBasicType.Real, value: num * 180 / Math.PI };
        }
    }

    public override toString(omitOuterParens?: boolean): string
    {
        return `${this.operand.toString()} ${this.operator}`;
    }
}
