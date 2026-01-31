import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class SelectCaseStatement extends Statement
{
    public constructor(
        public readonly testExpression: Expression,
        public readonly cases: any[] = []
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
        const testValue = this.testExpression.evaluate(context);

        const endSelectLine = runtime.findMatchingEndSelect(currentPc);
        if (endSelectLine === undefined)
        {
            throw new Error('SELECT CASE: missing END SELECT');
        }

        runtime.pushControlFrame({
            type: 'select',
            startLine: currentPc,
            endLine: endSelectLine,
            selectTestValue: testValue,
            selectMatched: false
        });

        const firstCaseOrEnd = runtime.findNextCaseOrEndSelect(currentPc + 1, endSelectLine);
        return { result: ExecutionResult.Goto, gotoTarget: firstCaseOrEnd };
    }


    public override toString(): string
    {
        return `SELECT CASE ${this.testExpression.toString()}`;
    }
}
