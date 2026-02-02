import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `RMDIR` statement.
 */
export class RmdirStatement extends Statement
{
    /**
     * Directory path expression.
     */
    public readonly path: Expression;

    /**
     * Create a new `RMDIR` statement.
     *
     * @param path Directory path expression.
     */
    public constructor(path: Expression)
    {
        super();
        this.path = path;
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
        const pathValue = this.path.evaluate(context);
        if (pathValue.type !== EduBasicType.String)
        {
            throw new Error('RMDIR: path must be a string');
        }

        const path = pathValue.value as string;
        const deleted = runtime.getFileSystem().deleteDirectory(path);
        if (!deleted)
        {
            throw new Error(`RMDIR: could not remove directory: ${path}`);
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `RMDIR ${this.path.toString()}`;
    }
}
