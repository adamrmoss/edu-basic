import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class PopStatement extends Statement
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
        // TODO: Implement POP statement
        // - Remove last element from array
        // - Optionally store in target variable
        throw new Error('POP statement not yet implemented');
    }

    public toString(): string
    {
        if (this.targetVariable)
        {
            return `POP ${this.arrayVariable}, ${this.targetVariable}`;
        }

        return `POP ${this.arrayVariable}`;
    }
}

