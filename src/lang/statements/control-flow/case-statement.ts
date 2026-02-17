import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';

/**
 * Selector clause used by the `CASE` statement.
 */
export type CaseSelector =
    | { type: 'value'; value: Expression }
    | { type: 'range'; start: Expression; end: Expression }
    | { type: 'relational'; op: string; value: Expression };

/**
 * Implements the `CASE` statement.
 */
export class CaseStatement extends Statement
{
    /**
     * Linked `END SELECT` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public endSelectLine?: number;

    /**
     * Next `CASE` clause line index (0-based), or `endSelectLine` if none remain.
     *
     * Populated by static syntax analysis.
     */
    public nextCaseLine?: number;

    /**
     * Whether this is the `CASE ELSE` clause.
     */
    public readonly isElse: boolean;

    /**
     * Clause selectors (ignored for `CASE ELSE`).
     */
    public readonly selectors: CaseSelector[];

    /**
     * Create a new `CASE` statement.
     *
     * @param isElse Whether this is the `CASE ELSE` clause.
     * @param selectors Clause selectors.
     */
    public constructor(isElse: boolean, selectors: CaseSelector[])
    {
        super();
        this.isElse = isElse;
        this.selectors = selectors;
    }

    public override getIndentAdjustment(): number
    {
        return 0;
    }

    public override getDisplayIndentAdjustment(): number
    {
        return -1;
    }

    /**
     * Execute the statement.
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
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        const frame = runtime.findControlFrame('select');
        if (!frame)
        {
            throw new Error('CASE without SELECT');
        }

        if (frame.selectMatched)
        {
            const endLine = this.endSelectLine ?? frame.endLine;
            return { result: ExecutionResult.Goto, gotoTarget: endLine };
        }

        if (this.isElse)
        {
            frame.selectMatched = true;
            return { result: ExecutionResult.Continue };
        }

        if (!frame.selectTestValue)
        {
            throw new Error('CASE: missing SELECT test value');
        }

        for (const selector of this.selectors)
        {
            if (this.matchesSelector(frame.selectTestValue, selector, context))
            {
                frame.selectMatched = true;
                return { result: ExecutionResult.Continue };
            }
        }

        if (this.endSelectLine === undefined)
        {
            return { result: ExecutionResult.Continue };
        }

        const nextCaseOrEnd = this.nextCaseLine ?? this.endSelectLine;
        return { result: ExecutionResult.Goto, gotoTarget: nextCaseOrEnd };
    }

    public override toString(): string
    {
        if (this.isElse)
        {
            return 'CASE ELSE';
        }

        if (this.selectors.length === 0)
        {
            return 'CASE';
        }

        const parts = this.selectors.map(s =>
        {
            switch (s.type)
            {
                case 'value':
                    return s.value.toString();
                case 'range':
                    return `${s.start.toString()} TO ${s.end.toString()}`;
                case 'relational':
                    return `IS ${s.op} ${s.value.toString()}`;
            }
        });

        return `CASE ${parts.join(', ')}`;
    }

    private matchesSelector(testValue: EduBasicValue, selector: CaseSelector, context: ExecutionContext): boolean
    {
        switch (selector.type)
        {
            case 'value':
                return this.valuesEqual(testValue, selector.value.evaluate(context));
            case 'range':
                const start = selector.start.evaluate(context);
                const end = selector.end.evaluate(context);
                return this.compareValues(testValue, start) >= 0 &&
                    this.compareValues(testValue, end) <= 0;
            case 'relational':
                const relValue = selector.value.evaluate(context);
                return this.evaluateRelational(testValue, selector.op, relValue);
        }
    }

    private valuesEqual(a: EduBasicValue, b: EduBasicValue): boolean
    {
        return a.value === b.value;
    }

    private compareValues(a: EduBasicValue, b: EduBasicValue): number
    {
        if (a.type === EduBasicType.String || b.type === EduBasicType.String)
        {
            const aStr = `${a.value}`;
            const bStr = `${b.value}`;
            return aStr.localeCompare(bStr);
        }

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

    private evaluateRelational(testValue: EduBasicValue, op: string, compareValue: EduBasicValue): boolean
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
}
