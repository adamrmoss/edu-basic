import { Statement, ExecutionStatus, ExecutionResult } from './statement';
import { ExecutionContext } from '../execution-context';
import { Graphics } from '../graphics';
import { Audio } from '../audio';
import { Program } from '../program';
import { RuntimeExecution } from '../runtime-execution';

/**
 * Placeholder statement used when a source line fails to parse.
 */
export class UnparsableStatement extends Statement
{
    /**
     * Original source text for the unparsable line.
     */
    private readonly sourceText: string;

    /**
     * Optional parse error message.
     */
    public readonly errorMessage?: string;

    /**
     * Create a new unparsable statement placeholder.
     *
     * @param sourceText Original source text.
     * @param errorMessage Optional parse error message.
     */
    public constructor(sourceText: string, errorMessage?: string)
    {
        super();
        this.sourceText = sourceText;
        this.errorMessage = errorMessage;
    }

    /**
     * Execute the statement.
     *
     * This is typically an error; however, a sentinel message is used to represent
     * comment/empty lines, which are treated as no-ops.
     *
     * @returns Execution status.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        // Comment/empty sentinel is a no-op; otherwise throw so the runtime can report the error.
        if (this.errorMessage === 'Comment or empty line')
        {
            return { result: ExecutionResult.Continue };
        }

        throw new Error(this.errorMessage || `Cannot execute unparsable statement: ${this.sourceText}`);
    }

    public override toString(): string
    {
        return this.sourceText;
    }
}
