import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { DoLoopStatement, DoLoopVariant } from './do-loop-statement';
import { EduBasicType } from '../../edu-basic-value';

export class LoopStatement extends Statement
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
        const doFrame = runtime.findControlFrame('do');

        if (doFrame)
        {
            const doStmt = program.getStatement(doFrame.startLine);

            if (doStmt instanceof DoLoopStatement)
            {
                const variant = doStmt.variant;
                const condition = doFrame.condition;

                if (variant === DoLoopVariant.DoLoopWhile || variant === DoLoopVariant.DoLoopUntil)
                {
                    if (condition)
                    {
                        const conditionValue = condition.evaluate(context);

                        if (conditionValue.type !== EduBasicType.Integer)
                        {
                            throw new Error('LOOP condition must evaluate to an integer');
                        }

                        const shouldContinue = variant === DoLoopVariant.DoLoopWhile
                            ? conditionValue.value !== 0
                            : conditionValue.value === 0;

                        if (shouldContinue)
                        {
                            if (doFrame.nestedStatements && doFrame.nestedStatements.length > 0)
                            {
                                doFrame.nestedIndex = 0;
                                return { result: ExecutionResult.Goto, gotoTarget: doFrame.startLine };
                            }
                        }
                        else
                        {
                            runtime.popControlFrame();
                        }
                    }
                }
                else if (variant === DoLoopVariant.DoLoop)
                {
                    if (doFrame.nestedStatements && doFrame.nestedStatements.length > 0)
                    {
                        doFrame.nestedIndex = 0;
                        return { result: ExecutionResult.Goto, gotoTarget: doFrame.startLine };
                    }
                }
            }
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return 'LOOP';
    }
}
