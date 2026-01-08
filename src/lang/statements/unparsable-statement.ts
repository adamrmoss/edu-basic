import { Statement, ExecutionStatus, ExecutionResult } from './statement';
import { ExecutionContext } from '../execution-context';
import { Graphics } from '../graphics';
import { Audio } from '../audio';
import { Program } from '../program';
import { RuntimeExecution } from '../runtime-execution';

export class UnparsableStatement extends Statement
{
    constructor(
        private readonly sourceText: string,
        public readonly errorMessage?: string
    )
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        throw new Error(this.errorMessage || `Cannot execute unparsable statement: ${this.sourceText}`);
    }

    public override toString(): string
    {
        return this.sourceText;
    }
}

