import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

/**
 * Expression node that preserves explicit parentheses for grouping.
 */
export class ParenthesizedExpression extends Expression
{
    /**
     * Inner expression wrapped by parentheses.
     */
    public readonly innerExpression: Expression;

    /**
     * Create a new parenthesized expression.
     *
     * @param innerExpression Inner expression to evaluate.
     */
    public constructor(innerExpression: Expression)
    {
        super();
        this.innerExpression = innerExpression;
    }

    /**
     * Evaluate the inner expression.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return this.innerExpression.evaluate(context);
    }

    /**
     * Format with explicit parentheses.
     *
     * @param omitOuterParens Whether outer parentheses should be omitted when possible.
     * @returns A source-like string representation.
     */
    public toString(omitOuterParens?: boolean): string
    {
        // Parentheses are explicit grouping in EduBASIC. We always re-emit them.
        // However, we avoid adding a redundant second pair when the inner expression
        // already adds outer parentheses for safety (e.g. BinaryExpression).
        return `(${this.innerExpression.toString()})`;
    }
}
