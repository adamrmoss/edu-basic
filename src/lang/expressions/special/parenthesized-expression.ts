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

    public toString(omitOuterParens?: boolean): string
    {
        // Parentheses are explicit grouping in EduBASIC. We always re-emit them.
        // However, we avoid adding a redundant second pair when the inner expression
        // already adds outer parentheses for safety (e.g. BinaryExpression).
        return `(${this.innerExpression.toString()})`;
    }
}
