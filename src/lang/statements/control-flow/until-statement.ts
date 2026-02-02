import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `UNTIL` statement.
 */
export class UntilStatement extends Statement
{
    /**
     * Linked `UEND` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public uendLine?: number;

    /**
     * Condition expression.
     */
    public readonly condition: Expression;

    /**
     * Loop body statements (block construction).
     */
    public readonly body: Statement[];

    /**
     * Create a new `UNTIL` statement.
     *
     * @param condition Condition expression.
     * @param body Loop body statements.
     */
    public constructor(condition: Expression, body: Statement[])
    {
        super();
        this.condition = condition;
        this.body = body;
    }

    /**
     * Get the editor indent adjustment.
     *
     * @returns Indent delta for this statement.
     */
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
            throw new Error('UNTIL condition must evaluate to an integer');
        }

        if (this.uendLine === undefined)
        {
            return { result: ExecutionResult.Continue };
        }

        if (conditionValue.value !== 0)
        {
            return { result: ExecutionResult.Goto, gotoTarget: this.uendLine + 1 };
        }

        runtime.pushControlFrame({
            type: 'while',
            startLine: currentPc,
            endLine: this.uendLine
        });

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `UNTIL ${this.condition.toString()}`;
    }
}
