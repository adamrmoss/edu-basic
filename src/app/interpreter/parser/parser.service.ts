import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Statement } from '../../../lang/statements/statement';
import { UnparsableStatement } from '../../../lang/statements/unparsable-statement';
import { ExpressionParserService } from '../expression-parser.service';
import { Token, Tokenizer, TokenType } from '../tokenizer.service';
import { ParserContext } from './parsers/parser-context';
import { getStatementParser } from './statement-dispatch';
import { ParseResult, failure, success } from './parse-result';

export interface ParsedLine
{
    lineNumber: number;
    sourceText: string;
    statement: Statement;
    hasError: boolean;
    errorMessage?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ParserService
{
    private readonly parsedLinesSubject = new BehaviorSubject<Map<number, ParsedLine>>(new Map());
    private readonly currentIndentLevelSubject = new BehaviorSubject<number>(0);

    public readonly parsedLines$: Observable<Map<number, ParsedLine>> = this.parsedLinesSubject.asObservable();
    public readonly currentIndentLevel$: Observable<number> = this.currentIndentLevelSubject.asObservable();

    private tokenizer: Tokenizer = new Tokenizer();
    private tokens: Token[] = [];
    private current: { value: number } = { value: 0 };

    constructor(private expressionParser: ExpressionParserService)
    {
    }

    public get parsedLines(): Map<number, ParsedLine>
    {
        return this.parsedLinesSubject.value;
    }

    public get currentIndentLevel(): number
    {
        return this.currentIndentLevelSubject.value;
    }

    public set currentIndentLevel(level: number)
    {
        this.currentIndentLevelSubject.next(Math.max(0, level));
    }

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

        this.tokens = this.tokenizer.tokenize(trimmedText);
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
        statement.indentLevel = this.currentIndentLevel;
        
        const indentAdjustment = statement.getIndentAdjustment();
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

    private parseStatement(context: ParserContext): ParseResult<Statement>
    {
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

    public removeLine(lineNumber: number): void
    {
        const lines = new Map(this.parsedLinesSubject.value);
        lines.delete(lineNumber);
        this.parsedLinesSubject.next(lines);
    }

    public clear(): void
    {
        this.parsedLinesSubject.next(new Map());
        this.currentIndentLevelSubject.next(0);
    }

    public increaseIndent(): void
    {
        this.currentIndentLevel = this.currentIndentLevel + 1;
    }

    public decreaseIndent(): void
    {
        this.currentIndentLevel = Math.max(0, this.currentIndentLevel - 1);
    }

    public getParsedLine(lineNumber: number): ParsedLine | undefined
    {
        return this.parsedLinesSubject.value.get(lineNumber);
    }

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
