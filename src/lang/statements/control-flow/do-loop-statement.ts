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
        const loopLine = this.findLoop(program, currentPc);

        switch (this.variant)
        {
            case DoLoopVariant.DoWhile:
                return this.executeDoWhile(context, graphics, audio, program, runtime, currentPc, loopLine);
            case DoLoopVariant.DoUntil:
                return this.executeDoUntil(context, graphics, audio, program, runtime, currentPc, loopLine);
            case DoLoopVariant.DoLoopWhile:
            case DoLoopVariant.DoLoopUntil:
            case DoLoopVariant.DoLoop:
                if (this.body.length > 0)
                {
                    runtime.pushControlFrame({
                        type: 'do',
                        startLine: currentPc,
                        endLine: loopLine ?? currentPc,
                        nestedStatements: this.body,
                        nestedIndex: 0,
                        condition: this.condition
                    });

                    return { result: ExecutionResult.Continue };
                }
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
        loopLine: number | undefined
    ): ExecutionStatus
    {
        const conditionValue = this.condition!.evaluate(context);

        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('DO WHILE condition must evaluate to an integer');
        }

        if (conditionValue.value === 0)
        {
            if (loopLine !== undefined)
            {
                return { result: ExecutionResult.Goto, gotoTarget: loopLine };
            }
        }
        else
        {
            if (this.body.length > 0)
            {
                runtime.pushControlFrame({
                    type: 'do',
                    startLine: currentPc,
                    endLine: loopLine ?? currentPc,
                    nestedStatements: this.body,
                    nestedIndex: 0,
                    condition: this.condition
                });

                return { result: ExecutionResult.Continue };
            }
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
        loopLine: number | undefined
    ): ExecutionStatus
    {
        const conditionValue = this.condition!.evaluate(context);

        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('DO UNTIL condition must evaluate to an integer');
        }

        if (conditionValue.value !== 0)
        {
            if (loopLine !== undefined)
            {
                return { result: ExecutionResult.Goto, gotoTarget: loopLine };
            }
        }
        else
        {
            if (this.body.length > 0)
            {
                runtime.pushControlFrame({
                    type: 'do',
                    startLine: currentPc,
                    endLine: loopLine ?? currentPc,
                    nestedStatements: this.body,
                    nestedIndex: 0,
                    condition: this.condition
                });

                return { result: ExecutionResult.Continue };
            }
        }

        return { result: ExecutionResult.Continue };
    }

    private findLoop(program: Program, startLine: number): number | undefined
    {
        const statements = program.getStatements();

        for (let i = startLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof LoopStatement)
            {
                if (stmt.indentLevel === this.indentLevel)
                {
                    return i;
                }
            }

            if (stmt.indentLevel < this.indentLevel)
            {
                break;
            }
        }

        return undefined;
    }

    public override toString(): string
    {
        let result = '';

        switch (this.variant)
        {
            case DoLoopVariant.DoWhile:
                result = `DO WHILE ${this.condition!.toString()}\n`;
                break;
            case DoLoopVariant.DoUntil:
                result = `DO UNTIL ${this.condition!.toString()}\n`;
                break;
            case DoLoopVariant.DoLoop:
            case DoLoopVariant.DoLoopWhile:
            case DoLoopVariant.DoLoopUntil:
                result = 'DO\n';
                break;
        }

        for (const statement of this.body)
        {
            result += `    ${statement.toString()}\n`;
        }

        switch (this.variant)
        {
            case DoLoopVariant.DoWhile:
            case DoLoopVariant.DoUntil:
            case DoLoopVariant.DoLoop:
                result += 'LOOP';
                break;
            case DoLoopVariant.DoLoopWhile:
                result += `LOOP WHILE ${this.condition!.toString()}`;
                break;
            case DoLoopVariant.DoLoopUntil:
                result += `LOOP UNTIL ${this.condition!.toString()}`;
                break;
        }

        return result;
    }
}
