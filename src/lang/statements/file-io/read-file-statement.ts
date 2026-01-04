import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class ReadFileStatement extends Statement
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
        // TODO: Implement READ statement
        // - Evaluate file handle
        // - Read binary data based on variable type
        // - Store in variable
        throw new Error('READ statement not yet implemented');
    }

    public toString(): string
    {
        return `READ ${this.variableName} FROM ${this.fileHandle.toString()}`;
    }
}

