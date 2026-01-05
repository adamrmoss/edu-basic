import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class MkdirStatement extends Statement
{
    public constructor(
        public readonly path: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('MKDIR statement not yet implemented');
    }

    public toString(): string
    {
        return `MKDIR ${this.path.toString()}`;
    }
}

