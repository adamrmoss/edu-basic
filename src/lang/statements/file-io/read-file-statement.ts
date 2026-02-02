import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType, EduBasicValue, tryGetArrayRankSuffixFromName } from '../../edu-basic-value';

/**
 * Implements the `READ` statement for reading values from an open file handle.
 */
export class ReadFileStatement extends Statement
{
    /**
     * Target variable name (scalar or array).
     */
    public readonly variableName: string;

    /**
     * File handle expression.
     */
    public readonly fileHandle: Expression;

    /**
     * Create a new `READ` statement.
     *
     * @param variableName Target variable name.
     * @param fileHandle File handle expression.
     */
    public constructor(variableName: string, fileHandle: Expression)
    {
        super();
        this.variableName = variableName;
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
        const handleValue = this.fileHandle.evaluate(context);

        if (handleValue.type !== EduBasicType.Integer)
        {
            throw new Error('READ: file handle must be an integer');
        }

        const handleId = handleValue.value as number;
        const fileSystem = runtime.getFileSystem();

        if (tryGetArrayRankSuffixFromName(this.variableName) !== null)
        {
            const arrayValue = context.getVariable(this.variableName);
            if (arrayValue.type !== EduBasicType.Array)
            {
                throw new Error(`READ: ${this.variableName} is not an array`);
            }

            const elementType = arrayValue.elementType;
            const values = arrayValue.value;

            for (let i = 0; i < values.length; i++)
            {
                values[i] = this.readValue(fileSystem, handleId, elementType);
            }

            context.setVariable(this.variableName, { type: EduBasicType.Array, value: values, elementType }, false);
            return { result: ExecutionResult.Continue };
        }

        const targetType = this.getTypeFromVariableName(this.variableName);
        const value = this.readValue(fileSystem, handleId, targetType);
        context.setVariable(this.variableName, value, false);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `READ ${this.variableName} FROM ${this.fileHandle.toString()}`;
    }

    private getTypeFromVariableName(variableName: string): EduBasicType
    {
        const suffix = tryGetArrayRankSuffixFromName(variableName);
        if (suffix !== null)
        {
            const sigil = suffix.baseName.charAt(suffix.baseName.length - 1);
            switch (sigil)
            {
                case '%':
                    return EduBasicType.Integer;
                case '#':
                    return EduBasicType.Real;
                case '$':
                    return EduBasicType.String;
                case '&':
                    return EduBasicType.Complex;
                default:
                    return EduBasicType.Structure;
            }
        }

        const sigil = variableName.charAt(variableName.length - 1);
        switch (sigil)
        {
            case '%':
                return EduBasicType.Integer;
            case '#':
                return EduBasicType.Real;
            case '$':
                return EduBasicType.String;
            case '&':
                return EduBasicType.Complex;
            default:
                return EduBasicType.Structure;
        }
    }

    private readValue(fileSystem: any, handleId: number, type: EduBasicType): EduBasicValue
    {
        switch (type)
        {
            case EduBasicType.Integer:
            {
                const data = fileSystem.readBytes(handleId, 4) as Uint8Array;
                if (data.length !== 4)
                {
                    throw new Error('READ: end of file');
                }

                const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
                return { type: EduBasicType.Integer, value: view.getInt32(0, true) };
            }
            case EduBasicType.Real:
            {
                const data = fileSystem.readBytes(handleId, 8) as Uint8Array;
                if (data.length !== 8)
                {
                    throw new Error('READ: end of file');
                }

                const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
                return { type: EduBasicType.Real, value: view.getFloat64(0, true) };
            }
            case EduBasicType.Complex:
            {
                const data = fileSystem.readBytes(handleId, 16) as Uint8Array;
                if (data.length !== 16)
                {
                    throw new Error('READ: end of file');
                }

                const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
                const real = view.getFloat64(0, true);
                const imaginary = view.getFloat64(8, true);
                return { type: EduBasicType.Complex, value: { real, imaginary } };
            }
            case EduBasicType.String:
            {
                const lenData = fileSystem.readBytes(handleId, 4) as Uint8Array;
                if (lenData.length !== 4)
                {
                    throw new Error('READ: end of file');
                }

                const lenView = new DataView(lenData.buffer, lenData.byteOffset, lenData.byteLength);
                const length = Math.max(0, lenView.getInt32(0, true));

                const data = fileSystem.readBytes(handleId, length) as Uint8Array;
                if (data.length !== length)
                {
                    throw new Error('READ: end of file');
                }

                const decoder = new TextDecoder('utf-8');
                return { type: EduBasicType.String, value: decoder.decode(data) };
            }
            case EduBasicType.Structure:
                throw new Error('READ: cannot read STRUCTURE values');
            case EduBasicType.Array:
                throw new Error('READ: cannot read ARRAY values directly (use READ array[] FROM handle)');
        }
    }
}
