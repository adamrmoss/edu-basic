import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class CaseStatement extends Statement
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
        // CASE is handled by SELECT CASE execution logic
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return 'CASE';
    }
}

