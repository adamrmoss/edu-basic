import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class ListdirStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly path: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement LISTDIR statement
        // - Evaluate path
        // - List directory contents into array
        throw new Error('LISTDIR statement not yet implemented');
    }

    public toString(): string
    {
        return `LISTDIR ${this.arrayVariable} FROM ${this.path.toString()}`;
    }
}

