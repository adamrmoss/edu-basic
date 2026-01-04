import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class CatchStatement extends Statement
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
        // CATCH is handled by TRY execution logic
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return 'CATCH';
    }
}

