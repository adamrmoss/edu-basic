import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { NextStatement } from './next-statement';

export class ForStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly startValue: Expression,
        public readonly endValue: Expression,
        public readonly stepValue: Expression | null,
        public readonly body: Statement[]
    )
    {
        super();
    }

    public override getIndentAdjustment(): number
    {
        return 1;
    }

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

        const nextLine = runtime.findMatchingNext(currentPc);
        if (nextLine === undefined)
        {
            throw new Error('FOR: missing NEXT');
        }

        const shouldEnter = stepValueNum > 0
            ? startValueNum <= endValueNum
            : startValueNum >= endValueNum;

        if (!shouldEnter)
        {
            return { result: ExecutionResult.Goto, gotoTarget: nextLine + 1 };
        }

        runtime.pushControlFrame({
            type: 'for',
            startLine: currentPc,
            endLine: nextLine,
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
