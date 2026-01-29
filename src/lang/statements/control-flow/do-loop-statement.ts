import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { LoopStatement } from './loop-statement';

export enum DoLoopVariant
{
    DoWhile,
    DoUntil,
    DoLoopWhile,
    DoLoopUntil,
    DoLoop
}

export class DoLoopStatement extends Statement
{
    public constructor(
        public readonly variant: DoLoopVariant,
        public readonly condition: Expression | null,
        public readonly body: Statement[]
    )
    {
        super();
    }

    public override getIndentAdjustment(): number
    {
        return 1;
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const currentPc = context.getProgramCounter();
        const loopLine = runtime.findMatchingLoop(currentPc);
        if (loopLine === undefined)
        {
            throw new Error('DO: missing LOOP');
        }

        switch (this.variant)
        {
            case DoLoopVariant.DoWhile:
                return this.executeDoWhile(context, graphics, audio, program, runtime, currentPc, loopLine);
            case DoLoopVariant.DoUntil:
                return this.executeDoUntil(context, graphics, audio, program, runtime, currentPc, loopLine);
            case DoLoopVariant.DoLoopWhile:
            case DoLoopVariant.DoLoopUntil:
            case DoLoopVariant.DoLoop:
                runtime.pushControlFrame({
                    type: 'do',
                    startLine: currentPc,
                    endLine: loopLine
                });

                return { result: ExecutionResult.Continue };
                break;
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

        runtime.pushControlFrame({
            type: 'do',
            startLine: currentPc,
            endLine: loopLine
        });

        return { result: ExecutionResult.Continue };

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

        runtime.pushControlFrame({
            type: 'do',
            startLine: currentPc,
            endLine: loopLine
        });

        return { result: ExecutionResult.Continue };

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
