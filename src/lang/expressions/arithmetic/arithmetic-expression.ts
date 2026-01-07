import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

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

        // Handle complex numbers
        if (leftValue.type === EduBasicType.Complex || rightValue.type === EduBasicType.Complex)
        {
            return this.evaluateComplex(leftValue, rightValue);
        }

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

    private evaluateComplex(leftValue: EduBasicValue, rightValue: EduBasicValue): EduBasicValue
    {
        const left = this.toComplex(leftValue);
        const right = this.toComplex(rightValue);

        switch (this.operator)
        {
            case ArithmeticOperator.Add:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: left.real + right.real,
                        imaginary: left.imaginary + right.imaginary
                    }
                };

            case ArithmeticOperator.Subtract:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: left.real - right.real,
                        imaginary: left.imaginary - right.imaginary
                    }
                };

            case ArithmeticOperator.Multiply:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: left.real * right.real - left.imaginary * right.imaginary,
                        imaginary: left.real * right.imaginary + left.imaginary * right.real
                    }
                };

            case ArithmeticOperator.Divide:
            {
                const denominator = right.real * right.real + right.imaginary * right.imaginary;
                if (denominator === 0)
                {
                    throw new Error('Division by zero');
                }
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: (left.real * right.real + left.imaginary * right.imaginary) / denominator,
                        imaginary: (left.imaginary * right.real - left.real * right.imaginary) / denominator
                    }
                };
            }

            case ArithmeticOperator.Modulo:
                throw new Error('Modulo operator is not applicable to complex numbers');

            case ArithmeticOperator.Power:
            case ArithmeticOperator.PowerAlt:
            {
                // z^w = exp(w * log(z))
                const logZ = {
                    real: Math.log(Math.sqrt(left.real * left.real + left.imaginary * left.imaginary)),
                    imaginary: Math.atan2(left.imaginary, left.real)
                };
                const wLogZ = {
                    real: right.real * logZ.real - right.imaginary * logZ.imaginary,
                    imaginary: right.real * logZ.imaginary + right.imaginary * logZ.real
                };
                const expReal = Math.exp(wLogZ.real);
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: expReal * Math.cos(wLogZ.imaginary),
                        imaginary: expReal * Math.sin(wLogZ.imaginary)
                    }
                };
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

    private toComplex(value: EduBasicValue): { real: number; imaginary: number }
    {
        if (value.type === EduBasicType.Complex)
        {
            return value.value;
        }
        else if (value.type === EduBasicType.Integer || value.type === EduBasicType.Real)
        {
            return { real: value.value, imaginary: 0 };
        }
        
        throw new Error(`Cannot convert ${value.type} to complex number`);
    }

    public toString(): string
    {
        return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
    }
}

