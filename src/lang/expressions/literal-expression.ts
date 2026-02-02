import { Expression } from './expression';
import { EduBasicValue, valueToExpressionString } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

/**
 * Expression node that wraps a runtime literal value.
 */
export class LiteralExpression extends Expression
{
    /**
     * Literal value represented by this node.
     */
    public readonly value: EduBasicValue;

    /**
     * Create a new literal expression.
     *
     * @param value Literal runtime value.
     */
    public constructor(value: EduBasicValue)
    {
        super();
        this.value = value;
    }

    /**
     * Evaluate to the literal value.
     *
     * @param context Execution context (unused for literals).
     * @returns The literal runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return this.value;
    }

    /**
     * Format the literal as an expression string.
     *
     * @param omitOuterParens Whether outer parentheses should be omitted when possible.
     * @returns A source-like string representation.
     */
    public toString(omitOuterParens?: boolean): string
    {
        return valueToExpressionString(this.value);
    }
}
