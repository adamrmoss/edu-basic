import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class ReadfileStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly filename: Expression
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
        throw new Error('READFILE statement not yet implemented');
    }

    public override toString(): string
    {
        return `READFILE ${this.variableName} FROM ${this.filename.toString()}`;
    }
}

