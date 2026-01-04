import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class MoveStatement extends Statement
{
    public constructor(
        public readonly source: Expression,
        public readonly destination: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement MOVE statement
        // - Evaluate source and destination paths
        // - Move/rename file
        throw new Error('MOVE statement not yet implemented');
    }

    public toString(): string
    {
        return `MOVE ${this.source.toString()} TO ${this.destination.toString()}`;
    }
}

