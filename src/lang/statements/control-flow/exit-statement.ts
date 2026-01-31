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
        public readonly target: ExitTarget,
        public readonly forVariableName: string | null = null
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
            const predicate = (frame: any): boolean =>
            {
                if (!frame || frame.type !== frameType)
                {
                    return false;
                }

                if (frameType !== 'for')
                {
                    return true;
                }

                if (!this.forVariableName)
                {
                    return true;
                }

                if (!frame.loopVariable)
                {
                    return false;
                }

                return frame.loopVariable.toUpperCase() === this.forVariableName.toUpperCase();
            };

            const frame = runtime.findControlFrameWhere(predicate);
            if (frame)
            {
                const popped = runtime.popControlFramesToAndIncludingWhere(predicate);
                const endLine = popped?.endLine ?? frame.endLine;

                if (endLine !== undefined)
                {
                    return { result: ExecutionResult.Goto, gotoTarget: endLine + 1 };
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
                if (this.forVariableName)
                {
                    return `EXIT FOR ${this.forVariableName}`;
                }
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
