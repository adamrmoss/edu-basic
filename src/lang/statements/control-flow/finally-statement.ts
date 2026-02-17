import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Implements the `FINALLY` statement.
 */
export class FinallyStatement extends Statement
{
    public constructor()
    {
        super();
    }

    /**
     * Get the editor indent adjustment.
     *
     * @returns Indent delta for this statement.
     */
    public override getIndentAdjustment(): number
    {
        return 0;
    }

    public override getDisplayIndentAdjustment(): number
    {
        return -1;
    }

    /**
     * Execute the statement.
     *
     * `FINALLY` is a structural statement; runtime flow is coordinated by the surrounding `TRY` frame.
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
        // Structural; runtime coordinates TRY/FINALLY flow via control frames.
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'FINALLY';
    }
}
