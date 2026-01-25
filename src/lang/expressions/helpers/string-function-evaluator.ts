import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { UnaryOperator } from '../unary-expression';

export class StringFunctionEvaluator
{
    public evaluate(operator: UnaryOperator, argValue: EduBasicValue): EduBasicValue
    {
        switch (operator)
        {
            case UnaryOperator.Asc:
            {
                if (argValue.type !== EduBasicType.String)
                {
                    throw new Error(`ASC requires string operand, got ${argValue.type}`);
                }
                const str = argValue.value;
                if (str.length === 0)
                {
                    return { type: EduBasicType.Integer, value: 0 };
                }
                return { type: EduBasicType.Integer, value: str.charCodeAt(0) };
            }
            case UnaryOperator.Chr:
            {
                const num = this.toInteger(argValue);
                if (num < 0 || num > 0xFFFF)
                {
                    throw new Error(`CHR argument out of range: ${num}`);
                }
                return { type: EduBasicType.String, value: String.fromCharCode(num) };
            }
            case UnaryOperator.Ucase:
            {
                if (argValue.type !== EduBasicType.String)
                {
                    throw new Error(`UCASE requires string operand, got ${argValue.type}`);
                }
                return { type: EduBasicType.String, value: argValue.value.toUpperCase() };
            }
            case UnaryOperator.Lcase:
            {
                if (argValue.type !== EduBasicType.String)
                {
                    throw new Error(`LCASE requires string operand, got ${argValue.type}`);
                }
                return { type: EduBasicType.String, value: argValue.value.toLowerCase() };
            }
            case UnaryOperator.Ltrim:
            {
                if (argValue.type !== EduBasicType.String)
                {
                    throw new Error(`LTRIM requires string operand, got ${argValue.type}`);
                }
                return { type: EduBasicType.String, value: argValue.value.replace(/^\s+/, '') };
            }
            case UnaryOperator.Rtrim:
            {
                if (argValue.type !== EduBasicType.String)
                {
                    throw new Error(`RTRIM requires string operand, got ${argValue.type}`);
                }
                return { type: EduBasicType.String, value: argValue.value.replace(/\s+$/, '') };
            }
            case UnaryOperator.Trim:
            {
                if (argValue.type !== EduBasicType.String)
                {
                    throw new Error(`TRIM requires string operand, got ${argValue.type}`);
                }
                return { type: EduBasicType.String, value: argValue.value.trim() };
            }
            case UnaryOperator.Reverse:
            {
                if (argValue.type !== EduBasicType.String)
                {
                    throw new Error(`REVERSE requires string operand, got ${argValue.type}`);
                }
                return { type: EduBasicType.String, value: argValue.value.split('').reverse().join('') };
            }
            default:
                throw new Error(`Unknown string manipulation operator: ${operator}`);
        }
    }

    private toInteger(value: EduBasicValue): number
    {
        if (value.type === EduBasicType.Integer)
        {
            return value.value;
        }
        if (value.type === EduBasicType.Real)
        {
            return Math.trunc(value.value);
        }
        throw new Error(`Cannot convert ${value.type} to integer`);
    }
}
