import { RuntimeNode } from '../runtime-node';
import { EduBasicValue } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

/**
 * Base type for EduBASIC expression AST nodes.
 */
export abstract class Expression extends RuntimeNode
{
    /**
     * Evaluate this expression in the given execution context.
     *
     * @param context Execution context to read variables and runtime state from.
     * @returns The evaluated runtime value.
     */
    public abstract evaluate(context: ExecutionContext): EduBasicValue;

    /**
     * Return a lightweight source-like representation of this expression.
     *
     * @param omitOuterParens Whether outer parentheses should be omitted when possible.
     * @returns A string representation of the expression.
     */
    public abstract override toString(omitOuterParens?: boolean): string;
}
