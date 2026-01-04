import { Statement, ExecutionStatus, ExecutionResult } from './statement';
import { ExecutionContext } from '../execution-context';
import { Program } from '../program';

export class UnparsableStatement extends Statement
{
    constructor(private readonly sourceText: string)
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        throw new Error(`Cannot execute unparsable statement: ${this.sourceText}`);
    }

    public toString(): string
    {
        return this.sourceText;
    }
}

