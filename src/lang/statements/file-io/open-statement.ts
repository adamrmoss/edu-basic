import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * File open modes for the `OPEN` statement.
 */
export enum FileMode
{
    Read,
    Append,
    Overwrite
}

/**
 * Implements the `OPEN` statement.
 */
export class OpenStatement extends Statement
{
    /**
     * Filename expression.
     */
    public readonly filename: Expression;

    /**
     * Open mode.
     */
    public readonly mode: FileMode;

    /**
     * Target handle variable name.
     */
    public readonly handleVariable: string;

    /**
     * Create a new `OPEN` statement.
     *
     * @param filename Filename expression.
     * @param mode Open mode.
     * @param handleVariable Target handle variable name.
     */
    public constructor(filename: Expression, mode: FileMode, handleVariable: string)
    {
        super();
        this.filename = filename;
        this.mode = mode;
        this.handleVariable = handleVariable;
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
        const filenameValue = this.filename.evaluate(context);
        
        if (filenameValue.type !== EduBasicType.String)
        {
            throw new Error('OPEN: filename must be a string');
        }

        const filename = filenameValue.value as string;

        let modeStr: 'read' | 'write' | 'append';
        
        switch (this.mode)
        {
            case FileMode.Read:
                modeStr = 'read';
                break;
            case FileMode.Append:
                modeStr = 'append';
                break;
            case FileMode.Overwrite:
                modeStr = 'write';
                break;
        }

        const fileSystem = runtime.getFileSystem();
        // Open via runtime filesystem and store handle in variable.
        const handleId = fileSystem.openFile(filename, modeStr);

        context.setVariable(this.handleVariable, { type: EduBasicType.Integer, value: handleId });

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let modeStr = '';

        switch (this.mode)
        {
            case FileMode.Read:
                modeStr = 'READ';
                break;
            case FileMode.Append:
                modeStr = 'APPEND';
                break;
            case FileMode.Overwrite:
                modeStr = 'OVERWRITE';
                break;
        }

        return `OPEN ${this.filename.toString()} FOR ${modeStr} AS ${this.handleVariable}`;
    }
}
