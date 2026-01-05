import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class GosubStatement extends Statement
{
    public constructor(
        public readonly labelName: string
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('GOSUB requires Program for label lookup and return stack - needs refactoring');
    }

    public toString(): string
    {
        return `GOSUB ${this.labelName}`;
    }
}

