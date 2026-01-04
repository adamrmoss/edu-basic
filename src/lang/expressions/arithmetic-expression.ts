import { Expression } from './expression';
import { EduBasicValue, EduBasicType } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

export enum ArithmeticOperator
{
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    Divide = '/',
    Modulo = 'MOD',
    Power = '^',
    PowerAlt = '**',
}

export class ArithmeticExpression extends Expression
{
    public constructor(
        public readonly left: Expression,
        public readonly operator: ArithmeticOperator,
        public readonly right: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const leftValue = this.left.evaluate(context);
        const rightValue = this.right.evaluate(context);

        switch (this.operator)
        {
            case ArithmeticOperator.Add:
                if (leftValue.type === EduBasicType.Integer && rightValue.type === EduBasicType.Integer)
                {
                    return { type: EduBasicType.Integer, value: leftValue.value + rightValue.value };
                }
                else
                {
                    const l = this.toNumber(leftValue);
                    const r = this.toNumber(rightValue);
                    return { type: EduBasicType.Real, value: l + r };
                }

            case ArithmeticOperator.Subtract:
                if (leftValue.type === EduBasicType.Integer && rightValue.type === EduBasicType.Integer)
                {
                    return { type: EduBasicType.Integer, value: leftValue.value - rightValue.value };
                }
                else
                {
                    const l = this.toNumber(leftValue);
                    const r = this.toNumber(rightValue);
                    return { type: EduBasicType.Real, value: l - r };
                }

            case ArithmeticOperator.Multiply:
                if (leftValue.type === EduBasicType.Integer && rightValue.type === EduBasicType.Integer)
                {
                    return { type: EduBasicType.Integer, value: leftValue.value * rightValue.value };
                }
                else
                {
                    const l = this.toNumber(leftValue);
                    const r = this.toNumber(rightValue);
                    return { type: EduBasicType.Real, value: l * r };
                }

            case ArithmeticOperator.Divide:
            {
                const l = this.toNumber(leftValue);
                const r = this.toNumber(rightValue);
                
                if (r === 0)
                {
                    throw new Error('Division by zero');
                }
                
                return { type: EduBasicType.Real, value: l / r };
            }

            case ArithmeticOperator.Modulo:
            {
                const l = this.toNumber(leftValue);
                const r = this.toNumber(rightValue);
                
                if (r === 0)
                {
                    throw new Error('Modulo by zero');
                }
                
                return { type: EduBasicType.Integer, value: Math.floor(l) % Math.floor(r) };
            }

            case ArithmeticOperator.Power:
            case ArithmeticOperator.PowerAlt:
            {
                const l = this.toNumber(leftValue);
                const r = this.toNumber(rightValue);
                return { type: EduBasicType.Real, value: Math.pow(l, r) };
            }

            default:
                throw new Error(`Unknown arithmetic operator: ${this.operator}`);
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
        return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
    }
}
