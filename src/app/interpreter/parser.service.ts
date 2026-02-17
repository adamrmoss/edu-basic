import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Statement } from '../../lang/statements/statement';
import { UnparsableStatement } from '../../lang/statements/unparsable-statement';
import { ExpressionParser } from '../../lang/parsing/expression-parser';
import { ParseResult, failure, success } from '../../lang/parsing/parse-result';
import { ParserContext } from '../../lang/parsing/parsers/parser-context';
import { getStatementParser } from '../../lang/parsing/statement-dispatch';
import { Token, Tokenizer, TokenType } from '../../lang/parsing/tokenizer';

/**
 * Parsed representation of a single source line as used by the UI.
 */
export interface ParsedLine
{
    /**
     * 1-based line number (as presented to the user).
     */
    lineNumber: number;

    /**
     * Raw source text as typed by the user.
     */
    sourceText: string;

    /**
     * Parsed statement for this line (or an `UnparsableStatement` when parsing fails).
     */
    statement: Statement;

    /**
     * Whether parsing produced an error for this line.
     */
    hasError: boolean;

    /**
     * Optional parse error message when `hasError` is true.
     */
    errorMessage?: string;
}

/**
 * Parses BASIC source lines into `Statement` objects for the editor and console.
 *
 * Notes on error reporting:
 * - `parseLine(...)` typically returns `success(...)` even when parsing fails.
 * - Recoverable failures are represented as a `ParsedLine` where `hasError` is true and the `statement`
 *   is an `UnparsableStatement` carrying an error message.
 *
 * This lets the UI keep a placeholder statement per line and surface errors without throwing.
 */
@Injectable({
    providedIn: 'root'
})
export class ParserService
{
    private readonly parsedLinesSubject = new BehaviorSubject<Map<number, ParsedLine>>(new Map());
    private readonly currentIndentLevelSubject = new BehaviorSubject<number>(0);

    /**
     * Observable stream of parsed lines keyed by line number.
     */
    public readonly parsedLines$: Observable<Map<number, ParsedLine>> = this.parsedLinesSubject.asObservable();

    /**
     * Observable stream of the current indent level as tracked by the parser.
     */
    public readonly currentIndentLevel$: Observable<number> = this.currentIndentLevelSubject.asObservable();

    private tokenizer: Tokenizer = new Tokenizer();
    private tokens: Token[] = [];
    private current: { value: number } = { value: 0 };
    private readonly expressionParser: ExpressionParser = new ExpressionParser();

    /**
     * Create a new parser service.
     */
    public constructor()
    {
    }

    /**
     * Current parsed lines snapshot.
     */
    public get parsedLines(): Map<number, ParsedLine>
    {
        return this.parsedLinesSubject.value;
    }

    /**
     * Current indent level snapshot.
     */
    public get currentIndentLevel(): number
    {
        return this.currentIndentLevelSubject.value;
    }

    /**
     * Update the current indent level.
     */
    public set currentIndentLevel(level: number)
    {
        this.currentIndentLevelSubject.next(Math.max(0, level));
    }

    /**
     * Parse a single source line into a `Statement`.
     *
     * @param lineNumber 1-based display line number.
     * @param sourceText Raw source text.
     * @returns A parse result containing a `ParsedLine` value.
     */
    public parseLine(lineNumber: number, sourceText: string): ParseResult<ParsedLine>
    {
        const trimmedText = sourceText.trim();

        if (!trimmedText || trimmedText.startsWith("'"))
        {
            const statement = new UnparsableStatement(sourceText, 'Comment or empty line');
            statement.indentLevel = this.currentIndentLevel;
            
            const parsed: ParsedLine = {
                lineNumber,
                sourceText,
                statement,
                hasError: false
            };
            
            this.updateParsedLine(lineNumber, parsed);
            return success(parsed);
        }

        // Tokenize then dispatch by first keyword; failures still return success with UnparsableStatement so UI can show errors.
        const tokenizeResult = this.tokenizer.tokenize(trimmedText);
        if (!tokenizeResult.success)
        {
            const statement = new UnparsableStatement(sourceText, tokenizeResult.error);
            statement.indentLevel = this.currentIndentLevel;

            const parsed: ParsedLine = {
                lineNumber,
                sourceText,
                statement,
                hasError: true,
                errorMessage: tokenizeResult.error
            };

            this.updateParsedLine(lineNumber, parsed);
            return success(parsed);
        }

        this.tokens = tokenizeResult.value;
        this.current.value = 0;

        const context = new ParserContext(this.tokens, this.current, this.expressionParser);
        const statementResult = this.parseStatement(context);
        
        if (!statementResult.success)
        {
            const statement = new UnparsableStatement(sourceText, statementResult.error);
            statement.indentLevel = this.currentIndentLevel;
            
            const parsed: ParsedLine = {
                lineNumber,
                sourceText,
                statement,
                hasError: true,
                errorMessage: statementResult.error
            };
            
            this.updateParsedLine(lineNumber, parsed);
            return success(parsed);
        }
        
        const statement = statementResult.value;
        const indentAdjustment = statement.getIndentAdjustment();

        if (indentAdjustment < 0)
        {
            statement.indentLevel = this.currentIndentLevel + indentAdjustment;
        }
        else
        {
            statement.indentLevel = this.currentIndentLevel;
        }

        if (indentAdjustment !== 0)
        {
            this.currentIndentLevel = this.currentIndentLevel + indentAdjustment;
        }
        
        const parsed: ParsedLine = {
            lineNumber,
            sourceText,
            statement,
            hasError: false
        };
        
        this.updateParsedLine(lineNumber, parsed);
        return success(parsed);
    }

    /**
     * Parse a single source line without mutating parser state.
     *
     * This is primarily used for per-line operations like canonicalization where we do not want to
     * affect `currentIndentLevel` or the `parsedLines` map.
     *
     * @param sourceText Raw source text.
     */
    public parseLineStateless(sourceText: string): ParseResult<Statement>
    {
        const trimmedText = sourceText.trim();

        if (!trimmedText || trimmedText.startsWith("'"))
        {
            return failure('Comment or empty line');
        }

        const tokenizeResult = new Tokenizer().tokenize(trimmedText);
        if (!tokenizeResult.success)
        {
            return failure(tokenizeResult.error || 'Tokenization error');
        }

        const tokens = tokenizeResult.value;
        const current: { value: number } = { value: 0 };
        const context = new ParserContext(tokens, current, new ExpressionParser());
        const statementResult = this.parseStatement(context);

        if (!statementResult.success)
        {
            return failure(statementResult.error || 'Parse error');
        }

        const statement = statementResult.value;
        statement.indentLevel = 0;
        return success(statement);
    }

    private parseStatement(context: ParserContext): ParseResult<Statement>
    {
        // Dispatch by first keyword; non-keyword tokens fall through to label or error.
        const token = context.peek();

        if (token.type === TokenType.Keyword)
        {
            const keyword = token.value.toUpperCase();
            const parser = getStatementParser(keyword);

            if (parser)
            {
                return parser(context);
            }

            return failure(`Unknown keyword: ${keyword}`);
        }

        return failure(`Expected keyword or statement, got: ${token.value}`);
    }

    /**
     * Remove a previously parsed line from the parsed line map.
     *
     * @param lineNumber Line number key to remove.
     */
    public removeLine(lineNumber: number): void
    {
        const lines = new Map(this.parsedLinesSubject.value);
        lines.delete(lineNumber);
        this.parsedLinesSubject.next(lines);
    }

    /**
     * Clear all parsed lines and reset indent level.
     */
    public clear(): void
    {
        this.parsedLinesSubject.next(new Map());
        this.currentIndentLevelSubject.next(0);
    }

    /**
     * Increase the current indent level by one.
     */
    public increaseIndent(): void
    {
        this.currentIndentLevel = this.currentIndentLevel + 1;
    }

    /**
     * Decrease the current indent level by one, with a minimum of zero.
     */
    public decreaseIndent(): void
    {
        this.currentIndentLevel = Math.max(0, this.currentIndentLevel - 1);
    }

    /**
     * Get a parsed line by its key.
     *
     * @param lineNumber Line number key.
     */
    public getParsedLine(lineNumber: number): ParsedLine | undefined
    {
        return this.parsedLinesSubject.value.get(lineNumber);
    }

    /**
     * Get all parsed statements in ascending line-number order.
     */
    public getAllStatements(): Statement[]
    {
        const lines = Array.from(this.parsedLinesSubject.value.entries())
            .sort(([a], [b]) => a - b);
        
        return lines.map(([_, parsed]) => parsed.statement);
    }

    private updateParsedLine(lineNumber: number, parsed: ParsedLine): void
    {
        const lines = new Map(this.parsedLinesSubject.value);
        lines.set(lineNumber, parsed);
        this.parsedLinesSubject.next(lines);
    }
}
