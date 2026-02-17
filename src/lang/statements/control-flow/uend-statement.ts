import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { UntilStatement } from './until-statement';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `UEND` statement.
 */
export class UendStatement extends Statement
{
    /**
     * Linked UNTIL line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public untilLine?: number;

    public constructor()
    {
        super();
    }

    public override getIndentAdjustment(): number
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
        // When not linked, no-op; else resolve UNTIL, evaluate condition—loop back or exit past UEND.
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        if (this.untilLine === undefined)
        {
            throw new Error('UEND without UNTIL');
        }

        const untilStmt = program.getStatement(this.untilLine);
        if (!(untilStmt instanceof UntilStatement))
        {
            throw new Error('UEND without UNTIL');
        }

        const conditionValue = untilStmt.condition.evaluate(context);

        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('UNTIL condition must evaluate to an integer');
        }

        if (conditionValue.value === 0)
        {
            return { result: ExecutionResult.Goto, gotoTarget: this.untilLine + 1 };
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'UEND';
    }
}
