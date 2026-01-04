import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class CopyStatement extends Statement
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
        // TODO: Implement COPY statement
        // - Evaluate source and destination paths
        // - Copy file
        throw new Error('COPY statement not yet implemented');
    }

    public toString(): string
    {
        return `COPY ${this.source.toString()} TO ${this.destination.toString()}`;
    }
}

