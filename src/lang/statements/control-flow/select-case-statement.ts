import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { CaseStatement } from './case-statement';

/**
 * Implements the `SELECT CASE` statement.
 */
export class SelectCaseStatement extends Statement
{
    /**
     * Linked `END SELECT` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public endSelectLine?: number;

    /**
     * First `CASE` clause line index (0-based), or `endSelectLine` if none exist.
     *
     * Populated by static syntax analysis.
     */
    public firstCaseLine?: number;

    /**
     * Test expression used for subsequent `CASE` matching.
     */
    public readonly testExpression: Expression;

    /**
     * Placeholder list for case clauses (block construction).
     */
    public readonly cases: CaseStatement[];

    /**
     * Create a new `SELECT CASE` statement.
     *
     * @param testExpression Test expression.
     * @param cases Case list placeholder.
     */
    public constructor(testExpression: Expression, cases: CaseStatement[] = [])
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

        if (this.endSelectLine === undefined)
        {
            return { result: ExecutionResult.Continue };
        }

        runtime.pushControlFrame({
            type: 'select',
            startLine: currentPc,
            endLine: this.endSelectLine,
            selectTestValue: testValue,
            selectMatched: false
        });

        const firstCaseOrEnd = this.firstCaseLine ?? this.endSelectLine;
        return { result: ExecutionResult.Goto, gotoTarget: firstCaseOrEnd };
    }


    public override toString(): string
    {
        return `SELECT CASE ${this.testExpression.toString()}`;
    }
}
