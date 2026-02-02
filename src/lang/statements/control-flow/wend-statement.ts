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
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        const top = runtime.getCurrentControlFrame();

        if (top && top.type === 'while')
        {
            const whileStmt = program.getStatement(top.startLine);

            if (whileStmt instanceof WhileStatement)
            {
                const conditionValue = whileStmt.condition.evaluate(context);

                if (conditionValue.type !== EduBasicType.Integer)
                {
                    throw new Error('WHILE condition must evaluate to an integer');
                }

                if (conditionValue.value !== 0)
                {
                    return { result: ExecutionResult.Goto, gotoTarget: top.startLine + 1 };
                }
                else
                {
                    runtime.popControlFrame();
                }
            }
        }
        else
        {
            throw new Error('WEND without WHILE');
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'WEND';
    }
}
