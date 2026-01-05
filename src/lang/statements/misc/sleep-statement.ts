import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class SleepStatement extends Statement
{
    public constructor(
        public readonly milliseconds: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('SLEEP statement not yet implemented');
    }

    public toString(): string
    {
        return `SLEEP ${this.milliseconds.toString()}`;
    }
}

