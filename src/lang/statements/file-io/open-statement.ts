import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

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

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('OPEN statement not yet implemented');
    }

    public toString(): string
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

