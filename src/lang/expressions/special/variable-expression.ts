import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

/**
 * Expression node that resolves a variable name from the execution context.
 */
export class VariableExpression extends Expression
{
    /**
     * Variable name to lookup (including any type sigil / rank suffix).
     */
    public readonly name: string;

    /**
     * Create a new variable expression.
     *
     * @param name Variable name to lookup.
     */
    public constructor(name: string)
    {
        super();
        this.name = name;
    }

    /**
     * Evaluate to the current value of the named variable.
     *
     * @param context Execution context to read variables from.
     * @returns The current runtime value for the variable name.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return context.getVariable(this.name);
    }

    /**
     * Format the variable name as an expression string.
     *
     * @param omitOuterParens Whether outer parentheses should be omitted when possible.
     * @returns A source-like string representation.
     */
    public toString(omitOuterParens?: boolean): string
    {
        return this.name;
    }
}
