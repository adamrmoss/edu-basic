import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class ThrowStatement extends Statement
{
    public constructor(
        public readonly message: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement THROW
        // Evaluate message expression and throw an exception
        const messageValue = this.message.evaluate(context);
        throw new Error(messageValue.value?.toString() ?? 'Thrown error');
    }

    public toString(): string
    {
        return `THROW ${this.message.toString()}`;
    }
}

