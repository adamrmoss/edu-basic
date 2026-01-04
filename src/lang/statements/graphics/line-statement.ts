import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class LineStatement extends Statement
{
    public constructor(
        public readonly x1: Expression,
        public readonly y1: Expression,
        public readonly x2: Expression,
        public readonly y2: Expression,
        public readonly color: Expression | null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement LINE statement
        // - Evaluate coordinates and optional color
        // - Draw line in graphics buffer
        throw new Error('LINE statement not yet implemented');
    }

    public toString(): string
    {
        let result = `LINE FROM (${this.x1.toString()}, ${this.y1.toString()}) TO (${this.x2.toString()}, ${this.y2.toString()})`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        return result;
    }
}

