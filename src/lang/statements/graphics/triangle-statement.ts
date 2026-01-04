import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class TriangleStatement extends Statement
{
    public constructor(
        public readonly x1: Expression,
        public readonly y1: Expression,
        public readonly x2: Expression,
        public readonly y2: Expression,
        public readonly x3: Expression,
        public readonly y3: Expression,
        public readonly color: Expression | null,
        public readonly filled: boolean
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement TRIANGLE statement
        // - Evaluate three vertices and optional color
        // - Draw triangle (filled or outline) in graphics buffer
        throw new Error('TRIANGLE statement not yet implemented');
    }

    public toString(): string
    {
        let result = `TRIANGLE (${this.x1.toString()}, ${this.y1.toString()}) (${this.x2.toString()}, ${this.y2.toString()}) (${this.x3.toString()}, ${this.y3.toString()})`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        if (this.filled)
        {
            result += ' FILLED';
        }

        return result;
    }
}

