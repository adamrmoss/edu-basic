import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { EndStatement, EndType } from './end-statement';

export enum CaseMatchType
{
    Value,
    Range,
    Relational,
    Else
}

export interface CaseClause
{
    matchType: CaseMatchType;
    values?: Expression[];
    rangeStart?: Expression;
    rangeEnd?: Expression;
    relationalOp?: string;
    relationalValue?: Expression;
    statements: Statement[];
}

export class SelectCaseStatement extends Statement
{
    public constructor(
        public readonly testExpression: Expression,
        public readonly cases: CaseClause[]
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
        const testValue = this.testExpression.evaluate(context);

        for (const caseClause of this.cases)
        {
            if (this.matchesCase(testValue, caseClause, context))
            {
                if (caseClause.statements.length > 0)
                {
                    for (const stmt of caseClause.statements)
                    {
                        const status = stmt.execute(context, graphics, audio, program, runtime);
                        if (status.result !== ExecutionResult.Continue)
                        {
                            return status;
                        }
                    }

                    return { result: ExecutionResult.Continue };
                }

                break;
            }
        }

        return { result: ExecutionResult.Continue };
    }

    private findEndSelect(program: Program, startLine: number): number | undefined
    {
        const statements = program.getStatements();

        for (let i = startLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof EndStatement && stmt.endType === EndType.Select)
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

    private matchesCase(testValue: any, caseClause: CaseClause, context: ExecutionContext): boolean
    {
        switch (caseClause.matchType)
        {
            case CaseMatchType.Value:
                for (const expr of caseClause.values!)
                {
                    const value = expr.evaluate(context);
                    if (this.valuesEqual(testValue, value))
                    {
                        return true;
                    }
                }
                return false;

            case CaseMatchType.Range:
                const rangeStart = caseClause.rangeStart!.evaluate(context);
                const rangeEnd = caseClause.rangeEnd!.evaluate(context);
                return this.compareValues(testValue, rangeStart) >= 0 &&
                       this.compareValues(testValue, rangeEnd) <= 0;

            case CaseMatchType.Relational:
                const relValue = caseClause.relationalValue!.evaluate(context);
                return this.evaluateRelational(testValue, caseClause.relationalOp!, relValue);

            case CaseMatchType.Else:
                return true;

            default:
                return false;
        }
    }

    private valuesEqual(a: any, b: any): boolean
    {
        return a.value === b.value;
    }

    private compareValues(a: any, b: any): number
    {
        if (a.value < b.value)
        {
            return -1;
        }

        if (a.value > b.value)
        {
            return 1;
        }

        return 0;
    }

    private evaluateRelational(testValue: any, op: string, compareValue: any): boolean
    {
        const cmp = this.compareValues(testValue, compareValue);

        switch (op)
        {
            case '=':
                return cmp === 0;
            case '<>':
                return cmp !== 0;
            case '<':
                return cmp < 0;
            case '>':
                return cmp > 0;
            case '<=':
                return cmp <= 0;
            case '>=':
                return cmp >= 0;
            default:
                throw new Error(`Unknown relational operator: ${op}`);
        }
    }


    public override toString(): string
    {
        let result = `SELECT CASE ${this.testExpression.toString()}\n`;

        for (const caseClause of this.cases)
        {
            switch (caseClause.matchType)
            {
                case CaseMatchType.Value:
                    result += `    CASE ${caseClause.values!.map(v => v.toString()).join(', ')}\n`;
                    break;
                case CaseMatchType.Range:
                    result += `    CASE ${caseClause.rangeStart!.toString()} TO ${caseClause.rangeEnd!.toString()}\n`;
                    break;
                case CaseMatchType.Relational:
                    result += `    CASE IS ${caseClause.relationalOp} ${caseClause.relationalValue!.toString()}\n`;
                    break;
                case CaseMatchType.Else:
                    result += `    CASE ELSE\n`;
                    break;
            }

            for (const statement of caseClause.statements)
            {
                result += `        ${statement.toString()}\n`;
            }
        }

        result += 'END SELECT';

        return result;
    }
}
