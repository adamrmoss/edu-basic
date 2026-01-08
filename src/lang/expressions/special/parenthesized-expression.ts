import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class ParenthesizedExpression extends Expression
{
    public constructor(
        public readonly innerExpression: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return this.innerExpression.evaluate(context);
    }

    public toString(): string
    {
        return `(${this.innerExpression.toString()})`;
    }
}

