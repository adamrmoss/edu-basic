import { Expression } from './expression';
import { EduBasicValue } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';
import { Constant, ConstantEvaluator } from './helpers/constant-evaluator';

/**
 * Expression node that evaluates a built-in constant keyword.
 */
export class NullaryExpression extends Expression
{
    private readonly constantEvaluator = new ConstantEvaluator();

    /**
     * Constant keyword evaluated by this node.
     */
    public readonly constant: Constant;

    /**
     * Create a new constant expression.
     *
     * @param constant Constant keyword to evaluate.
     */
    public constructor(constant: Constant)
    {
        super();
        this.constant = constant;
    }

    /**
     * Evaluate the constant in the current context.
     *
     * @param context Execution context used by some constants (e.g. time-related keywords).
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return this.constantEvaluator.evaluate(this.constant, context);
    }

    /**
     * Format the constant keyword as an expression string.
     *
     * @param omitOuterParens Whether outer parentheses should be omitted when possible.
     * @returns A source-like string representation.
     */
    public toString(omitOuterParens?: boolean): string
    {
        return this.constant;
    }
}
