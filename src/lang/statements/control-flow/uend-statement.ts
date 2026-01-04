import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class UendStatement extends Statement
{
    public constructor()
    {
        super();
    }

    public getIndentAdjustment(): number
    {
        return -1;
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // UEND is handled by loop execution logic
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return 'UEND';
    }
}

