import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class PutStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly x: Expression,
        public readonly y: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('PUT statement not yet implemented');
    }

    public toString(): string
    {
        return `PUT ${this.arrayVariable} AT (${this.x.toString()}, ${this.y.toString()})`;
    }
}

