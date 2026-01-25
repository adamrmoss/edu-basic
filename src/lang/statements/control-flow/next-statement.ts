import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class NextStatement extends Statement
{
    public constructor(
        public readonly variableName: string | null
    )
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
        const forFrame = runtime.findControlFrame('for');

        if (forFrame && forFrame.loopVariable)
        {
            const currentValue = context.getVariable(forFrame.loopVariable);
            const stepValue = forFrame.loopStepValue ?? 1;
            
            if (currentValue.type === EduBasicType.Integer || currentValue.type === EduBasicType.Real)
            {
                const newValue = (currentValue.value as number) + stepValue;
                const endValue = forFrame.loopEndValue;

                const shouldContinue = endValue !== undefined && (stepValue > 0
                    ? newValue <= endValue
                    : newValue >= endValue);

                if (shouldContinue)
                {
                    context.setVariable(forFrame.loopVariable, { type: currentValue.type, value: newValue });
                    return { result: ExecutionResult.Goto, gotoTarget: forFrame.startLine + 1 };
                }
            }
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        if (this.variableName)
        {
            return `NEXT ${this.variableName}`;
        }

        return 'NEXT';
    }
}
