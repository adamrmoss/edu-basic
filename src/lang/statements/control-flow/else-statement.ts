import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Implements the `ELSE` statement.
 */
export class ElseStatement extends Statement
{
    public constructor()
    {
        super();
    }

    public override getIndentAdjustment(): number
    {
        return 0;
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
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        const top = runtime.getCurrentControlFrame();
        if (!top || (top.type !== 'if' && top.type !== 'unless'))
        {
            throw new Error('ELSE without IF/UNLESS');
        }

        if (top.branchTaken)
        {
            return { result: ExecutionResult.Goto, gotoTarget: top.endLine };
        }

        top.branchTaken = true;
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'ELSE';
    }
}
