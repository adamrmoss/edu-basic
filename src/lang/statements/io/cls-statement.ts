import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Implements the `CLS` statement.
 */
export class ClsStatement extends Statement
{
    public constructor()
    {
        super();
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
        // Clear the graphics buffer and switch to output tab so the user sees the result.
        graphics.clear();
        runtime.requestTabSwitch('output');
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'CLS';
    }
}
