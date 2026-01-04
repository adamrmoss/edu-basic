import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class SleepStatement extends Statement
{
    public constructor(
        public readonly milliseconds: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement SLEEP statement
        // - Evaluate milliseconds expression
        // - Pause execution for specified duration
        // Note: This will need async/await support or a different execution model
        throw new Error('SLEEP statement not yet implemented');
    }

    public toString(): string
    {
        return `SLEEP ${this.milliseconds.toString()}`;
    }
}

