import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class PushStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly value: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement PUSH statement
        // - Evaluate value
        // - Add element to end of array
        throw new Error('PUSH statement not yet implemented');
    }

    public toString(): string
    {
        return `PUSH ${this.arrayVariable}, ${this.value.toString()}`;
    }
}

