import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `SLEEP` statement.
 */
export class SleepStatement extends Statement
{
    /**
     * Milliseconds expression.
     */
    public readonly milliseconds: Expression;

    /**
     * Create a new `SLEEP` statement.
     *
     * @param milliseconds Milliseconds expression.
     */
    public constructor(milliseconds: Expression)
    {
        super();
        this.milliseconds = milliseconds;
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
        const value = this.milliseconds.evaluate(context);
        if (value.type !== EduBasicType.Integer && value.type !== EduBasicType.Real)
        {
            throw new Error('SLEEP: milliseconds must be a number');
        }

        const ms = Math.max(0, Math.floor(value.value as number));
        runtime.sleep(ms);
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `SLEEP ${this.milliseconds.toString()}`;
    }
}
