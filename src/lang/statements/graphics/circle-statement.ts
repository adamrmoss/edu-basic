import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class CircleStatement extends Statement
{
    public constructor(
        public readonly centerX: Expression,
        public readonly centerY: Expression,
        public readonly radius: Expression,
        public readonly color: Expression | null,
        public readonly filled: boolean
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement CIRCLE statement
        // - Evaluate center, radius, and optional color
        // - Draw circle (filled or outline) in graphics buffer
        throw new Error('CIRCLE statement not yet implemented');
    }

    public toString(): string
    {
        let result = `CIRCLE AT (${this.centerX.toString()}, ${this.centerY.toString()}) RADIUS ${this.radius.toString()}`;

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

