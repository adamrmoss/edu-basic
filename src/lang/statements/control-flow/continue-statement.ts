import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export enum ContinueTarget
{
    For,
    While,
    Do
}

export class ContinueStatement extends Statement
{
    public constructor(
        public readonly target: ContinueTarget
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
        let frameType: 'while' | 'do' | 'for' | undefined;

        switch (this.target)
        {
            case ContinueTarget.For:
                frameType = 'for';
                break;
            case ContinueTarget.While:
                frameType = 'while';
                break;
            case ContinueTarget.Do:
                frameType = 'do';
                break;
        }

        if (frameType)
        {
            const frame = runtime.findControlFrame(frameType);

            if (frame)
            {
                return { result: ExecutionResult.Goto, gotoTarget: frame.endLine };
            }
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        switch (this.target)
        {
            case ContinueTarget.For:
                return 'CONTINUE FOR';
            case ContinueTarget.While:
                return 'CONTINUE WHILE';
            case ContinueTarget.Do:
                return 'CONTINUE DO';
            default:
                return 'CONTINUE';
        }
    }
}
