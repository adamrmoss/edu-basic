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
import { IfStatement } from './if-statement';

/**
 * Implements the `UNLESS` statement.
 */
export class UnlessStatement extends Statement
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

        const endUnlessLine = runtime.findMatchingEndUnless(currentPc);
        if (endUnlessLine === undefined)
        {
            throw new Error('UNLESS: missing END UNLESS');
        }

        const branchTaken = conditionValue.value === 0;

        runtime.pushControlFrame({
            type: 'unless',
            startLine: currentPc,
            endLine: endUnlessLine,
            branchTaken
        });

        if (branchTaken)
        {
            return { result: ExecutionResult.Continue };
        }

        const elseOrEnd = this.findElseOrEnd(program, currentPc + 1, endUnlessLine);
        return { result: ExecutionResult.Goto, gotoTarget: elseOrEnd };

        return { result: ExecutionResult.Continue };
    }

    private findElseOrEnd(program: Program, fromLine: number, endUnlessLine: number): number
    {
        const statements = program.getStatements();
        let ifDepth = 0;
        let unlessDepth = 0;

        for (let i = fromLine; i <= endUnlessLine && i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof IfStatement)
            {
                ifDepth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.If)
            {
                if (ifDepth > 0)
                {
                    ifDepth--;
                    continue;
                }
            }

            if (stmt instanceof UnlessStatement)
            {
                unlessDepth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.Unless)
            {
                if (unlessDepth > 0)
                {
                    unlessDepth--;
                    continue;
                }
            }

            if (ifDepth === 0 && unlessDepth === 0)
            {
                if (stmt instanceof ElseStatement)
                {
                    return i;
                }
            }
        }

        return endUnlessLine;
    }

    public override toString(): string
    {
        return `UNLESS ${this.condition.toString()} THEN`;
    }
}
