import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `MKDIR` statement.
 */
export class MkdirStatement extends Statement
{
    /**
     * Directory path expression.
     */
    public readonly path: Expression;

    /**
     * Create a new `MKDIR` statement.
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
            throw new Error('MKDIR: path must be a string');
        }

        const path = pathValue.value as string;
        runtime.getFileSystem().createDirectory(path);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `MKDIR ${this.path.toString()}`;
    }
}
