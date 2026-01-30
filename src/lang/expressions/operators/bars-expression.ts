import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class BarsExpression extends Expression
{
    public constructor(public readonly operand: Expression)
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const value = this.operand.evaluate(context);

        switch (value.type)
        {
            case EduBasicType.Integer:
                return { type: EduBasicType.Integer, value: Math.abs(value.value) };
            case EduBasicType.Real:
                return { type: EduBasicType.Real, value: Math.abs(value.value) };
            case EduBasicType.String:
                return { type: EduBasicType.Integer, value: value.value.length };
            case EduBasicType.Array:
                return { type: EduBasicType.Integer, value: value.value.length };
            case EduBasicType.Complex:
            {
                const real = value.value.real;
                const imag = value.value.imaginary;
                return { type: EduBasicType.Real, value: Math.sqrt(real * real + imag * imag) };
            }
            case EduBasicType.Structure:
                throw new Error('Cannot apply | | operator to a structure');
        }
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `| ${this.operand.toString()} |`;
    }
}
