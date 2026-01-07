import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { UntilStatement } from './until-statement';
import { EduBasicType } from '../../edu-basic-value';

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

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const untilFrame = runtime.findControlFrame('while');

        if (untilFrame)
        {
            const untilStmt = program.getStatement(untilFrame.startLine);

            if (untilStmt instanceof UntilStatement)
            {
                const conditionValue = untilStmt.condition.evaluate(context);

                if (conditionValue.type !== EduBasicType.Integer)
                {
                    throw new Error('UNTIL condition must evaluate to an integer');
                }

                if (conditionValue.value === 0)
                {
                    if (untilFrame.nestedStatements && untilFrame.nestedStatements.length > 0)
                    {
                        untilFrame.nestedIndex = 0;
                        return { result: ExecutionResult.Goto, gotoTarget: untilFrame.startLine };
                    }
                }
                else
                {
                    runtime.popControlFrame();
                }
            }
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'UEND';
    }
}

