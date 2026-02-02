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
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        const top = runtime.getCurrentControlFrame();

        if (top && top.type === 'while')
        {
            const untilStmt = program.getStatement(top.startLine);

            if (untilStmt instanceof UntilStatement)
            {
                const conditionValue = untilStmt.condition.evaluate(context);

                if (conditionValue.type !== EduBasicType.Integer)
                {
                    throw new Error('UNTIL condition must evaluate to an integer');
                }

                if (conditionValue.value === 0)
                {
                    return { result: ExecutionResult.Goto, gotoTarget: top.startLine + 1 };
                }

                runtime.popControlFrame();
                return { result: ExecutionResult.Continue };
            }
        }
        else
        {
            throw new Error('UEND without UNTIL');
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'UEND';
    }
}
