import { Program } from './program';
import { Statement } from './statements/statement';
import {
    CallStatement,
    CaseStatement,
    DoLoopStatement,
    ElseIfStatement,
    ElseStatement,
    EndStatement,
    EndType,
    ForStatement,
    GosubStatement,
    GotoStatement,
    IfStatement,
    LabelStatement,
    LoopStatement,
    NextStatement,
    SelectCaseStatement,
    SubStatement,
    TryStatement,
    UendStatement,
    UnlessStatement,
    UntilStatement,
    WendStatement,
    WhileStatement
} from './statements/control-flow';
import { UnparsableStatement } from './statements/unparsable-statement';

export interface StaticAnalysisError
{
    /**
     * 0-based program line index (matches `Program` statement index).
     */
    lineNumber: number;

    /**
     * Human-readable error message.
     */
    message: string;
}

export interface ProgramSyntaxAnalysis
{
    /**
     * Static (non-runtime) errors discovered during analysis.
     */
    errors: StaticAnalysisError[];

    /**
     * Label map (uppercase name -> program line index).
     */
    labels: Map<string, number>;

    /**
     * Subroutine map (uppercase name -> program line index).
     */
    subs: Map<string, number>;
}

type BlockType =
    | 'if'
    | 'unless'
    | 'select'
    | 'for'
    | 'while'
    | 'do'
    | 'until'
    | 'sub'
    | 'try';

interface BlockFrame
{
    type: BlockType;
    startLine: number;
    clauseLines?: number[];
    elseLine?: number;
    caseLines?: number[];
    hasCaseElse?: boolean;
}

/**
 * Performs static syntax analysis over a parsed `Program` and links control-flow statements together.
 *
 * This is intended to run after every program edit/rebuild:
 * - Assign `statement.lineNumber`
 * - Build label/subroutine maps
 * - Link block constructs (IF/END IF, FOR/NEXT, etc.) by populating line-number references on statements
 * - Report structural errors (missing END IF, ELSE without IF, etc.)
 */
export class ProgramSyntaxAnalyzer
{
    public analyzeAndLink(program: Program): ProgramSyntaxAnalysis
    {
        const statements = program.getStatements() as readonly Statement[];
        const errors: StaticAnalysisError[] = [];

        // Pass 1: assign line numbers and clear stale link metadata.
        for (let i = 0; i < statements.length; i++)
        {
            const stmt = statements[i] as any;
            stmt.lineNumber = i;

            // Clear common link properties (they are re-populated below when applicable).
            stmt.endIfLine = undefined;
            stmt.endUnlessLine = undefined;
            stmt.endSelectLine = undefined;
            stmt.endSubLine = undefined;
            stmt.endTryLine = undefined;
            stmt.nextClauseLine = undefined;
            stmt.elseOrEndLine = undefined;
            stmt.firstCaseLine = undefined;
            stmt.nextCaseLine = undefined;
            stmt.nextLine = undefined;
            stmt.wendLine = undefined;
            stmt.loopLine = undefined;
            stmt.uendLine = undefined;
            stmt.targetLine = undefined;
            stmt.subLine = undefined;
        }

        // Pass 2: build label and subroutine maps + basic reference linking (GOTO/GOSUB/CALL).
        const labels = this.buildLabelMap(statements, errors);
        const subs = this.buildSubMap(statements, errors);

        // Pass 3: link structured control flow.
        this.linkStructuredBlocks(statements, errors);

        // Pass 4: link label and sub references (now that maps exist).
        this.linkLabelReferences(statements, labels, errors);
        this.linkSubReferences(statements, subs, errors);

        return { errors, labels, subs };
    }

    private buildLabelMap(statements: readonly Statement[], errors: StaticAnalysisError[]): Map<string, number>
    {
        const labels = new Map<string, number>();

        for (let i = 0; i < statements.length; i++)
        {
            const stmt = statements[i];
            if (!(stmt instanceof LabelStatement))
            {
                continue;
            }

            const key = stmt.labelName.toUpperCase();
            if (labels.has(key))
            {
                errors.push({ lineNumber: i, message: `Duplicate LABEL ${stmt.labelName}` });
                continue;
            }

            labels.set(key, i);
        }

        return labels;
    }

    private buildSubMap(statements: readonly Statement[], errors: StaticAnalysisError[]): Map<string, number>
    {
        const subs = new Map<string, number>();

        for (let i = 0; i < statements.length; i++)
        {
            const stmt = statements[i];
            if (!(stmt instanceof SubStatement))
            {
                continue;
            }

            const key = stmt.name.toUpperCase();
            if (subs.has(key))
            {
                errors.push({ lineNumber: i, message: `Duplicate SUB ${stmt.name}` });
                continue;
            }

            subs.set(key, i);
        }

        return subs;
    }

    private linkLabelReferences(
        statements: readonly Statement[],
        labels: Map<string, number>,
        errors: StaticAnalysisError[]
    ): void
    {
        for (let i = 0; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof GotoStatement || stmt instanceof GosubStatement)
            {
                const key = stmt.labelName.toUpperCase();
                const target = labels.get(key);
                if (target === undefined)
                {
                    errors.push({ lineNumber: i, message: `Label '${stmt.labelName}' not found` });
                    continue;
                }

                (stmt as any).targetLine = target;
            }
        }
    }

    private linkSubReferences(
        statements: readonly Statement[],
        subs: Map<string, number>,
        errors: StaticAnalysisError[]
    ): void
    {
        for (let i = 0; i < statements.length; i++)
        {
            const stmt = statements[i];
            if (!(stmt instanceof CallStatement))
            {
                continue;
            }

            const key = stmt.subroutineName.toUpperCase();
            const target = subs.get(key);
            if (target === undefined)
            {
                errors.push({ lineNumber: i, message: `SUB ${stmt.subroutineName} not found` });
                continue;
            }

            (stmt as any).subLine = target;
        }
    }

    private linkStructuredBlocks(statements: readonly Statement[], errors: StaticAnalysisError[]): void
    {
        const stack: BlockFrame[] = [];

        const push = (frame: BlockFrame): void =>
        {
            stack.push(frame);
        };

        const popExpected = (type: BlockType, lineNumber: number, message: string): BlockFrame | null =>
        {
            const top = stack.length > 0 ? stack[stack.length - 1] : null;
            if (!top || top.type !== type)
            {
                errors.push({ lineNumber, message });
                return null;
            }

            return stack.pop() ?? null;
        };

        for (let i = 0; i < statements.length; i++)
        {
            const stmt = statements[i];

            // Unparsable statements can still exist for empty/comment lines; they do not participate in structure.
            if (stmt instanceof UnparsableStatement)
            {
                continue;
            }

            if (stmt instanceof IfStatement)
            {
                push({ type: 'if', startLine: i, clauseLines: [i] });
                continue;
            }

            if (stmt instanceof ElseIfStatement)
            {
                const top = stack.length > 0 ? stack[stack.length - 1] : null;
                if (!top || top.type !== 'if' || !top.clauseLines)
                {
                    errors.push({ lineNumber: i, message: 'ELSEIF without IF' });
                    continue;
                }

                if (top.elseLine !== undefined)
                {
                    errors.push({ lineNumber: i, message: 'ELSEIF after ELSE' });
                    continue;
                }

                top.clauseLines.push(i);
                continue;
            }

            if (stmt instanceof ElseStatement)
            {
                const top = stack.length > 0 ? stack[stack.length - 1] : null;
                if (!top || (top.type !== 'if' && top.type !== 'unless'))
                {
                    errors.push({ lineNumber: i, message: 'ELSE without IF/UNLESS' });
                    continue;
                }

                if (top.elseLine !== undefined)
                {
                    errors.push({ lineNumber: i, message: 'Multiple ELSE clauses in the same block' });
                    continue;
                }

                top.elseLine = i;
                if (top.type === 'if' && top.clauseLines)
                {
                    top.clauseLines.push(i);
                }

                continue;
            }

            if (stmt instanceof UnlessStatement)
            {
                push({ type: 'unless', startLine: i });
                continue;
            }

            if (stmt instanceof SelectCaseStatement)
            {
                push({ type: 'select', startLine: i, caseLines: [] });
                continue;
            }

            if (stmt instanceof CaseStatement)
            {
                const top = stack.length > 0 ? stack[stack.length - 1] : null;
                if (!top || top.type !== 'select' || !top.caseLines)
                {
                    errors.push({ lineNumber: i, message: 'CASE without SELECT' });
                    continue;
                }

                if (top.hasCaseElse)
                {
                    errors.push({ lineNumber: i, message: 'CASE after CASE ELSE' });
                }

                if (stmt.isElse)
                {
                    if (top.hasCaseElse)
                    {
                        errors.push({ lineNumber: i, message: 'Multiple CASE ELSE clauses in the same SELECT block' });
                    }

                    top.hasCaseElse = true;
                }

                top.caseLines.push(i);
                continue;
            }

            if (stmt instanceof ForStatement)
            {
                push({ type: 'for', startLine: i });
                continue;
            }

            if (stmt instanceof NextStatement)
            {
                const frame = popExpected('for', i, 'NEXT without FOR');
                if (!frame)
                {
                    continue;
                }

                const forStmt = statements[frame.startLine];
                if (forStmt instanceof ForStatement)
                {
                    (forStmt as any).nextLine = i;

                    if (stmt.variableName && forStmt.variableName.toUpperCase() !== stmt.variableName.toUpperCase())
                    {
                        errors.push({
                            lineNumber: i,
                            message: `NEXT ${stmt.variableName} does not match FOR ${forStmt.variableName}`
                        });
                    }
                }

                continue;
            }

            if (stmt instanceof WhileStatement)
            {
                push({ type: 'while', startLine: i });
                continue;
            }

            if (stmt instanceof WendStatement)
            {
                const frame = popExpected('while', i, 'WEND without WHILE');
                if (!frame)
                {
                    continue;
                }

                const whileStmt = statements[frame.startLine];
                if (whileStmt instanceof WhileStatement)
                {
                    (whileStmt as any).wendLine = i;
                }

                continue;
            }

            if (stmt instanceof DoLoopStatement)
            {
                push({ type: 'do', startLine: i });
                continue;
            }

            if (stmt instanceof LoopStatement)
            {
                const frame = popExpected('do', i, 'LOOP without DO');
                if (!frame)
                {
                    continue;
                }

                const doStmt = statements[frame.startLine];
                if (doStmt instanceof DoLoopStatement)
                {
                    (doStmt as any).loopLine = i;
                }

                continue;
            }

            if (stmt instanceof UntilStatement)
            {
                push({ type: 'until', startLine: i });
                continue;
            }

            if (stmt instanceof UendStatement)
            {
                const frame = popExpected('until', i, 'UEND without UNTIL');
                if (!frame)
                {
                    continue;
                }

                const untilStmt = statements[frame.startLine];
                if (untilStmt instanceof UntilStatement)
                {
                    (untilStmt as any).uendLine = i;
                }

                continue;
            }

            if (stmt instanceof SubStatement)
            {
                push({ type: 'sub', startLine: i });
                continue;
            }

            if (stmt instanceof TryStatement)
            {
                push({ type: 'try', startLine: i });
                continue;
            }

            if (stmt instanceof EndStatement)
            {
                switch (stmt.endType)
                {
                    case EndType.If:
                    {
                        const frame = popExpected('if', i, 'END IF without IF');
                        if (!frame)
                        {
                            break;
                        }

                        this.linkIfBlock(statements, frame, i, errors);
                        break;
                    }
                    case EndType.Unless:
                    {
                        const frame = popExpected('unless', i, 'END UNLESS without UNLESS');
                        if (!frame)
                        {
                            break;
                        }

                        const unlessStmt = statements[frame.startLine];
                        if (unlessStmt instanceof UnlessStatement)
                        {
                            (unlessStmt as any).endUnlessLine = i;
                            (unlessStmt as any).elseOrEndLine = frame.elseLine ?? i;
                        }

                        break;
                    }
                    case EndType.Select:
                    {
                        const frame = popExpected('select', i, 'END SELECT without SELECT');
                        if (!frame)
                        {
                            break;
                        }

                        this.linkSelectBlock(statements, frame, i);
                        break;
                    }
                    case EndType.Sub:
                    {
                        const frame = popExpected('sub', i, 'END SUB without SUB');
                        if (!frame)
                        {
                            break;
                        }

                        const subStmt = statements[frame.startLine];
                        if (subStmt instanceof SubStatement)
                        {
                            (subStmt as any).endSubLine = i;
                        }

                        break;
                    }
                    case EndType.Try:
                    {
                        const frame = popExpected('try', i, 'END TRY without TRY');
                        if (!frame)
                        {
                            break;
                        }

                        const tryStmt = statements[frame.startLine];
                        if (tryStmt instanceof TryStatement)
                        {
                            (tryStmt as any).endTryLine = i;
                        }

                        break;
                    }
                    case EndType.Program:
                    {
                        break;
                    }
                }
            }
        }

        // Any blocks still open are missing terminators.
        while (stack.length > 0)
        {
            const frame = stack.pop()!;
            const message = this.getMissingTerminatorMessage(frame.type);
            errors.push({ lineNumber: frame.startLine, message });
        }
    }

    private linkIfBlock(
        statements: readonly Statement[],
        frame: BlockFrame,
        endIfLine: number,
        errors: StaticAnalysisError[]
    ): void
    {
        const ifStmt = statements[frame.startLine];
        if (!(ifStmt instanceof IfStatement))
        {
            return;
        }

        (ifStmt as any).endIfLine = endIfLine;

        const clauseLines = frame.clauseLines ?? [frame.startLine];
        for (let i = 0; i < clauseLines.length; i++)
        {
            const clauseLine = clauseLines[i];
            const clauseStmt = statements[clauseLine] as any;

            clauseStmt.endIfLine = endIfLine;

            const nextClauseLine = i + 1 < clauseLines.length ? clauseLines[i + 1] : endIfLine;
            if (statements[clauseLine] instanceof IfStatement || statements[clauseLine] instanceof ElseIfStatement)
            {
                clauseStmt.nextClauseLine = nextClauseLine;
            }
        }
    }

    private linkSelectBlock(statements: readonly Statement[], frame: BlockFrame, endSelectLine: number): void
    {
        const selectStmt = statements[frame.startLine];
        if (!(selectStmt instanceof SelectCaseStatement))
        {
            return;
        }

        const caseLines = frame.caseLines ?? [];

        (selectStmt as any).endSelectLine = endSelectLine;
        (selectStmt as any).firstCaseLine = caseLines.length > 0 ? caseLines[0] : endSelectLine;

        for (let i = 0; i < caseLines.length; i++)
        {
            const caseLine = caseLines[i];
            const nextCaseLine = i + 1 < caseLines.length ? caseLines[i + 1] : endSelectLine;

            const caseStmt = statements[caseLine] as any;
            caseStmt.endSelectLine = endSelectLine;
            caseStmt.nextCaseLine = nextCaseLine;
        }
    }

    private getMissingTerminatorMessage(type: BlockType): string
    {
        switch (type)
        {
            case 'if':
                return 'IF: missing END IF';
            case 'unless':
                return 'UNLESS: missing END UNLESS';
            case 'select':
                return 'SELECT CASE: missing END SELECT';
            case 'for':
                return 'FOR: missing NEXT';
            case 'while':
                return 'WHILE: missing WEND';
            case 'do':
                return 'DO: missing LOOP';
            case 'until':
                return 'UNTIL: missing UEND';
            case 'sub':
                return 'SUB: missing END SUB';
            case 'try':
                return 'TRY: missing END TRY';
        }
    }
}

