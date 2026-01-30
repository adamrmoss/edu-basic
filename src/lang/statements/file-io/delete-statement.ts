import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class DeleteStatement extends Statement
{
    public constructor(
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
        const filenameValue = this.filename.evaluate(context);
        if (filenameValue.type !== EduBasicType.String)
        {
            throw new Error('DELETE: filename must be a string');
        }

        const path = filenameValue.value as string;
        const deleted = runtime.getFileSystem().deleteFile(path);
        if (!deleted)
        {
            throw new Error(`DELETE: file not found: ${path}`);
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `DELETE ${this.filename.toString()}`;
    }
}
