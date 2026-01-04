import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';
import { EduBasicType } from '../../edu-basic-value';

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

    public getIndentAdjustment(): number
    {
        return 1;
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        switch (this.variant)
        {
            case DoLoopVariant.DoWhile:
                return this.executeDoWhile(context, program);
            case DoLoopVariant.DoUntil:
                return this.executeDoUntil(context, program);
            case DoLoopVariant.DoLoopWhile:
                return this.executeDoLoopWhile(context, program);
            case DoLoopVariant.DoLoopUntil:
                return this.executeDoLoopUntil(context, program);
            case DoLoopVariant.DoLoop:
                return this.executeDoLoop(context, program);
            default:
                throw new Error('Unknown DO loop variant');
        }
    }

    private executeDoWhile(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // DO WHILE condition ... LOOP (test at top)
        while (true)
        {
            const conditionValue = this.condition!.evaluate(context);

            if (conditionValue.type !== EduBasicType.Integer)
            {
                throw new Error('DO WHILE condition must evaluate to an integer');
            }

            if (conditionValue.value === 0)
            {
                break;
            }

            const status = this.executeBody(context, program);

            if (status.result === ExecutionResult.End || status.result === ExecutionResult.Goto)
            {
                return status;
            }

            // TODO: Handle EXIT DO
            // TODO: Handle CONTINUE DO
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoUntil(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // DO UNTIL condition ... LOOP (test at top)
        while (true)
        {
            const conditionValue = this.condition!.evaluate(context);

            if (conditionValue.type !== EduBasicType.Integer)
            {
                throw new Error('DO UNTIL condition must evaluate to an integer');
            }

            if (conditionValue.value !== 0)
            {
                break;
            }

            const status = this.executeBody(context, program);

            if (status.result === ExecutionResult.End || status.result === ExecutionResult.Goto)
            {
                return status;
            }

            // TODO: Handle EXIT DO
            // TODO: Handle CONTINUE DO
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoLoopWhile(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // DO ... LOOP WHILE condition (test at bottom)
        while (true)
        {
            const status = this.executeBody(context, program);

            if (status.result === ExecutionResult.End || status.result === ExecutionResult.Goto)
            {
                return status;
            }

            const conditionValue = this.condition!.evaluate(context);

            if (conditionValue.type !== EduBasicType.Integer)
            {
                throw new Error('LOOP WHILE condition must evaluate to an integer');
            }

            if (conditionValue.value === 0)
            {
                break;
            }

            // TODO: Handle EXIT DO
            // TODO: Handle CONTINUE DO
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoLoopUntil(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // DO ... LOOP UNTIL condition (test at bottom)
        while (true)
        {
            const status = this.executeBody(context, program);

            if (status.result === ExecutionResult.End || status.result === ExecutionResult.Goto)
            {
                return status;
            }

            const conditionValue = this.condition!.evaluate(context);

            if (conditionValue.type !== EduBasicType.Integer)
            {
                throw new Error('LOOP UNTIL condition must evaluate to an integer');
            }

            if (conditionValue.value !== 0)
            {
                break;
            }

            // TODO: Handle EXIT DO
            // TODO: Handle CONTINUE DO
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoLoop(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // DO ... LOOP (infinite loop)
        while (true)
        {
            const status = this.executeBody(context, program);

            if (status.result === ExecutionResult.End || status.result === ExecutionResult.Goto)
            {
                return status;
            }

            // TODO: Handle EXIT DO
            // TODO: Handle CONTINUE DO
        }
    }

    private executeBody(context: ExecutionContext, program: Program): ExecutionStatus
    {
        for (const statement of this.body)
        {
            const status = statement.execute(context, program);

            if (status.result !== ExecutionResult.Continue)
            {
                return status;
            }
        }

        return { result: ExecutionResult.Continue };
    }

    public toString(): string
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

