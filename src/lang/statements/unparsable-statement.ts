import { Statement, ExecutionStatus, ExecutionResult } from './statement';
import { ExecutionContext } from '../execution-context';
import { Graphics } from '../graphics';
import { Audio } from '../audio';

export class UnparsableStatement extends Statement
{
    constructor(
        private readonly sourceText: string,
        public readonly errorMessage?: string
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error(this.errorMessage || `Cannot execute unparsable statement: ${this.sourceText}`);
    }

    public toString(): string
    {
        return this.sourceText;
    }
}

