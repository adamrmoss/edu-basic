import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class NextStatement extends Statement
{
    public constructor(
        public readonly variableName: string | null
    )
    {
        super();
    }

    public getIndentAdjustment(): number
    {
        return -1;
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // NEXT is handled by loop execution logic
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        if (this.variableName)
        {
            return `NEXT ${this.variableName}`;
        }

        return 'NEXT';
    }
}

