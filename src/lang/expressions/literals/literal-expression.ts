import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class LiteralExpression extends Expression
{
    public constructor(
        public readonly value: EduBasicValue
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return this.value;
    }

    public toString(): string
    {
        switch (this.value.type)
        {
            case EduBasicType.Integer:
                return this.value.value.toString();
            case EduBasicType.Real:
                return this.value.value.toString();
            case EduBasicType.Complex:
                const real = this.value.value.real;
                const imag = this.value.value.imaginary;
                const sign = imag >= 0 ? '+' : '';
                return `${real}${sign}${imag}i`;
            case EduBasicType.String:
                return `"${this.value.value}"`;
            default:
                return String(this.value.value);
        }
    }
}

