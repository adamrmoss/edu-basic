import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class ListdirStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly path: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('LISTDIR statement not yet implemented');
    }

    public toString(): string
    {
        return `LISTDIR ${this.arrayVariable} FROM ${this.path.toString()}`;
    }
}

