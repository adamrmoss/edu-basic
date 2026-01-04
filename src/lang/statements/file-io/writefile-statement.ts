import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class WritefileStatement extends Statement
{
    public constructor(
        public readonly content: Expression,
        public readonly filename: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement WRITEFILE statement
        // - Evaluate filename and content
        // - Write content to file
        throw new Error('WRITEFILE statement not yet implemented');
    }

    public toString(): string
    {
        return `WRITEFILE ${this.content.toString()} TO ${this.filename.toString()}`;
    }
}

