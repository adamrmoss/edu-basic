import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class PsetStatement extends Statement
{
    public constructor(
        public readonly x: Expression,
        public readonly y: Expression,
        public readonly color: Expression | null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement PSET statement
        // - Evaluate x, y, and optional color
        // - Set pixel in graphics buffer
        throw new Error('PSET statement not yet implemented');
    }

    public toString(): string
    {
        let result = `PSET (${this.x.toString()}, ${this.y.toString()})`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        return result;
    }
}

