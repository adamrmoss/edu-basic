import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class ArcStatement extends Statement
{
    public constructor(
        public readonly centerX: Expression,
        public readonly centerY: Expression,
        public readonly radius: Expression,
        public readonly startAngle: Expression,
        public readonly endAngle: Expression,
        public readonly color: Expression | null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement ARC statement
        // - Evaluate center, radius, angles, and optional color
        // - Draw arc in graphics buffer
        throw new Error('ARC statement not yet implemented');
    }

    public toString(): string
    {
        let result = `ARC AT (${this.centerX.toString()}, ${this.centerY.toString()}) RADIUS ${this.radius.toString()} FROM ${this.startAngle.toString()} TO ${this.endAngle.toString()}`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        return result;
    }
}

