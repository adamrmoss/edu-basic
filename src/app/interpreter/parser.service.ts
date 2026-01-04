import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Statement } from '../../lang/statements/statement';
import { UnparsableStatement } from '../../lang/statements/unparsable-statement';

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

    public get parsedLines(): Map<number, ParsedLine>
    {
        return this.parsedLinesSubject.value;
    }

    public get currentIndentLevel(): number
    {
        return this.currentIndentLevelSubject.value;
    }

    public parseLine(lineNumber: number, sourceText: string): ParsedLine
    {
        try
        {
            const trimmedText = sourceText.trim();
            
            if (!trimmedText || trimmedText.startsWith('#'))
            {
                const statement = new UnparsableStatement(sourceText);
                statement.indentLevel = this.currentIndentLevel;
                
                const parsed: ParsedLine = {
                    lineNumber,
                    sourceText,
                    statement,
                    hasError: false
                };
                
                this.updateParsedLine(lineNumber, parsed);
                return parsed;
            }

            const statement = new UnparsableStatement(sourceText);
            statement.indentLevel = this.currentIndentLevel;
            
            const parsed: ParsedLine = {
                lineNumber,
                sourceText,
                statement,
                hasError: false
            };
            
            this.updateParsedLine(lineNumber, parsed);
            return parsed;
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const statement = new UnparsableStatement(sourceText);
            statement.indentLevel = this.currentIndentLevel;
            
            const parsed: ParsedLine = {
                lineNumber,
                sourceText,
                statement,
                hasError: true,
                errorMessage
            };
            
            this.updateParsedLine(lineNumber, parsed);
            return parsed;
        }
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

    public setIndentLevel(level: number): void
    {
        this.currentIndentLevelSubject.next(Math.max(0, level));
    }

    public increaseIndent(): void
    {
        this.currentIndentLevelSubject.next(this.currentIndentLevel + 1);
    }

    public decreaseIndent(): void
    {
        this.currentIndentLevelSubject.next(Math.max(0, this.currentIndentLevel - 1));
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

