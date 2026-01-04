import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class DeleteStatement extends Statement
{
    public constructor(
        public readonly filename: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement DELETE statement
        // - Evaluate filename
        // - Delete file
        throw new Error('DELETE statement not yet implemented');
    }

    public toString(): string
    {
        return `DELETE ${this.filename.toString()}`;
    }
}

