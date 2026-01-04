import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

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

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement PUT statement (draw sprite)
        // - Evaluate x, y coordinates
        // - Draw sprite from array at position (x, y)
        // - Use alpha blending
        throw new Error('PUT statement not yet implemented');
    }

    public toString(): string
    {
        return `PUT ${this.arrayVariable} AT (${this.x.toString()}, ${this.y.toString()})`;
    }
}

