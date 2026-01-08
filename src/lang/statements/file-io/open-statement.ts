import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

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
        throw new Error('OPEN statement not yet implemented');
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

