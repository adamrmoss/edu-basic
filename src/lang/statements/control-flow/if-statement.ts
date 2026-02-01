import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { EndStatement, EndType } from './end-statement';
import { ElseStatement } from './else-statement';
import { ElseIfStatement } from './elseif-statement';

/**
 * Implements the `IF` statement.
 */
export class IfStatement extends Statement
{
    /**
     * Condition expression.
     */
    public readonly condition: Expression;

    /**
     * Then-branch statements (block construction).
     */
    public readonly thenBranch: Statement[];

    /**
     * Else-if branches (block construction).
     */
    public readonly elseIfBranches: { condition: Expression; statements: Statement[] }[];

    /**
     * Else branch statements (block construction), if present.
     */
    public readonly elseBranch: Statement[] | null;

    /**
     * Create a new `IF` statement.
     *
     * @param condition Condition expression.
     * @param thenBranch Then-branch statements.
     * @param elseIfBranches Else-if branches.
     * @param elseBranch Else branch statements, if present.
     */
    public constructor(
        condition: Expression,
        thenBranch: Statement[],
        elseIfBranches: { condition: Expression; statements: Statement[] }[],
        elseBranch: Statement[] | null
    )
    {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseIfBranches = elseIfBranches;
        this.elseBranch = elseBranch;
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
        const conditionValue = this.condition.evaluate(context);

        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('IF condition must evaluate to an integer');
        }

        const endIfLine = runtime.findMatchingEndIf(currentPc);
        if (endIfLine === undefined)
        {
            throw new Error('IF: missing END IF');
        }

        const branchTaken = conditionValue.value !== 0;

        runtime.pushControlFrame({
            type: 'if',
            startLine: currentPc,
            endLine: endIfLine,
            branchTaken
        });

        if (branchTaken)
        {
            return { result: ExecutionResult.Continue };
        }

        const nextClause = runtime.findNextIfClauseOrEnd(currentPc + 1, endIfLine);
        return { result: ExecutionResult.Goto, gotoTarget: nextClause };

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `IF ${this.condition.toString()} THEN`;
    }
}
