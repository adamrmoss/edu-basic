import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class LabelStatement extends Statement
{
    public constructor(
        public readonly labelName: string
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return `LABEL ${this.labelName}`;
    }
}
