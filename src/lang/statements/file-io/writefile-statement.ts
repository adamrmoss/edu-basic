import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class WritefileStatement extends Statement
{
    public constructor(
        public readonly content: Expression,
        public readonly filename: Expression
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
        const contentValue = this.content.evaluate(context);
        const filenameValue = this.filename.evaluate(context);
        
        if (filenameValue.type !== EduBasicType.String)
        {
            throw new Error('WRITEFILE: filename must be a string');
        }

        if (contentValue.type !== EduBasicType.String)
        {
            throw new Error('WRITEFILE: content must be a string');
        }

        const filename = filenameValue.value as string;
        const content = contentValue.value as string;

        const encoder = new TextEncoder();
        const data = encoder.encode(content);

        const fileSystem = runtime.getFileSystem();
        fileSystem.writeFile(filename, data);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `WRITEFILE ${this.content.toString()} TO ${this.filename.toString()}`;
    }
}
