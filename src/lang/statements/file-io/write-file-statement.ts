import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class WriteFileStatement extends Statement
{
    public constructor(
        public readonly expression: Expression,
        public readonly fileHandle: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('WRITE statement not yet implemented');
    }

    public toString(): string
    {
        return `WRITE ${this.expression.toString()} TO ${this.fileHandle.toString()}`;
    }
}

