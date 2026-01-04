import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class UnshiftStatement extends Statement
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
        // TODO: Implement UNSHIFT statement
        // - Evaluate value
        // - Add element to beginning of array
        throw new Error('UNSHIFT statement not yet implemented');
    }

    public toString(): string
    {
        return `UNSHIFT ${this.arrayVariable}, ${this.value.toString()}`;
    }
}

