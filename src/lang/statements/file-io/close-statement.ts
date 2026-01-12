import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class CloseStatement extends Statement
{
    public constructor(
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
        const handleValue = this.fileHandle.evaluate(context, graphics, audio);
        
        if (handleValue.type !== EduBasicType.Integer)
        {
            throw new Error('CLOSE: file handle must be an integer');
        }

        const handleId = handleValue.value as number;
        const fileSystem = runtime.getFileSystem();
        
        fileSystem.closeFile(handleId);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `CLOSE ${this.fileHandle.toString()}`;
    }
}

