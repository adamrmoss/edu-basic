import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class ReadfileStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly filename: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement READFILE statement
        // - Evaluate filename
        // - Read entire file into string variable
        throw new Error('READFILE statement not yet implemented');
    }

    public toString(): string
    {
        return `READFILE ${this.variableName} FROM ${this.filename.toString()}`;
    }
}

