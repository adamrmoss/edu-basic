import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class GosubStatement extends Statement
{
    public constructor(
        public readonly labelName: string
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement GOSUB with return stack
        // Need to push current position onto return stack
        // Then jump to label like GOTO
        throw new Error('GOSUB statement not yet implemented');
    }

    public toString(): string
    {
        return `GOSUB ${this.labelName}`;
    }
}

