import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class RmdirStatement extends Statement
{
    public constructor(
        public readonly path: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('RMDIR statement not yet implemented');
    }

    public toString(): string
    {
        return `RMDIR ${this.path.toString()}`;
    }
}

