import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class TurtleStatement extends Statement
{
    public constructor(
        public readonly commands: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('TURTLE statement not yet implemented');
    }

    public toString(): string
    {
        return `TURTLE ${this.commands.toString()}`;
    }
}

