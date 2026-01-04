import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';
import { EduBasicType } from '../../edu-basic-value';

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

    public getIndentAdjustment(): number
    {
        return 1;
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        const testValue = this.testExpression.evaluate(context);

        for (const caseClause of this.cases)
        {
            if (this.matchesCase(testValue, caseClause, context))
            {
                return this.executeStatements(caseClause.statements, context, program);
            }
        }

        return { result: ExecutionResult.Continue };
    }

    private matchesCase(testValue: any, caseClause: CaseClause, context: ExecutionContext): boolean
    {
        switch (caseClause.matchType)
        {
            case CaseMatchType.Value:
                // CASE value1, value2, value3
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
                // CASE value1 TO value2
                const rangeStart = caseClause.rangeStart!.evaluate(context);
                const rangeEnd = caseClause.rangeEnd!.evaluate(context);
                return this.compareValues(testValue, rangeStart) >= 0 &&
                       this.compareValues(testValue, rangeEnd) <= 0;

            case CaseMatchType.Relational:
                // CASE IS > value
                const relValue = caseClause.relationalValue!.evaluate(context);
                return this.evaluateRelational(testValue, caseClause.relationalOp!, relValue);

            case CaseMatchType.Else:
                // CASE ELSE
                return true;

            default:
                return false;
        }
    }

    private valuesEqual(a: any, b: any): boolean
    {
        // TODO: Implement proper value comparison for all types
        return a.value === b.value;
    }

    private compareValues(a: any, b: any): number
    {
        // TODO: Implement proper value comparison for all types
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

    private executeStatements(
        statements: Statement[],
        context: ExecutionContext,
        program: Program
    ): ExecutionStatus
    {
        for (const statement of statements)
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

