import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { WhileStatement } from './while-statement';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `WEND` statement.
 */
export class WendStatement extends Statement
{
    /**
     * Linked WHILE line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public whileLine?: number;

    public constructor()
    {
        super();
    }

    /**
     * Get the editor indent adjustment.
     *
     * @returns Indent delta for this statement.
     */
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
        // When not linked, no-op; else resolve WHILE, re-evaluate condition and loop back or fall through.
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        if (this.whileLine === undefined)
        {
            throw new Error('WEND without WHILE');
        }

        const whileStmt = program.getStatement(this.whileLine);
        if (!(whileStmt instanceof WhileStatement))
        {
            throw new Error('WEND without WHILE');
        }

        // Re-evaluate WHILE condition; if true loop back to body (whileLine+1), else fall through past WEND.
        const conditionValue = whileStmt.condition.evaluate(context);
        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('WHILE condition must evaluate to an integer');
        }

        if (conditionValue.value !== 0)
        {
            return { result: ExecutionResult.Goto, gotoTarget: this.whileLine + 1 };
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'WEND';
    }
}
