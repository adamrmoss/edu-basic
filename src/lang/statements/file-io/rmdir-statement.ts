import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class RmdirStatement extends Statement
{
    public constructor(
        public readonly path: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement RMDIR statement
        // - Evaluate path
        // - Remove directory
        throw new Error('RMDIR statement not yet implemented');
    }

    public toString(): string
    {
        return `RMDIR ${this.path.toString()}`;
    }
}

