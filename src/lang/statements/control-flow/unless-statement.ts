import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `UNLESS` statement.
 */
export class UnlessStatement extends Statement
{
    /**
     * Linked `END UNLESS` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public endUnlessLine?: number;

    /**
     * Line index to jump to when the condition is true (i.e. the UNLESS body is skipped).
     *
     * This is either the `ELSE` line (if present) or the `END UNLESS` line.
     * Populated by static syntax analysis.
     */
    public elseOrEndLine?: number;

    /**
     * Condition expression.
     */
    public readonly condition: Expression;

    /**
     * Then-branch statements (block construction).
     */
    public readonly thenBranch: Statement[];

    /**
     * Else branch statements (block construction), if present.
     */
    public readonly elseBranch: Statement[] | null;

    /**
     * Create a new `UNLESS` statement.
     *
     * @param condition Condition expression.
     * @param thenBranch Then-branch statements.
     * @param elseBranch Else branch statements, if present.
     */
    public constructor(condition: Expression, thenBranch: Statement[], elseBranch: Statement[] | null)
    {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
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
            throw new Error('UNLESS condition must evaluate to an integer');
        }

        if (this.endUnlessLine === undefined)
        {
            return { result: ExecutionResult.Continue };
        }

        const branchTaken = conditionValue.value === 0;

        runtime.pushControlFrame({
            type: 'unless',
            startLine: currentPc,
            endLine: this.endUnlessLine,
            branchTaken
        });

        if (branchTaken)
        {
            return { result: ExecutionResult.Continue };
        }

        const elseOrEnd = this.elseOrEndLine ?? this.endUnlessLine;
        return { result: ExecutionResult.Goto, gotoTarget: elseOrEnd };
    }

    public override toString(): string
    {
        return `UNLESS ${this.condition.toString()} THEN`;
    }
}
