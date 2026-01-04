import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class CloseStatement extends Statement
{
    public constructor(
        public readonly fileHandle: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement CLOSE statement
        // - Evaluate file handle expression
        // - Close the file
        throw new Error('CLOSE statement not yet implemented');
    }

    public toString(): string
    {
        return `CLOSE ${this.fileHandle.toString()}`;
    }
}

