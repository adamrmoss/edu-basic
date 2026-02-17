import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Catch clause data for a `TRY` statement.
 */
export interface CatchClause
{
    /**
     * Optional variable name to receive the error value.
     */
    variableName: string | null;

    /**
     * Catch clause body.
     */
    body: Statement[];
}

/**
 * Implements the `TRY` statement.
 */
export class TryStatement extends Statement
{
    /**
     * Linked `END TRY` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public endTryLine?: number;

    /**
     * TRY body statements.
     */
    public readonly tryBody: Statement[];

    /**
     * CATCH clause definitions.
     */
    public readonly catchClauses: CatchClause[];

    /**
     * FINALLY body statements, if present.
     */
    public readonly finallyBody: Statement[] | null;

    /**
     * Create a new `TRY` statement.
     *
     * @param tryBody TRY body statements.
     * @param catchClauses CATCH clause definitions.
     * @param finallyBody FINALLY body statements, if present.
     */
    public constructor(tryBody: Statement[], catchClauses: CatchClause[], finallyBody: Statement[] | null)
    {
        super();
        this.tryBody = tryBody;
        this.catchClauses = catchClauses;
        this.finallyBody = finallyBody;
    }

    public override getIndentAdjustment(): number
    {
        return 1;
    }

    /**
     * Execute the statement.
     *
     * Note: Structured TRY/CATCH control flow is also coordinated by the runtime using control frames.
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
        if (this.tryBody.length > 0)
        {
            // Run TRY body in order; return on first non-Continue so jump or error propagates.
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

        // Scan forward for END TRY by line index.
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
