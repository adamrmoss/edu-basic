import { Expression } from './expression';
import { EduBasicValue, EduBasicType, ComplexValue } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

export enum BinaryOperator
{
    // Arithmetic
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    Divide = '/',
    Modulo = 'MOD',
    Power = '^',
    PowerAlt = '**',
    
    // Comparison
    Equal = '=',
    NotEqual = '<>',
    LessThan = '<',
    GreaterThan = '>',
    LessThanOrEqual = '<=',
    GreaterThanOrEqual = '>=',
    
    // Logical
    And = 'AND',
    Or = 'OR',
    Xor = 'XOR',
    Nand = 'NAND',
    Nor = 'NOR',
    Xnor = 'XNOR',
    Imp = 'IMP',
}

export enum BinaryOperatorCategory
{
    Arithmetic,
    Comparison,
    Logical,
}

export class BinaryExpression extends Expression
{
    public constructor(
        public readonly left: Expression,
        public readonly operator: BinaryOperator,
        public readonly right: Expression,
        public readonly category: BinaryOperatorCategory
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const leftValue = this.left.evaluate(context);
        const rightValue = this.right.evaluate(context);

        switch (this.category)
        {
            case BinaryOperatorCategory.Arithmetic:
                return this.evaluateArithmetic(leftValue, rightValue);
            case BinaryOperatorCategory.Comparison:
                return this.evaluateComparison(leftValue, rightValue);
            case BinaryOperatorCategory.Logical:
                return this.evaluateLogical(leftValue, rightValue);
            default:
                throw new Error(`Unknown binary operator category: ${this.category}`);
        }
    }

    private evaluateArithmetic(leftValue: EduBasicValue, rightValue: EduBasicValue): EduBasicValue
    {
        // Handle complex numbers
        if (leftValue.type === EduBasicType.Complex || rightValue.type === EduBasicType.Complex)
        {
            return this.evaluateComplexArithmetic(leftValue, rightValue);
        }

        switch (this.operator)
        {
            case BinaryOperator.Add:
                if (leftValue.type === EduBasicType.String && rightValue.type === EduBasicType.String)
                {
                    return { type: EduBasicType.String, value: leftValue.value + rightValue.value };
                }
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

            case BinaryOperator.Subtract:
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

            case BinaryOperator.Multiply:
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

            case BinaryOperator.Divide:
            {
                const l = this.toNumber(leftValue);
                const r = this.toNumber(rightValue);
                
                if (r === 0)
                {
                    throw new Error('Division by zero');
                }
                
                const result = l / r;
                
                // If result is a whole number and both operands were integers, return Integer
                if (leftValue.type === EduBasicType.Integer && rightValue.type === EduBasicType.Integer)
                {
                    if (Number.isInteger(result))
                    {
                        return { type: EduBasicType.Integer, value: result };
                    }
                }
                
                return { type: EduBasicType.Real, value: result };
            }

            case BinaryOperator.Modulo:
            {
                const l = this.toNumber(leftValue);
                const r = this.toNumber(rightValue);
                
                if (r === 0)
                {
                    throw new Error('Modulo by zero');
                }
                
                return { type: EduBasicType.Integer, value: Math.floor(l) % Math.floor(r) };
            }

            case BinaryOperator.Power:
            case BinaryOperator.PowerAlt:
            {
                const l = this.toNumber(leftValue);
                const r = this.toNumber(rightValue);
                return { type: EduBasicType.Real, value: Math.pow(l, r) };
            }

            default:
                throw new Error(`Unknown arithmetic operator: ${this.operator}`);
        }
    }

    private evaluateComplexArithmetic(leftValue: EduBasicValue, rightValue: EduBasicValue): EduBasicValue
    {
        const left = this.toComplex(leftValue);
        const right = this.toComplex(rightValue);

        switch (this.operator)
        {
            case BinaryOperator.Add:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: left.real + right.real,
                        imaginary: left.imaginary + right.imaginary
                    }
                };

            case BinaryOperator.Subtract:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: left.real - right.real,
                        imaginary: left.imaginary - right.imaginary
                    }
                };

            case BinaryOperator.Multiply:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: left.real * right.real - left.imaginary * right.imaginary,
                        imaginary: left.real * right.imaginary + left.imaginary * right.real
                    }
                };

            case BinaryOperator.Divide:
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

            case BinaryOperator.Modulo:
                throw new Error('Modulo operator is not applicable to complex numbers');

            case BinaryOperator.Power:
            case BinaryOperator.PowerAlt:
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

    private evaluateComparison(leftValue: EduBasicValue, rightValue: EduBasicValue): EduBasicValue
    {
        let result: boolean;

        if (leftValue.type === EduBasicType.String && rightValue.type === EduBasicType.String)
        {
            switch (this.operator)
            {
                case BinaryOperator.Equal:
                    result = leftValue.value === rightValue.value;
                    break;
                case BinaryOperator.NotEqual:
                    result = leftValue.value !== rightValue.value;
                    break;
                case BinaryOperator.LessThan:
                    result = leftValue.value < rightValue.value;
                    break;
                case BinaryOperator.GreaterThan:
                    result = leftValue.value > rightValue.value;
                    break;
                case BinaryOperator.LessThanOrEqual:
                    result = leftValue.value <= rightValue.value;
                    break;
                case BinaryOperator.GreaterThanOrEqual:
                    result = leftValue.value >= rightValue.value;
                    break;
                default:
                    throw new Error(`Unknown comparison operator: ${this.operator}`);
            }
        }
        else if (leftValue.type === EduBasicType.Complex || rightValue.type === EduBasicType.Complex)
        {
            throw new Error('Comparison operators are not applicable to complex numbers');
        }
        else
        {
            const l = this.toNumber(leftValue);
            const r = this.toNumber(rightValue);

            switch (this.operator)
            {
                case BinaryOperator.Equal:
                    result = l === r;
                    break;
                case BinaryOperator.NotEqual:
                    result = l !== r;
                    break;
                case BinaryOperator.LessThan:
                    result = l < r;
                    break;
                case BinaryOperator.GreaterThan:
                    result = l > r;
                    break;
                case BinaryOperator.LessThanOrEqual:
                    result = l <= r;
                    break;
                case BinaryOperator.GreaterThanOrEqual:
                    result = l >= r;
                    break;
                default:
                    throw new Error(`Unknown comparison operator: ${this.operator}`);
            }
        }

        return { type: EduBasicType.Integer, value: result ? -1 : 0 };
    }

    private evaluateLogical(leftValue: EduBasicValue, rightValue: EduBasicValue): EduBasicValue
    {
        const l = Math.floor(this.toNumber(leftValue));
        const r = Math.floor(this.toNumber(rightValue));

        switch (this.operator)
        {
            case BinaryOperator.And:
                return { type: EduBasicType.Integer, value: l & r };
            case BinaryOperator.Or:
                return { type: EduBasicType.Integer, value: l | r };
            case BinaryOperator.Xor:
                return { type: EduBasicType.Integer, value: l ^ r };
            case BinaryOperator.Nand:
                return { type: EduBasicType.Integer, value: ~(l & r) };
            case BinaryOperator.Nor:
                return { type: EduBasicType.Integer, value: ~(l | r) };
            case BinaryOperator.Xnor:
                return { type: EduBasicType.Integer, value: ~(l ^ r) };
            case BinaryOperator.Imp:
                return { type: EduBasicType.Integer, value: ~l | r };
            default:
                throw new Error(`Unknown logical operator: ${this.operator}`);
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

    private toComplex(value: EduBasicValue): ComplexValue
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

    public toString(omitOuterParens: boolean = false): string
    {
        const result = `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
        return omitOuterParens ? result : `(${result})`;
    }
}
