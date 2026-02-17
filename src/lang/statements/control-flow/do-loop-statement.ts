import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * `DO` statement variants.
 */
export enum DoLoopVariant
{
    DoWhile,
    DoUntil,
    DoLoopWhile,
    DoLoopUntil,
    DoLoop
}

/**
 * Implements the `DO` statement.
 */
export class DoLoopStatement extends Statement
{
    /**
     * Linked `LOOP` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public loopLine?: number;

    /**
     * Variant discriminator for this `DO` statement.
     */
    public readonly variant: DoLoopVariant;

    /**
     * Optional loop condition expression.
     */
    public readonly condition: Expression | null;

    /**
     * Statement body for block construction (not executed directly here).
     */
    public readonly body: Statement[];

    /**
     * Create a new `DO` statement.
     *
     * @param variant Variant discriminator.
     * @param condition Optional loop condition expression.
     * @param body Statement body.
     */
    public constructor(variant: DoLoopVariant, condition: Expression | null, body: Statement[])
    {
        super();
        this.variant = variant;
        this.condition = condition;
        this.body = body;
    }

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
        if (this.loopLine === undefined)
        {
            return { result: ExecutionResult.Continue };
        }

        switch (this.variant)
        {
            case DoLoopVariant.DoWhile:
                return this.executeDoWhile(context, graphics, audio, program, runtime, currentPc, this.loopLine);
            case DoLoopVariant.DoUntil:
                return this.executeDoUntil(context, graphics, audio, program, runtime, currentPc, this.loopLine);
            case DoLoopVariant.DoLoopWhile:
            case DoLoopVariant.DoLoopUntil:
            case DoLoopVariant.DoLoop:
                return { result: ExecutionResult.Continue };
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoWhile(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution,
        currentPc: number,
        loopLine: number
    ): ExecutionStatus
    {
        const conditionValue = this.condition!.evaluate(context);

        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('DO WHILE condition must evaluate to an integer');
        }

        if (conditionValue.value === 0)
        {
            return { result: ExecutionResult.Goto, gotoTarget: loopLine + 1 };
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoUntil(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution,
        currentPc: number,
        loopLine: number
    ): ExecutionStatus
    {
        const conditionValue = this.condition!.evaluate(context);

        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('DO UNTIL condition must evaluate to an integer');
        }

        if (conditionValue.value !== 0)
        {
            return { result: ExecutionResult.Goto, gotoTarget: loopLine + 1 };
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        switch (this.variant)
        {
            case DoLoopVariant.DoWhile:
                return `DO WHILE ${this.condition!.toString()}`;
            case DoLoopVariant.DoUntil:
                return `DO UNTIL ${this.condition!.toString()}`;
            case DoLoopVariant.DoLoop:
            case DoLoopVariant.DoLoopWhile:
            case DoLoopVariant.DoLoopUntil:
                return 'DO';
        }
    }
}
