import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export enum EndType
{
    Program,
    If,
    Unless,
    Select,
    Sub,
    Try
}

export class EndStatement extends Statement
{
    public constructor(public readonly endType: EndType = EndType.Program)
    {
        super();
    }

    public override getIndentAdjustment(): number
    {
        return -1;
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        if (this.endType === EndType.Program)
        {
            return { result: ExecutionResult.End };
        }

        if (this.endType === EndType.Sub)
        {
            runtime.popControlFramesToAndIncluding('sub');
            return { result: ExecutionResult.Return };
        }

        if (this.endType === EndType.If)
        {
            const top = runtime.getCurrentControlFrame();
            if (!top || top.type !== 'if')
            {
                throw new Error('END IF without IF');
            }

            runtime.popControlFrame();
        }

        if (this.endType === EndType.Unless)
        {
            const top = runtime.getCurrentControlFrame();
            if (!top || top.type !== 'unless')
            {
                throw new Error('END UNLESS without UNLESS');
            }

            runtime.popControlFrame();
        }
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        switch (this.endType)
        {
            case EndType.Program:
                return 'END';
            case EndType.If:
                return 'END IF';
            case EndType.Unless:
                return 'END UNLESS';
            case EndType.Select:
                return 'END SELECT';
            case EndType.Sub:
                return 'END SUB';
            case EndType.Try:
                return 'END TRY';
        }
    }
}
