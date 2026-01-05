import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export interface CatchClause
{
    variableName: string | null;
    body: Statement[];
}

export class TryStatement extends Statement
{
    public constructor(
        public readonly tryBody: Statement[],
        public readonly catchClauses: CatchClause[],
        public readonly finallyBody: Statement[] | null
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
        throw new Error('TRY statement not yet implemented');
    }

    public toString(): string
    {
        let result = 'TRY\n';

        for (const statement of this.tryBody)
        {
            result += `    ${statement.toString()}\n`;
        }

        for (const catchClause of this.catchClauses)
        {
            if (catchClause.variableName)
            {
                result += `CATCH ${catchClause.variableName}\n`;
            }
            else
            {
                result += 'CATCH\n';
            }

            for (const statement of catchClause.body)
            {
                result += `    ${statement.toString()}\n`;
            }
        }

        if (this.finallyBody)
        {
            result += 'FINALLY\n';
            for (const statement of this.finallyBody)
            {
                result += `    ${statement.toString()}\n`;
            }
        }

        result += 'END TRY';

        return result;
    }
}

