import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `READFILE` statement.
 */
export class ReadfileStatement extends Statement
{
    /**
     * Target string variable name.
     */
    public readonly variableName: string;

    /**
     * Filename expression.
     */
    public readonly filename: Expression;

    /**
     * Create a new `READFILE` statement.
     *
     * @param variableName Target string variable name.
     * @param filename Filename expression.
     */
    public constructor(variableName: string, filename: Expression)
    {
        super();
        this.variableName = variableName;
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
        const filenameValue = this.filename.evaluate(context);
        
        if (filenameValue.type !== EduBasicType.String)
        {
            throw new Error('READFILE: filename must be a string');
        }

        const filename = filenameValue.value as string;
        const fileSystem = runtime.getFileSystem();
        
        const data = fileSystem.readFile(filename);
        
        if (!data)
        {
            throw new Error(`READFILE: file not found: ${filename}`);
        }

        const decoder = new TextDecoder('utf-8');
        const content = decoder.decode(data);

        context.setVariable(this.variableName, { type: EduBasicType.String, value: content });

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `READFILE ${this.variableName} FROM ${this.filename.toString()}`;
    }
}
