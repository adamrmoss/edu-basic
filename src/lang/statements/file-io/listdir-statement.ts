import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType, EduBasicValue, tryGetArrayRankSuffixFromName } from '../../edu-basic-value';
/**
 * Implements the `LISTDIR` statement.
 */
export class ListdirStatement extends Statement
{
    /**
     * Destination string array variable name.
     */
    public readonly arrayVariable: string;

    /**
     * Directory path expression.
     */
    public readonly path: Expression;

    /**
     * Create a new `LISTDIR` statement.
     *
     * @param arrayVariable Destination string array variable name.
     * @param path Directory path expression.
     */
    public constructor(arrayVariable: string, path: Expression)
    {
        super();
        this.arrayVariable = arrayVariable;
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
        // Require destination to be a 1D array; evaluate path and resolve directory.
        const suffix = tryGetArrayRankSuffixFromName(this.arrayVariable);
        if (suffix === null || suffix.rank !== 1)
        {
            throw new Error('LISTDIR: destination must be an array');
        }

        const pathValue = this.path.evaluate(context);
        if (pathValue.type !== EduBasicType.String)
        {
            throw new Error('LISTDIR: path must be a string');
        }

        const path = pathValue.value as string;
        const fileSystem = runtime.getFileSystem();
        const names = fileSystem.listDirectory(path);
        const entries: EduBasicValue[] = names.map(name => ({ type: EduBasicType.String, value: name }));

        context.setVariable(this.arrayVariable, { type: EduBasicType.Array, value: entries, elementType: EduBasicType.String }, false);
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `LISTDIR ${this.arrayVariable} FROM ${this.path.toString()}`;
    }
}
