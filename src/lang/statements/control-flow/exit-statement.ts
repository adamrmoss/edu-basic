import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

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

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        let frameType: 'if' | 'while' | 'do' | 'for' | undefined;

        switch (this.target)
        {
            case ExitTarget.For:
                frameType = 'for';
                break;
            case ExitTarget.While:
                frameType = 'while';
                break;
            case ExitTarget.Do:
                frameType = 'do';
                break;
            case ExitTarget.Sub:
                return { result: ExecutionResult.Return };
        }

        if (frameType)
        {
            const frame = runtime.findControlFrame(frameType);

            if (frame)
            {
                let popped: any = null;

                while (runtime.getCurrentControlFrame())
                {
                    popped = runtime.popControlFrame();

                    if (popped && popped.type === frameType)
                    {
                        break;
                    }
                }

                if (frame.endLine !== undefined)
                {
                    return { result: ExecutionResult.Goto, gotoTarget: frame.endLine + 1 };
                }
            }
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
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
