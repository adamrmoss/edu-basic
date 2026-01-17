import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { resolveColorValue, intToRgba } from './color-utils';

export class PaintStatement extends Statement
{
    public constructor(
        public readonly x: Expression,
        public readonly y: Expression,
        public readonly color: Expression
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
        throw new Error('PAINT statement not yet implemented');
    }

    public override toString(): string
    {
        return `PAINT (${this.x.toString()}, ${this.y.toString()}) WITH ${this.color.toString()}`;
    }
}

