import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `WRITEFILE` statement.
 */
export class WritefileStatement extends Statement
{
    /**
     * Content expression.
     */
    public readonly content: Expression;

    /**
     * Filename expression.
     */
    public readonly filename: Expression;

    /**
     * Create a new `WRITEFILE` statement.
     *
     * @param content Content expression.
     * @param filename Filename expression.
     */
    public constructor(content: Expression, filename: Expression)
    {
        super();
        this.content = content;
        this.filename = filename;
    }

    /**
     * Execute the statement.
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
        const contentValue = this.content.evaluate(context);
        const filenameValue = this.filename.evaluate(context);
        
        if (filenameValue.type !== EduBasicType.String)
        {
            throw new Error('WRITEFILE: filename must be a string');
        }

        if (contentValue.type !== EduBasicType.String)
        {
            throw new Error('WRITEFILE: content must be a string');
        }

        const filename = filenameValue.value as string;
        const content = contentValue.value as string;

        const encoder = new TextEncoder();
        const data = encoder.encode(content);

        const fileSystem = runtime.getFileSystem();
        fileSystem.writeFile(filename, data);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `WRITEFILE ${this.content.toString()} TO ${this.filename.toString()}`;
    }
}
