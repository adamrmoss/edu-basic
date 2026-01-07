import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class FinallyStatement extends Statement
{
    public constructor()
    {
        super();
    }

    public override getIndentAdjustment(): number
    {
        return 0;
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'FINALLY';
    }
}

