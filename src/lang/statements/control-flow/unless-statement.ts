import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { EduBasicType } from '../../edu-basic-value';

export class UnlessStatement extends Statement
{
    public constructor(
        public readonly condition: Expression,
        public readonly thenBranch: Statement[],
        public readonly elseBranch: Statement[] | null
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
        const conditionValue = this.condition.evaluate(context);

        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('UNLESS condition must evaluate to an integer');
        }

        if (conditionValue.value === 0)
        {
            return this.executeStatements(this.thenBranch, context, graphics, audio);
        }

        if (this.elseBranch !== null)
        {
            return this.executeStatements(this.elseBranch, context, graphics, audio);
        }

        return { result: ExecutionResult.Continue };
    }

    private executeStatements(
        statements: Statement[],
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio
    ): ExecutionStatus
    {
        for (const statement of statements)
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
        let result = `UNLESS ${this.condition.toString()} THEN\n`;

        for (const statement of this.thenBranch)
        {
            result += `    ${statement.toString()}\n`;
        }

        if (this.elseBranch !== null)
        {
            result += 'ELSE\n';
            for (const statement of this.elseBranch)
            {
                result += `    ${statement.toString()}\n`;
            }
        }

        result += 'END UNLESS';

        return result;
    }
}

