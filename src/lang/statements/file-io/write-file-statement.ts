import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class WriteFileStatement extends Statement
{
    public constructor(
        public readonly expression: Expression,
        public readonly fileHandle: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement WRITE statement
        // - Evaluate file handle and expression
        // - Write data to file (text or binary based on type)
        throw new Error('WRITE statement not yet implemented');
    }

    public toString(): string
    {
        return `WRITE ${this.expression.toString()} TO ${this.fileHandle.toString()}`;
    }
}

