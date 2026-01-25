import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Statement } from '../../../lang/statements/statement';
import { UnparsableStatement } from '../../../lang/statements/unparsable-statement';
import { ExpressionParserService } from '../expression-parser.service';
import { Token, Tokenizer, TokenType } from '../tokenizer.service';
import { ArrayParsers } from './parsers/array-parsers';
import { AudioParsers } from './parsers/audio-parsers';
import { ControlFlowParsers } from './parsers/control-flow-parsers';
import { FileIoParsers } from './parsers/file-io-parsers';
import { GraphicsParsers } from './parsers/graphics-parsers';
import { IoParsers } from './parsers/io-parsers';
import { MiscParsers } from './parsers/misc-parsers';
import { ParserContext } from './parsers/parser-context';
import { VariableParsers } from './parsers/variable-parsers';

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

    public parseLine(lineNumber: number, sourceText: string): ParsedLine
    {
        try
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
                return parsed;
            }

            this.tokens = this.tokenizer.tokenize(trimmedText);
            this.current.value = 0;

            const context = new ParserContext(this.tokens, this.current, this.expressionParser);
            const statement = this.parseStatement(context);
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
            return parsed;
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const statement = new UnparsableStatement(sourceText, errorMessage);
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

    private parseStatement(context: ParserContext): Statement
    {
        const token = context.peek();

        if (token.type === TokenType.Keyword)
        {
            const keyword = token.value.toUpperCase();

            switch (keyword)
            {
                case 'ARC':
                    return GraphicsParsers.parseArc(context);
                case 'CALL':
                    return ControlFlowParsers.parseCall(context);
                case 'CASE':
                    return ControlFlowParsers.parseCase(context);
                case 'CATCH':
                    return ControlFlowParsers.parseCatch(context);
                case 'CIRCLE':
                    return GraphicsParsers.parseCircle(context);
                case 'CLOSE':
                    return FileIoParsers.parseClose(context);
                case 'CLS':
                    return IoParsers.parseCls(context);
                case 'COLOR':
                    return IoParsers.parseColor(context);
                case 'CONSOLE':
                    return MiscParsers.parseConsole(context);
                case 'CONTINUE':
                    return ControlFlowParsers.parseContinue(context);
                case 'COPY':
                    return FileIoParsers.parseCopy(context);
                case 'DELETE':
                    return FileIoParsers.parseDelete(context);
                case 'DIM':
                    return VariableParsers.parseDim(context);
                case 'DO':
                    return ControlFlowParsers.parseDo(context);
                case 'ELSE':
                    return ControlFlowParsers.parseElse(context);
                case 'ELSEIF':
                    return ControlFlowParsers.parseElseIf(context);
                case 'END':
                    return ControlFlowParsers.parseEnd(context);
                case 'EXIT':
                    return ControlFlowParsers.parseExit(context);
                case 'FINALLY':
                    return ControlFlowParsers.parseFinally(context);
                case 'FOR':
                    return ControlFlowParsers.parseFor(context);
                case 'GET':
                    return GraphicsParsers.parseGet(context);
                case 'GOSUB':
                    return ControlFlowParsers.parseGosub(context);
                case 'GOTO':
                    return ControlFlowParsers.parseGoto(context);
                case 'HELP':
                    return MiscParsers.parseHelp(context);
                case 'IF':
                    return ControlFlowParsers.parseIf(context);
                case 'INPUT':
                    return IoParsers.parseInput(context);
                case 'LABEL':
                    return ControlFlowParsers.parseLabel(context);
                case 'LET':
                    return VariableParsers.parseLet(context);
                case 'LINE':
                    return GraphicsParsers.parseLineInputOrGraphics(context);
                case 'LISTDIR':
                    return FileIoParsers.parseListdir(context);
                case 'LOCAL':
                    return VariableParsers.parseLocal(context);
                case 'LOCATE':
                    return IoParsers.parseLocate(context);
                case 'LOOP':
                    return ControlFlowParsers.parseLoop(context);
                case 'MKDIR':
                    return FileIoParsers.parseMkdir(context);
                case 'MOVE':
                    return FileIoParsers.parseMove(context);
                case 'NEXT':
                    return ControlFlowParsers.parseNext(context);
                case 'OPEN':
                    return FileIoParsers.parseOpen(context);
                case 'OVAL':
                    return GraphicsParsers.parseOval(context);
                case 'PAINT':
                    return GraphicsParsers.parsePaint(context);
                case 'PLAY':
                    return AudioParsers.parsePlay(context);
                case 'POP':
                    return ArrayParsers.parsePop(context);
                case 'PRINT':
                    return IoParsers.parsePrint(context);
                case 'PSET':
                    return GraphicsParsers.parsePset(context);
                case 'PUSH':
                    return ArrayParsers.parsePush(context);
                case 'PUT':
                    return GraphicsParsers.parsePut(context);
                case 'RANDOMIZE':
                    return MiscParsers.parseRandomize(context);
                case 'READ':
                    return FileIoParsers.parseRead(context);
                case 'READFILE':
                    return FileIoParsers.parseReadfile(context);
                case 'RECTANGLE':
                    return GraphicsParsers.parseRectangle(context);
                case 'RETURN':
                    return ControlFlowParsers.parseReturn(context);
                case 'RMDIR':
                    return FileIoParsers.parseRmdir(context);
                case 'SEEK':
                    return FileIoParsers.parseSeek(context);
                case 'SELECT':
                    return ControlFlowParsers.parseSelectCase(context);
                case 'SET':
                    return MiscParsers.parseSet(context);
                case 'SHIFT':
                    return ArrayParsers.parseShift(context);
                case 'SLEEP':
                    return MiscParsers.parseSleep(context);
                case 'SUB':
                    return ControlFlowParsers.parseSub(context);
                case 'TEMPO':
                    return AudioParsers.parseTempo(context);
                case 'THROW':
                    return ControlFlowParsers.parseThrow(context);
                case 'TRIANGLE':
                    return GraphicsParsers.parseTriangle(context);
                case 'TRY':
                    return ControlFlowParsers.parseTry(context);
                case 'TURTLE':
                    return GraphicsParsers.parseTurtle(context);
                case 'UEND':
                    return ControlFlowParsers.parseUend(context);
                case 'UNLESS':
                    return ControlFlowParsers.parseUnless(context);
                case 'UNSHIFT':
                    return ArrayParsers.parseUnshift(context);
                case 'UNTIL':
                    return ControlFlowParsers.parseUntil(context);
                case 'VOICE':
                    return AudioParsers.parseVoice(context);
                case 'VOLUME':
                    return AudioParsers.parseVolume(context);
                case 'WEND':
                    return ControlFlowParsers.parseWend(context);
                case 'WHILE':
                    return ControlFlowParsers.parseWhile(context);
                case 'WRITE':
                    return FileIoParsers.parseWrite(context);
                case 'WRITEFILE':
                    return FileIoParsers.parseWritefile(context);
                default:
                    throw new Error(`Unknown keyword: ${keyword}`);
            }
        }

        throw new Error(`Expected keyword or statement, got: ${token.value}`);
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
