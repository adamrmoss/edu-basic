import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class LineInputStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
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
        const handleValue = this.fileHandle.evaluate(context);

        if (handleValue.type !== EduBasicType.Integer)
        {
            throw new Error('LINE INPUT: file handle must be an integer');
        }

        if (!this.variableName.endsWith('$'))
        {
            throw new Error('LINE INPUT: target variable must be a string');
        }

        const handleId = handleValue.value as number;
        const fileSystem = runtime.getFileSystem();

        const bytes: number[] = [];

        while (true)
        {
            const chunk = fileSystem.readBytes(handleId, 1);
            if (chunk.length === 0)
            {
                throw new Error('LINE INPUT: end of file');
            }

            const b = chunk[0];
            bytes.push(b);

            if (b === 10)
            {
                break;
            }
        }

        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(new Uint8Array(bytes));

        context.setVariable(this.variableName, { type: EduBasicType.String, value: text }, false);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `LINE INPUT ${this.variableName} FROM ${this.fileHandle.toString()}`;
    }
}
