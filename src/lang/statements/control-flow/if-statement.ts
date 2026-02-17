import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `IF` statement.
 */
export class IfStatement extends Statement
{
    /**
     * Linked `END IF` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public endIfLine?: number;

    /**
     * Line index to jump to when the condition is false.
     *
     * This is typically the next `ELSEIF`, `ELSE`, or the `END IF`.
     * Populated by static syntax analysis.
     */
    public nextClauseLine?: number;

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
        // Evaluate condition (integer); push IF frame with branch flag, then run then-branch or jump to next clause.
        const currentPc = context.getProgramCounter();
        const conditionValue = this.condition.evaluate(context);
        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('IF condition must evaluate to an integer');
        }

        if (this.endIfLine === undefined)
        {
            return { result: ExecutionResult.Continue };
        }

        const branchTaken = conditionValue.value !== 0;

        runtime.pushControlFrame({
            type: 'if',
            startLine: currentPc,
            endLine: this.endIfLine,
            branchTaken
        });

        if (branchTaken)
        {
            return { result: ExecutionResult.Continue };
        }

        const nextClause = this.nextClauseLine ?? this.endIfLine;
        return { result: ExecutionResult.Goto, gotoTarget: nextClause };
    }

    public override toString(): string
    {
        return `IF ${this.condition.toString()} THEN`;
    }
}
