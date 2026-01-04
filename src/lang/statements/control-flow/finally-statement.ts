import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class FinallyStatement extends Statement
{
    public constructor()
    {
        super();
    }

    public getIndentAdjustment(): number
    {
        return 0;
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // FINALLY is handled by TRY execution logic
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return 'FINALLY';
    }
}

