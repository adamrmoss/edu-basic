import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class GetStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly x1: Expression,
        public readonly y1: Expression,
        public readonly x2: Expression,
        public readonly y2: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement GET statement (capture sprite)
        // - Evaluate rectangle coordinates
        // - Capture screen region into array
        // - Array format: [width, height, pixel1, pixel2, ...]
        throw new Error('GET statement not yet implemented');
    }

    public toString(): string
    {
        return `GET ${this.arrayVariable} FROM (${this.x1.toString()}, ${this.y1.toString()}) TO (${this.x2.toString()}, ${this.y2.toString()})`;
    }
}

