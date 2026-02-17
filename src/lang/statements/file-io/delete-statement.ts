import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `DELETE` statement.
 */
export class DeleteStatement extends Statement
{
    /**
     * File path expression.
     */
    public readonly filename: Expression;

    /**
     * Create a new `DELETE` statement.
     *
     * @param filename File path expression.
     */
    public constructor(filename: Expression)
    {
        super();
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
        // Evaluate path, require string, delete file via runtime filesystem or throw if missing.
        const filenameValue = this.filename.evaluate(context);
        if (filenameValue.type !== EduBasicType.String)
        {
            throw new Error('DELETE: filename must be a string');
        }

        const path = filenameValue.value as string;
        const deleted = runtime.getFileSystem().deleteFile(path);
        if (!deleted)
        {
            throw new Error(`DELETE: file not found: ${path}`);
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `DELETE ${this.filename.toString()}`;
    }
}
