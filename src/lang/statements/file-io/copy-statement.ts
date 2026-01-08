import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class CopyStatement extends Statement
{
    public constructor(
        public readonly source: Expression,
        public readonly destination: Expression
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
        throw new Error('COPY statement not yet implemented');
    }

    public override toString(): string
    {
        return `COPY ${this.source.toString()} TO ${this.destination.toString()}`;
    }
}

