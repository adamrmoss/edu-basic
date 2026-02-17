import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Implements the `RETURN` statement.
 */
export class ReturnStatement extends Statement
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
        // Signal the runtime to pop the call frame and jump to the return address.
        return { result: ExecutionResult.Return };
    }

    public override toString(): string
    {
        return 'RETURN';
    }
}
