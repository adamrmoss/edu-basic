import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `ELSEIF` statement.
 */
export class ElseIfStatement extends Statement
{
    /**
     * Linked `END IF` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public endIfLine?: number;

    /**
     * Line index to jump to when this `ELSEIF` condition is false and no prior branch was taken.
     *
     * Populated by static syntax analysis.
     */
    public nextClauseLine?: number;

    /**
     * Branch condition expression.
     */
    public readonly condition: Expression;

    /**
     * Create a new `ELSEIF` statement.
     *
     * @param condition Branch condition expression.
     */
    public constructor(condition: Expression)
    {
        super();
        this.condition = condition;
    }

    public override getIndentAdjustment(): number
    {
        return 0;
    }

    public override getDisplayIndentAdjustment(): number
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
        if (this.endIfLine === undefined)
        {
            return { result: ExecutionResult.Continue };
        }

        const frame = runtime.findControlFrame('if');
        if (!frame)
        {
            throw new Error('ELSEIF without IF');
        }

        if (frame.branchTaken)
        {
            return { result: ExecutionResult.Goto, gotoTarget: this.endIfLine };
        }

        const conditionValue = this.condition.evaluate(context);
        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('ELSEIF condition must evaluate to an integer');
        }

        if (conditionValue.value !== 0)
        {
            frame.branchTaken = true;
            return { result: ExecutionResult.Continue };
        }

        const nextClause = this.nextClauseLine ?? this.endIfLine;
        return { result: ExecutionResult.Goto, gotoTarget: nextClause };
    }

    public override toString(): string
    {
        return `ELSEIF ${this.condition.toString()} THEN`;
    }
}
