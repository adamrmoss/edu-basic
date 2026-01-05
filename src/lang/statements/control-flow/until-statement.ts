import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { EduBasicType } from '../../edu-basic-value';

export class UntilStatement extends Statement
{
    public constructor(
        public readonly condition: Expression,
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
        while (true)
        {
            const conditionValue = this.condition.evaluate(context);

            if (conditionValue.type !== EduBasicType.Integer)
            {
                throw new Error('UNTIL condition must evaluate to an integer');
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
        let result = `UNTIL ${this.condition.toString()}\n`;

        for (const statement of this.body)
        {
            result += `    ${statement.toString()}\n`;
        }

        result += 'UEND';

        return result;
    }
}

