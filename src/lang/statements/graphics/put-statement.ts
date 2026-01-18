import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class PutStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly x: Expression,
        public readonly y: Expression
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
        throw new Error('PUT statement not yet implemented');
    }

    public override toString(): string
    {
        return `PUT ${this.arrayVariable} AT (${this.x.toString()}, ${this.y.toString()})`;
    }
}
