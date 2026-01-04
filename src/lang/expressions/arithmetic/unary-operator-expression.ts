import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export enum UnaryOperator
{
    Plus = '+',
    Minus = '-',
}

export class UnaryOperatorExpression extends Expression
{
    public constructor(
        public readonly operator: UnaryOperator,
        public readonly operand: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const operandValue = this.operand.evaluate(context);

        switch (this.operator)
        {
            case UnaryOperator.Plus:
                return operandValue;

            case UnaryOperator.Minus:
            {
                if (operandValue.type === EduBasicType.Integer)
                {
                    return { type: EduBasicType.Integer, value: -operandValue.value };
                }
                else if (operandValue.type === EduBasicType.Real)
                {
                    return { type: EduBasicType.Real, value: -operandValue.value };
                }
                else if (operandValue.type === EduBasicType.Complex)
                {
                    return {
                        type: EduBasicType.Complex,
                        value: {
                            real: -operandValue.value.real,
                            imaginary: -operandValue.value.imaginary
                        }
                    };
                }
                
                throw new Error(`Cannot negate ${operandValue.type}`);
            }

            default:
                throw new Error(`Unknown unary operator: ${this.operator}`);
        }
    }

    public toString(): string
    {
        return `${this.operator}${this.operand.toString()}`;
    }
}

