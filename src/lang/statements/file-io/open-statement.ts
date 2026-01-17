import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export enum FileMode
{
    Read,
    Append,
    Overwrite
}

export class OpenStatement extends Statement
{
    public constructor(
        public readonly filename: Expression,
        public readonly mode: FileMode,
        public readonly handleVariable: string
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

