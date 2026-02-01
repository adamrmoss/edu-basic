import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `SEEK` statement.
 */
export class SeekStatement extends Statement
{
    /**
     * Position expression.
     */
    public readonly position: Expression;

    /**
     * File handle expression.
     */
    public readonly fileHandle: Expression;

    /**
     * Create a new `SEEK` statement.
     *
     * @param position Position expression.
     * @param fileHandle File handle expression.
     */
    public constructor(position: Expression, fileHandle: Expression)
    {
        super();
        this.position = position;
        this.fileHandle = fileHandle;
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
        const positionValue = this.position.evaluate(context);
        const handleValue = this.fileHandle.evaluate(context);

        if (handleValue.type !== EduBasicType.Integer)
        {
            throw new Error('SEEK: file handle must be an integer');
        }

        if (positionValue.type !== EduBasicType.Integer && positionValue.type !== EduBasicType.Real)
        {
            throw new Error('SEEK: position must be a number');
        }

        const position = Math.max(0, Math.floor(positionValue.value as number));
        const handleId = handleValue.value as number;

        runtime.getFileSystem().seek(handleId, position);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `SEEK ${this.position.toString()} IN ${this.fileHandle.toString()}`;
    }
}
