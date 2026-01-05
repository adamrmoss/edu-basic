import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class SeekStatement extends Statement
{
    public constructor(
        public readonly position: Expression,
        public readonly fileHandle: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('SEEK statement not yet implemented');
    }

    public toString(): string
    {
        return `SEEK ${this.position.toString()} IN #${this.fileHandle.toString()}`;
    }
}

