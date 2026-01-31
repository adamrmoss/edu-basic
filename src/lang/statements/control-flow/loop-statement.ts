import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { DoLoopStatement, DoLoopVariant } from './do-loop-statement';
import { EduBasicType } from '../../edu-basic-value';
import { Expression } from '../../expressions/expression';

export enum LoopConditionVariant
{
    None,
    While,
    Until
}

export class LoopStatement extends Statement
{
    public constructor(
        public readonly conditionVariant: LoopConditionVariant = LoopConditionVariant.None,
        public readonly condition: Expression | null = null
    )
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
        const top = runtime.getCurrentControlFrame();

        if (top && top.type === 'do')
        {
            const doStmt = program.getStatement(top.startLine);

            if (doStmt instanceof DoLoopStatement)
            {
                const variant = doStmt.variant;

                if (variant === DoLoopVariant.DoLoop)
                {
                    if (this.conditionVariant === LoopConditionVariant.None)
                    {
                        return { result: ExecutionResult.Goto, gotoTarget: top.startLine + 1 };
                    }

                    if (!this.condition)
                    {
                        throw new Error('LOOP condition is missing');
                    }

                    const conditionValue = this.condition.evaluate(context);
                    if (conditionValue.type !== EduBasicType.Integer)
                    {
                        throw new Error('LOOP condition must evaluate to an integer');
                    }

                    const shouldContinue = this.conditionVariant === LoopConditionVariant.While
                        ? conditionValue.value !== 0
                        : conditionValue.value === 0;

                    if (shouldContinue)
                    {
                        return { result: ExecutionResult.Goto, gotoTarget: top.startLine + 1 };
                    }

                    runtime.popControlFrame();
                    return { result: ExecutionResult.Continue };
                }

                if (variant === DoLoopVariant.DoWhile || variant === DoLoopVariant.DoUntil ||
                    variant === DoLoopVariant.DoLoopWhile || variant === DoLoopVariant.DoLoopUntil)
                {
                    const condition = doStmt.condition;
                    if (!condition)
                    {
                        throw new Error('LOOP condition is missing');
                    }

                    const conditionValue = condition.evaluate(context);
                    if (conditionValue.type !== EduBasicType.Integer)
                    {
                        throw new Error('LOOP condition must evaluate to an integer');
                    }

                    const shouldContinue = (variant === DoLoopVariant.DoWhile || variant === DoLoopVariant.DoLoopWhile)
                        ? conditionValue.value !== 0
                        : conditionValue.value === 0;

                    if (shouldContinue)
                    {
                        return { result: ExecutionResult.Goto, gotoTarget: top.startLine + 1 };
                    }

                    runtime.popControlFrame();
                    return { result: ExecutionResult.Continue };
                }
            }
        }
        else
        {
            throw new Error('LOOP without DO');
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        switch (this.conditionVariant)
        {
            case LoopConditionVariant.None:
                return 'LOOP';
            case LoopConditionVariant.While:
                return `LOOP WHILE ${this.condition?.toString() ?? ''}`.trim();
            case LoopConditionVariant.Until:
                return `LOOP UNTIL ${this.condition?.toString() ?? ''}`.trim();
        }
    }
}
