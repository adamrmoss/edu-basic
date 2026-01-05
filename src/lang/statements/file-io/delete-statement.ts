import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class DeleteStatement extends Statement
{
    public constructor(
        public readonly filename: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('DELETE statement not yet implemented');
    }

    public toString(): string
    {
        return `DELETE ${this.filename.toString()}`;
    }
}

