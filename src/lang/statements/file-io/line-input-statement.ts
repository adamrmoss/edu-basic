import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class LineInputStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly fileHandle: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement LINE INPUT statement
        // - Evaluate file handle
        // - Read one line of text from file
        // - Store in string variable
        throw new Error('LINE INPUT statement not yet implemented');
    }

    public toString(): string
    {
        return `LINE INPUT ${this.variableName} FROM #${this.fileHandle.toString()}`;
    }
}

