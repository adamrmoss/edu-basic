import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType, EduBasicValue, valueToString } from '../../edu-basic-value';

export class WriteFileStatement extends Statement
{
    public constructor(
        public readonly expression: Expression,
        public readonly fileHandle: Expression
    )
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const value = this.expression.evaluate(context);
        const handleValue = this.fileHandle.evaluate(context);

        if (handleValue.type !== EduBasicType.Integer)
        {
            throw new Error('WRITE: file handle must be an integer');
        }

        const handleId = handleValue.value as number;
        const fileSystem = runtime.getFileSystem();

        if (value.type === EduBasicType.String)
        {
            const encoder = new TextEncoder();
            const data = encoder.encode(`${value.value}\n`);
            fileSystem.writeBytes(handleId, data);
            return { result: ExecutionResult.Continue };
        }

        if (value.type === EduBasicType.Array)
        {
            for (const element of value.value)
            {
                this.writeValue(fileSystem, handleId, element);
            }
            return { result: ExecutionResult.Continue };
        }

        this.writeValue(fileSystem, handleId, value);
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `WRITE ${this.expression.toString()} TO ${this.fileHandle.toString()}`;
    }

    private writeValue(fileSystem: any, handleId: number, value: EduBasicValue): void
    {
        switch (value.type)
        {
            case EduBasicType.Integer:
            {
                const data = new Uint8Array(4);
                const view = new DataView(data.buffer);
                view.setInt32(0, Math.trunc(value.value), true);
                fileSystem.writeBytes(handleId, data);
                return;
            }
            case EduBasicType.Real:
            {
                const data = new Uint8Array(8);
                const view = new DataView(data.buffer);
                view.setFloat64(0, value.value, true);
                fileSystem.writeBytes(handleId, data);
                return;
            }
            case EduBasicType.Complex:
            {
                const data = new Uint8Array(16);
                const view = new DataView(data.buffer);
                view.setFloat64(0, value.value.real, true);
                view.setFloat64(8, value.value.imaginary, true);
                fileSystem.writeBytes(handleId, data);
                return;
            }
            case EduBasicType.String:
            {
                const encoder = new TextEncoder();
                const bytes = encoder.encode(value.value);
                const data = new Uint8Array(4 + bytes.length);
                const view = new DataView(data.buffer);
                view.setInt32(0, bytes.length, true);
                data.set(bytes, 4);
                fileSystem.writeBytes(handleId, data);
                return;
            }
            case EduBasicType.Structure:
                throw new Error('WRITE: cannot write STRUCTURE values');
            case EduBasicType.Array:
                // Flatten nested arrays.
                for (const element of value.value)
                {
                    this.writeValue(fileSystem, handleId, element);
                }
                return;
        }
    }
}
