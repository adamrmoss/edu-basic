import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class OvalStatement extends Statement
{
    public constructor(
        public readonly centerX: Expression,
        public readonly centerY: Expression,
        public readonly radiusX: Expression,
        public readonly radiusY: Expression,
        public readonly color: Expression | null,
        public readonly filled: boolean
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement OVAL statement
        // - Evaluate center, radii, and optional color
        // - Draw oval (filled or outline) in graphics buffer
        throw new Error('OVAL statement not yet implemented');
    }

    public toString(): string
    {
        let result = `OVAL AT (${this.centerX.toString()}, ${this.centerY.toString()}) RADII (${this.radiusX.toString()}, ${this.radiusY.toString()})`;

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

