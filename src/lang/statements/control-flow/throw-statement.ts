import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { valueToString } from '../../edu-basic-value';

export class ThrowStatement extends Statement
{
    public constructor(
        public readonly message: Expression
    )
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const messageValue = this.message.evaluate(context);
        throw new Error(valueToString(messageValue));
    }

    public override toString(): string
    {
        return `THROW ${this.message.toString()}`;
    }
}

