import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
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

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        switch (this.variant)
        {
            case DoLoopVariant.DoWhile:
                return this.executeDoWhile(context, graphics, audio);
            case DoLoopVariant.DoUntil:
                return this.executeDoUntil(context, graphics, audio);
            case DoLoopVariant.DoLoopWhile:
                return this.executeDoLoopWhile(context, graphics, audio);
            case DoLoopVariant.DoLoopUntil:
                return this.executeDoLoopUntil(context, graphics, audio);
            case DoLoopVariant.DoLoop:
                return this.executeDoLoop(context, graphics, audio);
            default:
                throw new Error('Unknown DO loop variant');
        }
    }

    private executeDoWhile(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
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

            const status = this.executeBody(context, graphics, audio);

            if (status.result === ExecutionResult.End || status.result === ExecutionResult.Goto)
            {
                return status;
            }
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoUntil(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
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

            const status = this.executeBody(context, graphics, audio);

            if (status.result === ExecutionResult.End || status.result === ExecutionResult.Goto)
            {
                return status;
            }
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoLoopWhile(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        while (true)
        {
            const status = this.executeBody(context, graphics, audio);

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
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoLoopUntil(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        while (true)
        {
            const status = this.executeBody(context, graphics, audio);

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
        }

        return { result: ExecutionResult.Continue };
    }

    private executeDoLoop(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        while (true)
        {
            const status = this.executeBody(context, graphics, audio);

            if (status.result === ExecutionResult.End || status.result === ExecutionResult.Goto)
            {
                return status;
            }
        }
    }

    private executeBody(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        for (const statement of this.body)
        {
            const status = statement.execute(context, graphics, audio);

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

