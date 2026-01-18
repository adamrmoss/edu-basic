import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class ComplexLiteralExpression extends Expression
{
    public constructor(
        public readonly real: number,
        public readonly imaginary: number
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return {
            type: EduBasicType.Complex,
            value: { real: this.real, imaginary: this.imaginary }
        };
    }

    public toString(): string
    {
        const sign = this.imaginary >= 0 ? '+' : '';
        return `(${this.real}${sign}${this.imaginary}i)`;
    }
}
