import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class WriteFileStatement extends Statement
{
    public constructor(
        public readonly expression: Expression,
        public readonly fileHandle: Expression
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
        throw new Error('WRITE statement not yet implemented');
    }

    public override toString(): string
    {
        return `WRITE ${this.expression.toString()} TO ${this.fileHandle.toString()}`;
    }
}

