import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class ShiftStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly targetVariable: string | null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement SHIFT statement
        // - Remove first element from array
        // - Optionally store in target variable
        throw new Error('SHIFT statement not yet implemented');
    }

    public toString(): string
    {
        if (this.targetVariable)
        {
            return `SHIFT ${this.arrayVariable}, ${this.targetVariable}`;
        }

        return `SHIFT ${this.arrayVariable}`;
    }
}

