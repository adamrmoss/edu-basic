import { Expression } from '../expression';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export enum AngleConversionOperator
{
    Deg = 'DEG',
    Rad = 'RAD',
}

export class AngleConversionExpression extends Expression
{
    public constructor(
        public readonly operand: Expression,
        public readonly operator: AngleConversionOperator
    )
    {
        super();
    }

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
