import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class ElseStatement extends Statement
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
        // ELSE is handled by block structure analysis, not executed directly
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return 'ELSE';
    }
}

