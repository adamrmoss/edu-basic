import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { valueToString } from '../../edu-basic-value';

/**
 * Implements the `THROW` statement.
 */
export class ThrowStatement extends Statement
{
    /**
     * Message expression.
     */
    public readonly message: Expression;

    /**
     * Create a new `THROW` statement.
     *
     * @param message Message expression.
     */
    public constructor(message: Expression)
    {
        super();
        this.message = message;
    }

    /**
     * Execute the statement.
     *
     * @throws Always throws an error containing the message.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const messageValue = this.message.evaluate(context);
        // Evaluate message and throw so TRY/CATCH can catch.
        throw new Error(valueToString(messageValue));
    }

    public override toString(): string
    {
        return `THROW ${this.message.toString()}`;
    }
}
