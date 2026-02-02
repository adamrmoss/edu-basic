import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `FOR` statement.
 */
export class ForStatement extends Statement
{
    /**
     * Linked `NEXT` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public nextLine?: number;

    /**
     * Loop variable name.
     */
    public readonly variableName: string;

    /**
     * Loop start value expression.
     */
    public readonly startValue: Expression;

    /**
     * Loop end value expression.
     */
    public readonly endValue: Expression;

    /**
     * Optional step value expression.
     */
    public readonly stepValue: Expression | null;

    /**
     * Statement body for block construction (not executed directly here).
     */
    public readonly body: Statement[];

    /**
     * Create a new `FOR` statement.
     *
     * @param variableName Loop variable name.
     * @param startValue Loop start value expression.
     * @param endValue Loop end value expression.
     * @param stepValue Optional step value expression.
     * @param body Statement body.
     */
    public constructor(
        variableName: string,
        startValue: Expression,
        endValue: Expression,
        stepValue: Expression | null,
        body: Statement[]
    )
    {
        super();
        this.variableName = variableName;
        this.startValue = startValue;
        this.endValue = endValue;
        this.stepValue = stepValue;
        this.body = body;
    }

    public override getIndentAdjustment(): number
    {
        return 1;
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
        const currentPc = context.getProgramCounter();
        const startVal = this.startValue.evaluate(context);
        const endVal = this.endValue.evaluate(context);
        const stepVal = this.stepValue ? this.stepValue.evaluate(context) : { type: EduBasicType.Integer, value: 1 };

        if (startVal.type !== EduBasicType.Integer && startVal.type !== EduBasicType.Real)
        {
            throw new Error('FOR loop variable must be numeric');
        }

        if (endVal.type !== EduBasicType.Integer && endVal.type !== EduBasicType.Real)
        {
            throw new Error('FOR loop end value must be numeric');
        }

        if (stepVal.type !== EduBasicType.Integer && stepVal.type !== EduBasicType.Real)
        {
            throw new Error('FOR loop step value must be numeric');
        }

        const startValueNum = startVal.value as number;
        const endValueNum = endVal.value as number;
        const stepValueNum = stepVal.value as number;

        context.setVariable(this.variableName, startVal);

        if (this.nextLine === undefined)
        {
            return { result: ExecutionResult.Continue };
        }

        const shouldEnter = stepValueNum > 0
            ? startValueNum <= endValueNum
            : startValueNum >= endValueNum;

        if (!shouldEnter)
        {
            return { result: ExecutionResult.Goto, gotoTarget: this.nextLine + 1 };
        }

        runtime.pushControlFrame({
            type: 'for',
            startLine: currentPc,
            endLine: this.nextLine,
            loopVariable: this.variableName,
            loopEndValue: endValueNum,
            loopStepValue: stepValueNum
        });

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = `FOR ${this.variableName} = ${this.startValue.toString()} TO ${this.endValue.toString()}`;

        if (this.stepValue !== null)
        {
            result += ` STEP ${this.stepValue.toString()}`;
        }

        return result;
    }
}
