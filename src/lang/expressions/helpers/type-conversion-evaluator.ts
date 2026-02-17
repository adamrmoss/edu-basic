import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { UnaryOperator } from '../unary-expression';

/**
 * Evaluator for type conversion unary operators.
 */
export class TypeConversionEvaluator
{
    /**
     * Evaluate a type conversion unary operator.
     *
     * @param operator Unary operator to evaluate.
     * @param argValue Argument value.
     * @returns The evaluated runtime value.
     */
    public evaluate(operator: UnaryOperator, argValue: EduBasicValue): EduBasicValue
    {
        // INT/STR/VAL/HEX/BIN: coerce to integer, string, real, or hex/binary string.
        switch (operator)
        {
            case UnaryOperator.Int:
            {
                switch (argValue.type)
                {
                    case EduBasicType.Integer:
                        return argValue;
                    case EduBasicType.Real:
                        return { type: EduBasicType.Integer, value: Math.trunc(argValue.value) };
                    case EduBasicType.String:
                    {
                        const parsed = parseFloat(argValue.value);
                        if (isNaN(parsed))
                        {
                            throw new Error(`Cannot convert string "${argValue.value}" to integer`);
                        }
                        return { type: EduBasicType.Integer, value: Math.trunc(parsed) };
                    }
                    default:
                        throw new Error(`Cannot convert ${argValue.type} to integer`);
                }
            }
            case UnaryOperator.Str:
            {
                switch (argValue.type)
                {
                    case EduBasicType.Integer:
                    case EduBasicType.Real:
                        return { type: EduBasicType.String, value: argValue.value.toString() };
                    case EduBasicType.String:
                        return argValue;
                    case EduBasicType.Complex:
                        const real = argValue.value.real;
                        const imag = argValue.value.imaginary;
                        const sign = imag >= 0 ? '+' : '';
                        return { type: EduBasicType.String, value: `${real}${sign}${imag}i` };
                    default:
                        throw new Error(`Cannot convert ${argValue.type} to string`);
                }
            }
            case UnaryOperator.Val:
            {
                if (argValue.type !== EduBasicType.String)
                {
                    throw new Error(`VAL requires string operand, got ${argValue.type}`);
                }
                const parsed = parseFloat(argValue.value);
                if (isNaN(parsed))
                {
                    return { type: EduBasicType.Real, value: 0 };
                }
                return { type: EduBasicType.Real, value: parsed };
            }
            case UnaryOperator.Hex:
            {
                const num = this.toInteger(argValue);
                if (num < 0)
                {
                    throw new Error(`HEX argument must be non-negative, got ${num}`);
                }
                return { type: EduBasicType.String, value: num.toString(16).toUpperCase() };
            }
            case UnaryOperator.Bin:
            {
                const num = this.toInteger(argValue);
                if (num < 0)
                {
                    throw new Error(`BIN argument must be non-negative, got ${num}`);
                }
                return { type: EduBasicType.String, value: num.toString(2) };
            }
            default:
                throw new Error(`Unknown type conversion operator: ${operator}`);
        }
    }

    private toInteger(value: EduBasicValue): number
    {
        switch (value.type)
        {
            case EduBasicType.Integer:
                return value.value;
            case EduBasicType.Real:
                return Math.trunc(value.value);
            default:
                throw new Error(`Cannot convert ${value.type} to integer`);
        }
    }
}
