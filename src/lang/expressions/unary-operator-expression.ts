import { Expression } from './expression';
import { EduBasicValue, EduBasicType } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

export enum UnaryOperator
{
    Plus = '+',
    Minus = '-',
    Factorial = '!',
}

export class UnaryOperatorExpression extends Expression
{
    public constructor(
        public readonly operator: UnaryOperator,
        public readonly operand: Expression,
        public readonly isPostfix: boolean = false
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

            case UnaryOperator.Factorial:
            {
                const n = Math.floor(this.toNumber(operandValue));
                
                if (n < 0)
                {
                    throw new Error('Factorial of negative number');
                }
                
                let result = 1;
                
                for (let i = 2; i <= n; i++)
                {
                    result *= i;
                }
                
                return { type: EduBasicType.Integer, value: result };
            }

            default:
                throw new Error(`Unknown unary operator: ${this.operator}`);
        }
    }

    private toNumber(value: EduBasicValue): number
    {
        if (value.type === EduBasicType.Integer || value.type === EduBasicType.Real)
        {
            return value.value;
        }
        
        throw new Error(`Cannot convert ${value.type} to number`);
    }

    public toString(): string
    {
        if (this.isPostfix)
        {
            return `${this.operand.toString()}${this.operator}`;
        }
        
        return `${this.operator}${this.operand.toString()}`;
    }
}
