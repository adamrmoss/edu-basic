import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class ThrowStatement extends Statement
{
    public constructor(
        public readonly message: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const messageValue = this.message.evaluate(context);
        throw new Error(messageValue.value?.toString() ?? 'Thrown error');
    }

    public toString(): string
    {
        return `THROW ${this.message.toString()}`;
    }
}

