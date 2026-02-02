import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `NEXT` statement.
 */
export class NextStatement extends Statement
{
    /**
     * Optional loop variable name for `NEXT var%`.
     */
    public readonly variableName: string | null;

    /**
     * Create a new `NEXT` statement.
     *
     * @param variableName Optional loop variable name.
     */
    public constructor(variableName: string | null)
    {
        super();
        this.variableName = variableName;
    }

    public override getIndentAdjustment(): number
    {
        return -1;
    }

    /**
     * Execute the statement.
     *
     * @returns Execution status.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        const forFrame = this.variableName
            ? runtime.findControlFrameWhere(frame =>
            {
                if (frame.type !== 'for' || !frame.loopVariable)
                {
                    return false;
                }

                return frame.loopVariable.toUpperCase() === this.variableName!.toUpperCase();
            })
            : runtime.findControlFrame('for');

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

            runtime.popControlFramesToAndIncludingWhere(frame =>
            {
                if (frame.type !== 'for')
                {
                    return false;
                }

                if (!this.variableName)
                {
                    return true;
                }

                if (!frame.loopVariable)
                {
                    return false;
                }

                return frame.loopVariable.toUpperCase() === this.variableName.toUpperCase();
            });
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
