import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { valueToString } from '../../edu-basic-value';

/**
 * Implements the `CONSOLE` statement.
 */
export class ConsoleStatement extends Statement
{
    /**
     * Expression producing the value to print.
     */
    public readonly expression: Expression;

    /**
     * Create a new `CONSOLE` statement.
     *
     * @param expression Expression producing the value to print.
     */
    public constructor(expression: Expression)
    {
        super();
        this.expression = expression;
    }

    /**
     * Execute the statement.
     *
     * @returns Execution status.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        // Get console service; if absent no-op; else evaluate expression, stringify, and print to console.
        const consoleService = runtime.getConsoleService();

        if (!consoleService)
        {
            return { result: ExecutionResult.Continue };
        }

        const value = this.expression.evaluate(context);
        const text = valueToString(value);

        consoleService.printOutput(text);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `CONSOLE ${this.expression.toString()}`;
    }
}
