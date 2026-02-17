import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `MOVE` statement.
 */
export class MoveStatement extends Statement
{
    /**
     * Source path expression.
     */
    public readonly source: Expression;

    /**
     * Destination path expression.
     */
    public readonly destination: Expression;

    /**
     * Create a new `MOVE` statement.
     *
     * @param source Source path expression.
     * @param destination Destination path expression.
     */
    public constructor(source: Expression, destination: Expression)
    {
        super();
        this.source = source;
        this.destination = destination;
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
        // Evaluate paths, read source, write to destination, then delete source.
        const sourceValue = this.source.evaluate(context);
        const destinationValue = this.destination.evaluate(context);

        if (sourceValue.type !== EduBasicType.String || destinationValue.type !== EduBasicType.String)
        {
            throw new Error('MOVE: source and destination must be strings');
        }

        const sourcePath = sourceValue.value as string;
        const destinationPath = destinationValue.value as string;

        const fileSystem = runtime.getFileSystem();
        const data = fileSystem.readFile(sourcePath);
        if (!data)
        {
            throw new Error(`MOVE: file not found: ${sourcePath}`);
        }

        fileSystem.writeFile(destinationPath, data);

        const deleted = fileSystem.deleteFile(sourcePath);
        if (!deleted)
        {
            throw new Error(`MOVE: could not delete source: ${sourcePath}`);
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `MOVE ${this.source.toString()} TO ${this.destination.toString()}`;
    }
}
