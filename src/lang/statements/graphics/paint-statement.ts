import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

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

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement PAINT statement (flood fill)
        // - Evaluate x, y, and color
        // - Perform flood fill at (x, y) with color
        throw new Error('PAINT statement not yet implemented');
    }

    public toString(): string
    {
        return `PAINT (${this.x.toString()}, ${this.y.toString()}) WITH ${this.color.toString()}`;
    }
}

