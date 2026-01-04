import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class EndStatement extends Statement
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
        return { result: ExecutionResult.End };
    }

    public toString(): string
    {
        return 'END';
    }
}
