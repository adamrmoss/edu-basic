import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Implements the `SELECT CASE` statement.
 */
export class SelectCaseStatement extends Statement
{
    /**
     * Test expression used for subsequent `CASE` matching.
     */
    public readonly testExpression: Expression;

    /**
     * Placeholder list for case clauses (block construction).
     */
    public readonly cases: any[];

    /**
     * Create a new `SELECT CASE` statement.
     *
     * @param testExpression Test expression.
     * @param cases Case list placeholder.
     */
    public constructor(testExpression: Expression, cases: any[] = [])
    {
        super();
        this.testExpression = testExpression;
        this.cases = cases;
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
