import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { DoLoopStatement, DoLoopVariant } from './do-loop-statement';
import { EduBasicType } from '../../edu-basic-value';
import { Expression } from '../../expressions/expression';

/**
 * Condition variants for the `LOOP` statement.
 */
export enum LoopConditionVariant
{
    None,
    While,
    Until
}

/**
 * Implements the `LOOP` statement.
 */
export class LoopStatement extends Statement
{
    /**
     * Condition variant discriminator.
     */
    public readonly conditionVariant: LoopConditionVariant;

    /**
     * Optional loop condition expression.
     */
    public readonly condition: Expression | null;

    /**
     * Create a new `LOOP` statement.
     *
     * @param conditionVariant Condition variant discriminator.
     * @param condition Optional loop condition expression.
     */
    public constructor(conditionVariant: LoopConditionVariant = LoopConditionVariant.None, condition: Expression | null = null)
    {
        super();
        this.conditionVariant = conditionVariant;
        this.condition = condition;
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
