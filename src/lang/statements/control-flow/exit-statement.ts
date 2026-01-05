import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export enum ExitTarget
{
    For,
    While,
    Do,
    Sub
}

export class ExitStatement extends Statement
{
    public constructor(
        public readonly target: ExitTarget
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('EXIT statement not yet implemented');
    }

    public toString(): string
    {
        switch (this.target)
        {
            case ExitTarget.For:
                return 'EXIT FOR';
            case ExitTarget.While:
                return 'EXIT WHILE';
            case ExitTarget.Do:
                return 'EXIT DO';
            case ExitTarget.Sub:
                return 'EXIT SUB';
            default:
                return 'EXIT';
        }
    }
}

