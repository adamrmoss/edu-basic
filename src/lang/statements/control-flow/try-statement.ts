import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

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
        if (this.tryBody.length > 0)
        {
            for (const stmt of this.tryBody)
            {
                const status = stmt.execute(context, graphics, audio, program, runtime);
                if (status.result !== ExecutionResult.Continue)
                {
                    return status;
                }
            }
        }

        return { result: ExecutionResult.Continue };
    }

    private findEndTry(program: Program, startLine: number): number | undefined
    {
        const statements = program.getStatements();

        for (let i = startLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt.toString() === 'END TRY')
            {
                return i;
            }
        }

        return undefined;
    }

    public override toString(): string
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
