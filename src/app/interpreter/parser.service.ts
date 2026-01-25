import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Expression } from '../../lang/expressions/expression';
import { Statement } from '../../lang/statements/statement';
import { UnparsableStatement } from '../../lang/statements/unparsable-statement';
import { ExpressionParserService } from './expression-parser.service';
import { Token, Tokenizer, TokenType } from './tokenizer.service';

// Array statements
import { PopStatement } from '../../lang/statements/array/pop-statement';
import { PushStatement } from '../../lang/statements/array/push-statement';
import { ShiftStatement } from '../../lang/statements/array/shift-statement';
import { UnshiftStatement } from '../../lang/statements/array/unshift-statement';

// Audio statements
import { PlayStatement } from '../../lang/statements/audio/play-statement';
import { TempoStatement } from '../../lang/statements/audio/tempo-statement';
import { VoiceStatement } from '../../lang/statements/audio/voice-statement';
import { VolumeStatement } from '../../lang/statements/audio/volume-statement';

// Control flow statements
import { CallStatement } from '../../lang/statements/control-flow/call-statement';
import { CaseStatement } from '../../lang/statements/control-flow/case-statement';
import { CatchStatement } from '../../lang/statements/control-flow/catch-statement';
import { ContinueStatement, ContinueTarget } from '../../lang/statements/control-flow/continue-statement';
import { DoLoopStatement, DoLoopVariant } from '../../lang/statements/control-flow/do-loop-statement';
import { ElseIfStatement } from '../../lang/statements/control-flow/elseif-statement';
import { ElseStatement } from '../../lang/statements/control-flow/else-statement';
import { EndStatement, EndType } from '../../lang/statements/control-flow/end-statement';
import { ExitStatement, ExitTarget } from '../../lang/statements/control-flow/exit-statement';
import { FinallyStatement } from '../../lang/statements/control-flow/finally-statement';
import { ForStatement } from '../../lang/statements/control-flow/for-statement';
import { GosubStatement } from '../../lang/statements/control-flow/gosub-statement';
import { GotoStatement } from '../../lang/statements/control-flow/goto-statement';
import { IfStatement } from '../../lang/statements/control-flow/if-statement';
import { LabelStatement } from '../../lang/statements/control-flow/label-statement';
import { LoopStatement } from '../../lang/statements/control-flow/loop-statement';
import { NextStatement } from '../../lang/statements/control-flow/next-statement';
import { ReturnStatement } from '../../lang/statements/control-flow/return-statement';
import { CaseClause, CaseMatchType, SelectCaseStatement } from '../../lang/statements/control-flow/select-case-statement';
import { SubParameter, SubStatement } from '../../lang/statements/control-flow/sub-statement';
import { ThrowStatement } from '../../lang/statements/control-flow/throw-statement';
import { CatchClause as TryCatchClause, TryStatement } from '../../lang/statements/control-flow/try-statement';
import { UendStatement } from '../../lang/statements/control-flow/uend-statement';
import { UnlessStatement } from '../../lang/statements/control-flow/unless-statement';
import { UntilStatement } from '../../lang/statements/control-flow/until-statement';
import { WendStatement } from '../../lang/statements/control-flow/wend-statement';
import { WhileStatement } from '../../lang/statements/control-flow/while-statement';

// File I/O statements
import { CloseStatement } from '../../lang/statements/file-io/close-statement';
import { CopyStatement } from '../../lang/statements/file-io/copy-statement';
import { DeleteStatement } from '../../lang/statements/file-io/delete-statement';
import { LineInputStatement } from '../../lang/statements/file-io/line-input-statement';
import { ListdirStatement } from '../../lang/statements/file-io/listdir-statement';
import { MkdirStatement } from '../../lang/statements/file-io/mkdir-statement';
import { MoveStatement } from '../../lang/statements/file-io/move-statement';
import { FileMode, OpenStatement } from '../../lang/statements/file-io/open-statement';
import { ReadFileStatement } from '../../lang/statements/file-io/read-file-statement';
import { ReadfileStatement } from '../../lang/statements/file-io/readfile-statement';
import { RmdirStatement } from '../../lang/statements/file-io/rmdir-statement';
import { SeekStatement } from '../../lang/statements/file-io/seek-statement';
import { WriteFileStatement } from '../../lang/statements/file-io/write-file-statement';
import { WritefileStatement } from '../../lang/statements/file-io/writefile-statement';

// Graphics statements
import { ArcStatement } from '../../lang/statements/graphics/arc-statement';
import { CircleStatement } from '../../lang/statements/graphics/circle-statement';
import { GetStatement } from '../../lang/statements/graphics/get-statement';
import { LineStatement } from '../../lang/statements/graphics/line-statement';
import { OvalStatement } from '../../lang/statements/graphics/oval-statement';
import { PaintStatement } from '../../lang/statements/graphics/paint-statement';
import { PsetStatement } from '../../lang/statements/graphics/pset-statement';
import { PutStatement } from '../../lang/statements/graphics/put-statement';
import { RectangleStatement } from '../../lang/statements/graphics/rectangle-statement';
import { TriangleStatement } from '../../lang/statements/graphics/triangle-statement';
import { TurtleStatement } from '../../lang/statements/graphics/turtle-statement';

// I/O statements
import { ClsStatement } from '../../lang/statements/io/cls-statement';
import { ColorStatement } from '../../lang/statements/io/color-statement';
import { InputStatement } from '../../lang/statements/io/input-statement';
import { LocateStatement } from '../../lang/statements/io/locate-statement';
import { PrintStatement } from '../../lang/statements/io/print-statement';

// Miscellaneous statements
import { ConsoleStatement } from '../../lang/statements/misc/console-statement';
import { HelpStatement } from '../../lang/statements/misc/help-statement';
import { RandomizeStatement } from '../../lang/statements/misc/randomize-statement';
import { SetOption, SetStatement } from '../../lang/statements/misc/set-statement';
import { SleepStatement } from '../../lang/statements/misc/sleep-statement';

// Variable statements
import { DimStatement } from '../../lang/statements/variables/dim-statement';
import { LetStatement } from '../../lang/statements/variables/let-statement';
import { LocalStatement } from '../../lang/statements/variables/local-statement';

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
    private current: number = 0;

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
            
            // Handle empty lines and comments
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

            // Tokenize the line
            this.tokens = this.tokenizer.tokenize(trimmedText);
            this.current = 0;

            // Parse the statement based on the first keyword
            const statement = this.parseStatement();
            statement.indentLevel = this.currentIndentLevel;
            
            // Adjust indent level for next line based on this statement
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

    private parseStatement(): Statement
    {
        const token = this.peek();

        // Check if it's a keyword
        if (token.type === TokenType.Keyword)
        {
            const keyword = token.value.toUpperCase();

            switch (keyword)
            {
                case 'ARC':
                    return this.parseArc();
                case 'CALL':
                    return this.parseCall();
                case 'CASE':
                    return this.parseCase();
                case 'CATCH':
                    return this.parseCatch();
                case 'CIRCLE':
                    return this.parseCircle();
                case 'CLOSE':
                    return this.parseClose();
                case 'CLS':
                    return this.parseCls();
                case 'COLOR':
                    return this.parseColor();
                case 'CONSOLE':
                    return this.parseConsole();
                case 'CONTINUE':
                    return this.parseContinue();
                case 'COPY':
                    return this.parseCopy();
                case 'DELETE':
                    return this.parseDelete();
                case 'DIM':
                    return this.parseDim();
                case 'DO':
                    return this.parseDo();
                case 'ELSE':
                    return this.parseElse();
                case 'ELSEIF':
                    return this.parseElseIf();
                case 'END':
                    return this.parseEnd();
                case 'EXIT':
                    return this.parseExit();
                case 'FINALLY':
                    return this.parseFinally();
                case 'FOR':
                    return this.parseFor();
                case 'GET':
                    return this.parseGet();
                case 'GOSUB':
                    return this.parseGosub();
                case 'GOTO':
                    return this.parseGoto();
                case 'HELP':
                    return this.parseHelp();
                case 'IF':
                    return this.parseIf();
                case 'INPUT':
                    return this.parseInput();
                case 'LABEL':
                    return this.parseLabel();
                case 'LET':
                    return this.parseLet();
                case 'LINE':
                    return this.parseLineInputOrGraphics();
                case 'LISTDIR':
                    return this.parseListdir();
                case 'LOCAL':
                    return this.parseLocal();
                case 'LOCATE':
                    return this.parseLocate();
                case 'LOOP':
                    return this.parseLoop();
                case 'MKDIR':
                    return this.parseMkdir();
                case 'MOVE':
                    return this.parseMove();
                case 'NEXT':
                    return this.parseNext();
                case 'OPEN':
                    return this.parseOpen();
                case 'OVAL':
                    return this.parseOval();
                case 'PAINT':
                    return this.parsePaint();
                case 'PLAY':
                    return this.parsePlay();
                case 'POP':
                    return this.parsePop();
                case 'PRINT':
                    return this.parsePrint();
                case 'PSET':
                    return this.parsePset();
                case 'PUSH':
                    return this.parsePush();
                case 'PUT':
                    return this.parsePut();
                case 'RANDOMIZE':
                    return this.parseRandomize();
                case 'READ':
                    return this.parseRead();
                case 'READFILE':
                    return this.parseReadfile();
                case 'RECTANGLE':
                    return this.parseRectangle();
                case 'RETURN':
                    return this.parseReturn();
                case 'RMDIR':
                    return this.parseRmdir();
                case 'SEEK':
                    return this.parseSeek();
                case 'SELECT':
                    return this.parseSelectCase();
                case 'SET':
                    return this.parseSet();
                case 'SHIFT':
                    return this.parseShift();
                case 'SLEEP':
                    return this.parseSleep();
                case 'SUB':
                    return this.parseSub();
                case 'TEMPO':
                    return this.parseTempo();
                case 'THROW':
                    return this.parseThrow();
                case 'TRIANGLE':
                    return this.parseTriangle();
                case 'TRY':
                    return this.parseTry();
                case 'TURTLE':
                    return this.parseTurtle();
                case 'UEND':
                    return this.parseUend();
                case 'UNLESS':
                    return this.parseUnless();
                case 'UNSHIFT':
                    return this.parseUnshift();
                case 'UNTIL':
                    return this.parseUntil();
                case 'VOICE':
                    return this.parseVoice();
                case 'VOLUME':
                    return this.parseVolume();
                case 'WEND':
                    return this.parseWend();
                case 'WHILE':
                    return this.parseWhile();
                case 'WRITE':
                    return this.parseWrite();
                case 'WRITEFILE':
                    return this.parseWritefile();
                default:
                    throw new Error(`Unknown keyword: ${keyword}`);
            }
        }

        // If not a keyword, might be an identifier (implicit assignment or procedure call)
        throw new Error(`Expected keyword or statement, got: ${token.value}`);
    }

    private parseLet(): LetStatement
    {
        this.consume(TokenType.Keyword, 'LET');
        
        const varName = this.consume(TokenType.Identifier, 'variable name').value;
        this.consume(TokenType.Equal, '=');
        
        const expr = this.parseExpression();
        
        return new LetStatement(varName, expr);
    }

    private parseLocal(): LocalStatement
    {
        this.consume(TokenType.Keyword, 'LOCAL');
        
        const varName = this.consume(TokenType.Identifier, 'variable name').value;
        this.consume(TokenType.Equal, '=');
        
        const expr = this.parseExpression();
        
        return new LocalStatement(varName, expr);
    }

    private parseDim(): DimStatement
    {
        this.consume(TokenType.Keyword, 'DIM');
        
        const varName = this.consume(TokenType.Identifier, 'array name').value;
        this.consume(TokenType.LeftBracket, '[');
        
        const dimensions: Expression[] = [];
        
        // Parse dimension expressions
        do
        {
            dimensions.push(this.parseExpression());
        }
        while (this.match(TokenType.Comma));
        
        this.consume(TokenType.RightBracket, ']');
        
        // Append [] to the array name to match expected format
        const arrayName = varName + '[]';
        
        return new DimStatement(arrayName, dimensions);
    }

    private parseIf(): IfStatement
    {
        this.consume(TokenType.Keyword, 'IF');
        
        const condition = this.parseExpression();
        this.consume(TokenType.Keyword, 'THEN');
        
        // Single-line parsing only - body will be collected by block structure analysis
        return new IfStatement(condition, [], [], null);
    }

    private parseElseIf(): ElseIfStatement
    {
        this.consume(TokenType.Keyword, 'ELSEIF');
        
        // Block structure will handle the condition and body
        return new ElseIfStatement();
    }

    private parseElse(): ElseStatement
    {
        this.consume(TokenType.Keyword, 'ELSE');
        
        // Block structure will handle the body
        return new ElseStatement();
    }

    private parseUnless(): UnlessStatement
    {
        this.consume(TokenType.Keyword, 'UNLESS');
        
        const condition = this.parseExpression();
        this.consume(TokenType.Keyword, 'THEN');
        
        // Single-line parsing only - body will be collected by block structure analysis
        return new UnlessStatement(condition, [], null);
    }

    private parseSelectCase(): SelectCaseStatement
    {
        this.consume(TokenType.Keyword, 'SELECT');
        this.consume(TokenType.Keyword, 'CASE');
        
        const testExpression = this.parseExpression();
        
        // Single-line parsing only - cases will be collected by block structure analysis
        return new SelectCaseStatement(testExpression, []);
    }

    private parseCase(): CaseStatement
    {
        this.consume(TokenType.Keyword, 'CASE');
        
        // Block structure will handle the case matching and body
        return new CaseStatement();
    }

    private parseFor(): ForStatement
    {
        this.consume(TokenType.Keyword, 'FOR');
        
        const varName = this.consume(TokenType.Identifier, 'loop variable').value;
        this.consume(TokenType.Equal, '=');
        
        const startValue = this.parseExpression();
        this.consume(TokenType.Keyword, 'TO');
        
        const endValue = this.parseExpression();
        
        let stepValue: Expression | null = null;
        if (this.matchKeyword('STEP'))
        {
            stepValue = this.parseExpression();
        }
        
        // Single-line parsing only - body will be collected by block structure analysis
        return new ForStatement(varName, startValue, endValue, stepValue, []);
    }

    private parseNext(): NextStatement
    {
        this.consume(TokenType.Keyword, 'NEXT');
        
        let varName: string | null = null;
        if (!this.isAtEnd() && this.peek().type === TokenType.Identifier)
        {
            varName = this.consume(TokenType.Identifier, 'variable name').value;
        }
        
        return new NextStatement(varName);
    }

    private parseWhile(): WhileStatement
    {
        this.consume(TokenType.Keyword, 'WHILE');
        
        const condition = this.parseExpression();
        
        // Single-line parsing only - body will be collected by block structure analysis
        return new WhileStatement(condition, []);
    }

    private parseWend(): WendStatement
    {
        this.consume(TokenType.Keyword, 'WEND');
        
        return new WendStatement();
    }

    private parseUntil(): UntilStatement
    {
        this.consume(TokenType.Keyword, 'UNTIL');
        
        const condition = this.parseExpression();
        
        // Single-line parsing only - body will be collected by block structure analysis
        return new UntilStatement(condition, []);
    }

    private parseUend(): UendStatement
    {
        this.consume(TokenType.Keyword, 'UEND');
        
        return new UendStatement();
    }

    private parseDo(): DoLoopStatement
    {
        this.consume(TokenType.Keyword, 'DO');
        
        // Check for DO WHILE or DO UNTIL
        if (this.matchKeyword('WHILE'))
        {
            const condition = this.parseExpression();
            return new DoLoopStatement(DoLoopVariant.DoWhile, condition, []);
        }
        else if (this.matchKeyword('UNTIL'))
        {
            const condition = this.parseExpression();
            return new DoLoopStatement(DoLoopVariant.DoUntil, condition, []);
        }
        
        // Plain DO...LOOP
        return new DoLoopStatement(DoLoopVariant.DoLoop, null, []);
    }

    private parseLoop(): LoopStatement
    {
        this.consume(TokenType.Keyword, 'LOOP');
        
        // Note: LOOP WHILE/UNTIL variants are handled by block structure analysis
        return new LoopStatement();
    }

    private parseSub(): SubStatement
    {
        this.consume(TokenType.Keyword, 'SUB');
        
        const name = this.consume(TokenType.Identifier, 'subroutine name').value;
        
        const parameters: SubParameter[] = [];
        
        // Parse optional parameters
        while (!this.isAtEnd() && this.peek().type === TokenType.Identifier)
        {
            const byRef = this.matchKeyword('BYREF');
            const paramName = this.consume(TokenType.Identifier, 'parameter name').value;
            
            parameters.push({ name: paramName, byRef });
            
            if (!this.match(TokenType.Comma))
            {
                break;
            }
        }
        
        // Single-line parsing only - body will be collected by block structure analysis
        return new SubStatement(name, parameters, []);
    }

    private parseCall(): CallStatement
    {
        this.consume(TokenType.Keyword, 'CALL');
        
        const subName = this.consume(TokenType.Identifier, 'subroutine name').value;
        
        const args: Expression[] = [];
        
        // Parse optional arguments
        while (!this.isAtEnd() && this.peek().type !== TokenType.EOF)
        {
            args.push(this.parseExpression());
            
            if (!this.match(TokenType.Comma))
            {
                break;
            }
        }
        
        return new CallStatement(subName, args);
    }

    private parseTry(): TryStatement
    {
        this.consume(TokenType.Keyword, 'TRY');
        
        // Single-line parsing only - body will be collected by block structure analysis
        return new TryStatement([], [], null);
    }

    private parseCatch(): CatchStatement
    {
        this.consume(TokenType.Keyword, 'CATCH');
        
        // Block structure will handle the error variable and body
        return new CatchStatement();
    }

    private parseFinally(): FinallyStatement
    {
        this.consume(TokenType.Keyword, 'FINALLY');
        
        // Block structure will handle the body
        return new FinallyStatement();
    }


    private parseGoto(): GotoStatement
    {
        this.consume(TokenType.Keyword, 'GOTO');
        
        const labelName = this.consume(TokenType.Identifier, 'label name').value;
        
        return new GotoStatement(labelName);
    }

    private parseGosub(): GosubStatement
    {
        this.consume(TokenType.Keyword, 'GOSUB');
        
        const labelName = this.consume(TokenType.Identifier, 'label name').value;
        
        return new GosubStatement(labelName);
    }

    private parseReturn(): ReturnStatement
    {
        this.consume(TokenType.Keyword, 'RETURN');
        
        return new ReturnStatement();
    }

    private parseLabel(): LabelStatement
    {
        this.consume(TokenType.Keyword, 'LABEL');
        
        const labelName = this.consume(TokenType.Identifier, 'label name').value;
        
        return new LabelStatement(labelName);
    }

    private parseEnd(): EndStatement
    {
        this.consume(TokenType.Keyword, 'END');
        
        // Check for optional keyword after END
        if (!this.isAtEnd() && this.peek().type === TokenType.Keyword)
        {
            const nextKeyword = this.peek().value.toUpperCase();
            
            switch (nextKeyword)
            {
                case 'IF':
                    this.advance();
                    return new EndStatement(EndType.If);
                case 'UNLESS':
                    this.advance();
                    return new EndStatement(EndType.Unless);
                case 'SELECT':
                    this.advance();
                    return new EndStatement(EndType.Select);
                case 'SUB':
                    this.advance();
                    return new EndStatement(EndType.Sub);
                case 'TRY':
                    this.advance();
                    return new EndStatement(EndType.Try);
            }
        }
        
        // Plain END (program termination)
        return new EndStatement(EndType.Program);
    }

    private parseExit(): ExitStatement
    {
        this.consume(TokenType.Keyword, 'EXIT');
        
        // Check for EXIT target
        if (this.matchKeyword('FOR'))
        {
            return new ExitStatement(ExitTarget.For);
        }
        else if (this.matchKeyword('WHILE'))
        {
            return new ExitStatement(ExitTarget.While);
        }
        else if (this.matchKeyword('DO'))
        {
            return new ExitStatement(ExitTarget.Do);
        }
        else if (this.matchKeyword('SUB'))
        {
            return new ExitStatement(ExitTarget.Sub);
        }
        
        throw new Error('EXIT must specify target: FOR, WHILE, DO, or SUB');
    }

    private parseContinue(): ContinueStatement
    {
        this.consume(TokenType.Keyword, 'CONTINUE');
        
        // Check for CONTINUE target
        if (this.matchKeyword('FOR'))
        {
            return new ContinueStatement(ContinueTarget.For);
        }
        else if (this.matchKeyword('WHILE'))
        {
            return new ContinueStatement(ContinueTarget.While);
        }
        else if (this.matchKeyword('DO'))
        {
            return new ContinueStatement(ContinueTarget.Do);
        }
        
        throw new Error('CONTINUE must specify target: FOR, WHILE, or DO');
    }

    private parsePrint(): PrintStatement
    {
        this.consume(TokenType.Keyword, 'PRINT');
        
        const expressions: Expression[] = [];
        let hasNewline = true;
        
        // Parse print expressions
        while (!this.isAtEnd() && this.peek().type !== TokenType.EOF)
        {
            expressions.push(this.parseExpression());
            
            // Check for semicolon or comma separators
            if (this.match(TokenType.Semicolon))
            {
                // Semicolon suppresses newline at end
                if (this.isAtEnd() || this.peek().type === TokenType.EOF)
                {
                    hasNewline = false;
                    break;
                }
            }
            else if (this.match(TokenType.Comma))
            {
                // Comma continues to next expression
                continue;
            }
            else
            {
                break;
            }
        }
        
        return new PrintStatement(expressions, hasNewline);
    }

    private parseInput(): InputStatement
    {
        this.consume(TokenType.Keyword, 'INPUT');
        
        const varName = this.consume(TokenType.Identifier, 'variable name').value;
        
        return new InputStatement(varName);
    }

    private parseColor(): ColorStatement
    {
        this.consume(TokenType.Keyword, 'COLOR');
        
        let foreground: Expression | null = null;
        let background: Expression | null = null;
        
        // Check for comma (background only)
        if (this.match(TokenType.Comma))
        {
            background = this.parseExpression();
        }
        else
        {
            foreground = this.parseExpression();
            
            // Check for optional background
            if (this.match(TokenType.Comma))
            {
                background = this.parseExpression();
            }
        }
        
        return new ColorStatement(foreground!, background);
    }

    private parseLocate(): LocateStatement
    {
        this.consume(TokenType.Keyword, 'LOCATE');
        
        const row = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const column = this.parseExpression();
        
        return new LocateStatement(row, column);
    }

    private parseCls(): ClsStatement
    {
        this.consume(TokenType.Keyword, 'CLS');
        
        return new ClsStatement();
    }

    private parseThrow(): ThrowStatement
    {
        this.consume(TokenType.Keyword, 'THROW');
        
        const message = this.parseExpression();
        
        return new ThrowStatement(message);
    }

    private parseOpen(): OpenStatement
    {
        this.consume(TokenType.Keyword, 'OPEN');
        
        const filename = this.parseExpression();
        
        this.consume(TokenType.Keyword, 'FOR');
        
        let mode: FileMode;
        const modeToken = this.consume(TokenType.Keyword, 'file mode');
        
        switch (modeToken.value.toUpperCase())
        {
            case 'READ':
                mode = FileMode.Read;
                break;
            case 'APPEND':
                mode = FileMode.Append;
                break;
            case 'OVERWRITE':
                mode = FileMode.Overwrite;
                break;
            default:
                throw new Error(`Invalid file mode: ${modeToken.value}`);
        }
        
        this.consume(TokenType.Keyword, 'AS');
        
        const handleVar = this.consume(TokenType.Identifier, 'file handle variable').value;
        
        return new OpenStatement(filename, mode, handleVar);
    }

    private parseClose(): CloseStatement
    {
        this.consume(TokenType.Keyword, 'CLOSE');
        
        const fileHandle = this.parseExpression();
        
        return new CloseStatement(fileHandle);
    }

    private parseRead(): ReadFileStatement
    {
        this.consume(TokenType.Keyword, 'READ');
        
        const varName = this.consume(TokenType.Identifier, 'variable name').value;
        
        this.consume(TokenType.Keyword, 'FROM');
        
        const fileHandle = this.parseExpression();
        
        return new ReadFileStatement(varName, fileHandle);
    }

    private parseWrite(): WriteFileStatement
    {
        this.consume(TokenType.Keyword, 'WRITE');
        
        const expression = this.parseExpression();
        
        this.consume(TokenType.Keyword, 'TO');
        
        const fileHandle = this.parseExpression();
        
        return new WriteFileStatement(expression, fileHandle);
    }

    private parseLineInputOrGraphics(): Statement
    {
        this.consume(TokenType.Keyword, 'LINE');
        
        // Check if it's LINE INPUT or LINE graphics
        if (this.matchKeyword('INPUT'))
        {
            const varName = this.consume(TokenType.Identifier, 'variable name').value;
            
            this.consume(TokenType.Keyword, 'FROM');
            
            const fileHandle = this.parseExpression();
            
            return new LineInputStatement(varName, fileHandle);
        }
        else if (this.matchKeyword('FROM'))
        {
            // LINE FROM (x1, y1) TO (x2, y2)
            this.consume(TokenType.LeftParen, '(');
            
            const x1 = this.parseExpression();
            this.consume(TokenType.Comma, ',');
            
            const y1 = this.parseExpression();
            this.consume(TokenType.RightParen, ')');
            
            this.consume(TokenType.Keyword, 'TO');
            this.consume(TokenType.LeftParen, '(');
            
            const x2 = this.parseExpression();
            this.consume(TokenType.Comma, ',');
            
            const y2 = this.parseExpression();
            this.consume(TokenType.RightParen, ')');
            
            let color: Expression | null = null;
            if (this.matchKeyword('WITH'))
            {
                color = this.parseExpression();
            }
            
            return new LineStatement(x1, y1, x2, y2, color);
        }
        
        throw new Error('Expected INPUT or FROM after LINE');
    }

    private parseSeek(): SeekStatement
    {
        this.consume(TokenType.Keyword, 'SEEK');
        
        const position = this.parseExpression();
        
        this.consume(TokenType.Keyword, 'IN');
        
        const fileHandle = this.parseExpression();
        
        return new SeekStatement(position, fileHandle);
    }

    private parseReadfile(): ReadfileStatement
    {
        this.consume(TokenType.Keyword, 'READFILE');
        
        const varName = this.consume(TokenType.Identifier, 'variable name').value;
        
        this.consume(TokenType.Keyword, 'FROM');
        
        const filename = this.parseExpression();
        
        return new ReadfileStatement(varName, filename);
    }

    private parseWritefile(): WritefileStatement
    {
        this.consume(TokenType.Keyword, 'WRITEFILE');
        
        const content = this.parseExpression();
        
        this.consume(TokenType.Keyword, 'TO');
        
        const filename = this.parseExpression();
        
        return new WritefileStatement(content, filename);
    }

    private parseListdir(): ListdirStatement
    {
        this.consume(TokenType.Keyword, 'LISTDIR');
        
        const arrayVar = this.consume(TokenType.Identifier, 'array variable').value;
        
        this.consume(TokenType.Keyword, 'FROM');
        
        const path = this.parseExpression();
        
        return new ListdirStatement(arrayVar, path);
    }

    private parseMkdir(): MkdirStatement
    {
        this.consume(TokenType.Keyword, 'MKDIR');
        
        const path = this.parseExpression();
        
        return new MkdirStatement(path);
    }

    private parseRmdir(): RmdirStatement
    {
        this.consume(TokenType.Keyword, 'RMDIR');
        
        const path = this.parseExpression();
        
        return new RmdirStatement(path);
    }

    private parseCopy(): CopyStatement
    {
        this.consume(TokenType.Keyword, 'COPY');
        
        const source = this.parseExpression();
        
        this.consume(TokenType.Keyword, 'TO');
        
        const destination = this.parseExpression();
        
        return new CopyStatement(source, destination);
    }

    private parseMove(): MoveStatement
    {
        this.consume(TokenType.Keyword, 'MOVE');
        
        const source = this.parseExpression();
        
        this.consume(TokenType.Keyword, 'TO');
        
        const destination = this.parseExpression();
        
        return new MoveStatement(source, destination);
    }

    private parseDelete(): DeleteStatement
    {
        this.consume(TokenType.Keyword, 'DELETE');
        
        const filename = this.parseExpression();
        
        return new DeleteStatement(filename);
    }

    private parsePset(): PsetStatement
    {
        this.consume(TokenType.Keyword, 'PSET');
        this.consume(TokenType.LeftParen, '(');
        
        const x = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        let color: Expression | null = null;
        if (this.matchKeyword('WITH'))
        {
            color = this.parseExpression();
        }
        
        return new PsetStatement(x, y, color);
    }

    private parseRectangle(): RectangleStatement
    {
        this.consume(TokenType.Keyword, 'RECTANGLE');
        this.consume(TokenType.Keyword, 'FROM');
        this.consume(TokenType.LeftParen, '(');
        
        const x1 = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y1 = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        this.consume(TokenType.Keyword, 'TO');
        this.consume(TokenType.LeftParen, '(');
        
        const x2 = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y2 = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        let color: Expression | null = null;
        if (this.matchKeyword('WITH'))
        {
            color = this.parseExpression();
        }
        
        const filled = this.matchKeyword('FILLED');
        
        return new RectangleStatement(x1, y1, x2, y2, color, filled);
    }

    private parseOval(): OvalStatement
    {
        this.consume(TokenType.Keyword, 'OVAL');
        this.consume(TokenType.Keyword, 'AT');
        this.consume(TokenType.LeftParen, '(');
        
        const centerX = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const centerY = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        this.consume(TokenType.Keyword, 'RADII');
        this.consume(TokenType.LeftParen, '(');
        
        const radiusX = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const radiusY = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        let color: Expression | null = null;
        if (this.matchKeyword('WITH'))
        {
            color = this.parseExpression();
        }
        
        const filled = this.matchKeyword('FILLED');
        
        return new OvalStatement(centerX, centerY, radiusX, radiusY, color, filled);
    }

    private parseCircle(): CircleStatement
    {
        this.consume(TokenType.Keyword, 'CIRCLE');
        this.consume(TokenType.Keyword, 'AT');
        this.consume(TokenType.LeftParen, '(');
        
        const centerX = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const centerY = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        this.consume(TokenType.Keyword, 'RADIUS');
        
        const radius = this.parseExpression();
        
        let color: Expression | null = null;
        if (this.matchKeyword('WITH'))
        {
            color = this.parseExpression();
        }
        
        const filled = this.matchKeyword('FILLED');
        
        return new CircleStatement(centerX, centerY, radius, color, filled);
    }

    private parseTriangle(): TriangleStatement
    {
        this.consume(TokenType.Keyword, 'TRIANGLE');
        this.consume(TokenType.LeftParen, '(');
        
        const x1 = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y1 = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        this.consume(TokenType.LeftParen, '(');
        
        const x2 = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y2 = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        this.consume(TokenType.LeftParen, '(');
        
        const x3 = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y3 = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        let color: Expression | null = null;
        if (this.matchKeyword('WITH'))
        {
            color = this.parseExpression();
        }
        
        const filled = this.matchKeyword('FILLED');
        
        return new TriangleStatement(x1, y1, x2, y2, x3, y3, color, filled);
    }

    private parseArc(): ArcStatement
    {
        this.consume(TokenType.Keyword, 'ARC');
        this.consume(TokenType.Keyword, 'AT');
        this.consume(TokenType.LeftParen, '(');
        
        const centerX = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const centerY = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        this.consume(TokenType.Keyword, 'RADIUS');
        
        const radius = this.parseExpression();
        
        this.consume(TokenType.Keyword, 'FROM');
        
        const startAngle = this.parseExpression();
        
        this.consume(TokenType.Keyword, 'TO');
        
        const endAngle = this.parseExpression();
        
        let color: Expression | null = null;
        if (this.matchKeyword('WITH'))
        {
            color = this.parseExpression();
        }
        
        return new ArcStatement(centerX, centerY, radius, startAngle, endAngle, color);
    }

    private parsePaint(): PaintStatement
    {
        this.consume(TokenType.Keyword, 'PAINT');
        this.consume(TokenType.LeftParen, '(');
        
        const x = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        this.consume(TokenType.Keyword, 'WITH');
        
        const color = this.parseExpression();
        
        return new PaintStatement(x, y, color);
    }

    private parseGet(): GetStatement
    {
        this.consume(TokenType.Keyword, 'GET');
        
        const arrayVar = this.consume(TokenType.Identifier, 'array variable').value;
        
        this.consume(TokenType.Keyword, 'FROM');
        this.consume(TokenType.LeftParen, '(');
        
        const x1 = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y1 = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        this.consume(TokenType.Keyword, 'TO');
        this.consume(TokenType.LeftParen, '(');
        
        const x2 = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y2 = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        return new GetStatement(arrayVar, x1, y1, x2, y2);
    }

    private parsePut(): PutStatement
    {
        this.consume(TokenType.Keyword, 'PUT');
        
        const arrayVar = this.consume(TokenType.Identifier, 'array variable').value;
        
        this.consume(TokenType.Keyword, 'AT');
        this.consume(TokenType.LeftParen, '(');
        
        const x = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const y = this.parseExpression();
        this.consume(TokenType.RightParen, ')');
        
        return new PutStatement(arrayVar, x, y);
    }

    private parseTurtle(): TurtleStatement
    {
        this.consume(TokenType.Keyword, 'TURTLE');
        
        const commands = this.parseExpression();
        
        return new TurtleStatement(commands);
    }

    private parseTempo(): TempoStatement
    {
        this.consume(TokenType.Keyword, 'TEMPO');
        
        const bpm = this.parseExpression();
        
        return new TempoStatement(bpm);
    }

    private parseVolume(): VolumeStatement
    {
        this.consume(TokenType.Keyword, 'VOLUME');
        
        const level = this.parseExpression();
        
        return new VolumeStatement(level);
    }

    private parseVoice(): VoiceStatement
    {
        this.consume(TokenType.Keyword, 'VOICE');
        
        const voiceNumber = this.parseExpression();
        
        let preset: Expression | null = null;
        let noiseCode: Expression | null = null;
        let adsrPreset: number | null = null;
        let adsrCustom: Expression[] | null = null;
        
        if (this.matchKeyword('PRESET'))
        {
            preset = this.parseExpression();
        }
        else if (this.matchKeyword('WITH'))
        {
            noiseCode = this.parseExpression();
        }
        
        if (this.matchKeyword('ADSR'))
        {
            if (this.matchKeyword('PRESET'))
            {
                adsrPreset = parseInt(this.consume(TokenType.Integer, 'ADSR preset number').value);
            }
            else
            {
                adsrCustom = [];
                for (let i = 0; i < 4; i++)
                {
                    adsrCustom.push(this.parseExpression());
                }
            }
        }
        
        return new VoiceStatement(voiceNumber, preset, noiseCode, adsrPreset, adsrCustom);
    }

    private parsePlay(): PlayStatement
    {
        this.consume(TokenType.Keyword, 'PLAY');
        
        const voiceNumber = this.parseExpression();
        this.consume(TokenType.Comma, ',');
        
        const mml = this.parseExpression();
        
        return new PlayStatement(voiceNumber, mml);
    }

    private parsePush(): PushStatement
    {
        this.consume(TokenType.Keyword, 'PUSH');
        
        const arrayVar = this.consume(TokenType.Identifier, 'array variable').value;
        this.consume(TokenType.Comma, ',');
        
        const value = this.parseExpression();
        
        return new PushStatement(arrayVar, value);
    }

    private parsePop(): PopStatement
    {
        this.consume(TokenType.Keyword, 'POP');
        
        const arrayVar = this.consume(TokenType.Identifier, 'array variable').value;
        
        let targetVar: string | null = null;
        if (this.match(TokenType.Comma))
        {
            targetVar = this.consume(TokenType.Identifier, 'target variable').value;
        }
        
        return new PopStatement(arrayVar, targetVar);
    }

    private parseShift(): ShiftStatement
    {
        this.consume(TokenType.Keyword, 'SHIFT');
        
        const arrayVar = this.consume(TokenType.Identifier, 'array variable').value;
        
        let targetVar: string | null = null;
        if (this.match(TokenType.Comma))
        {
            targetVar = this.consume(TokenType.Identifier, 'target variable').value;
        }
        
        return new ShiftStatement(arrayVar, targetVar);
    }

    private parseUnshift(): UnshiftStatement
    {
        this.consume(TokenType.Keyword, 'UNSHIFT');
        
        const arrayVar = this.consume(TokenType.Identifier, 'array variable').value;
        this.consume(TokenType.Comma, ',');
        
        const value = this.parseExpression();
        
        return new UnshiftStatement(arrayVar, value);
    }

    private parseSleep(): SleepStatement
    {
        this.consume(TokenType.Keyword, 'SLEEP');
        
        const milliseconds = this.parseExpression();
        
        return new SleepStatement(milliseconds);
    }

    private parseSet(): SetStatement
    {
        this.consume(TokenType.Keyword, 'SET');
        
        // Parse SET options
        const token = this.consume(TokenType.Keyword, 'SET option');
        const option1 = token.value.toUpperCase();
        
        if (option1 === 'LINE')
        {
            this.consume(TokenType.Keyword, 'SPACING');
            const onOff = this.consume(TokenType.Keyword, 'ON or OFF').value.toUpperCase();
            
            return new SetStatement(
                onOff === 'ON' ? SetOption.LineSpacingOn : SetOption.LineSpacingOff
            );
        }
        else if (option1 === 'TEXT')
        {
            this.consume(TokenType.Keyword, 'WRAP');
            const onOff = this.consume(TokenType.Keyword, 'ON or OFF').value.toUpperCase();
            
            return new SetStatement(
                onOff === 'ON' ? SetOption.TextWrapOn : SetOption.TextWrapOff
            );
        }
        else if (option1 === 'AUDIO')
        {
            const onOff = this.consume(TokenType.Keyword, 'ON or OFF').value.toUpperCase();
            
            return new SetStatement(
                onOff === 'ON' ? SetOption.AudioOn : SetOption.AudioOff
            );
        }
        
        throw new Error(`Unknown SET option: ${option1}`);
    }

    private parseRandomize(): RandomizeStatement
    {
        this.consume(TokenType.Keyword, 'RANDOMIZE');
        
        let seed: number | null = null;
        if (!this.isAtEnd() && this.peek().type !== TokenType.EOF)
        {
            const expr = this.parseExpression();
            // TODO: Evaluate constant expression for seed
            seed = 0;
        }
        
        return new RandomizeStatement(seed);
    }

    private parseHelp(): HelpStatement
    {
        this.consume(TokenType.Keyword, 'HELP');
        
        const keyword = this.consume(TokenType.Keyword, 'statement keyword').value;
        
        return new HelpStatement(keyword);
    }

    private parseConsole(): ConsoleStatement
    {
        this.consume(TokenType.Keyword, 'CONSOLE');
        
        const expression = this.parseExpression();
        
        return new ConsoleStatement(expression);
    }

    private parseExpression(): Expression
    {
        // Collect remaining tokens for expression parser
        const exprTokens: Token[] = [];
        const startPos = this.current;
        let parenDepth = 0;
        let bracketDepth = 0;
        let braceDepth = 0;
        
        // Scan to end of expression (until EOF, comma, semicolon, keyword, etc.)
        while (!this.isAtEnd() && this.peek().type !== TokenType.EOF)
        {
            const token = this.peek();
            
            // Stop at statement separators when at depth 0 (not inside any delimiters)
            if (parenDepth === 0 && bracketDepth === 0 && braceDepth === 0)
            {
                const stopTokens = [
                    TokenType.Comma,
                    TokenType.Semicolon,
                    TokenType.RightParen,
                    TokenType.RightBracket,
                    TokenType.RightBrace
                ];
                
                if (stopTokens.includes(token.type) || 
                    (token.type === TokenType.Keyword && this.isStatementKeyword(token.value)))
                {
                    break;
                }
            }
            
            // Track delimiter depth
            if (token.type === TokenType.LeftParen)
            {
                parenDepth++;
            }
            else if (token.type === TokenType.RightParen)
            {
                parenDepth--;
            }
            else if (token.type === TokenType.LeftBracket)
            {
                bracketDepth++;
            }
            else if (token.type === TokenType.RightBracket)
            {
                bracketDepth--;
            }
            else if (token.type === TokenType.LeftBrace)
            {
                braceDepth++;
            }
            else if (token.type === TokenType.RightBrace)
            {
                braceDepth--;
            }
            
            exprTokens.push(token);
            this.advance();
        }
        
        if (exprTokens.length === 0)
        {
            throw new Error('Expected expression');
        }
        
        // Build source string from tokens, preserving proper syntax
        const exprSource = exprTokens.map(t => {
            // Wrap string tokens in quotes
            if (t.type === TokenType.String)
            {
                return `"${t.value}"`;
            }
            return t.value;
        }).join(' ');
        
        // Use expression parser to parse the expression
        return this.expressionParser.parseExpression(exprSource);
    }

    private isStatementKeyword(keyword: string): boolean
    {
        const upperKeyword = keyword.toUpperCase();
        const statementKeywords = [
            'APPEND', 'AS', 'AT', 'FILLED', 'FOR', 'FROM', 'IN', 'OVERWRITE', 
            'RADII', 'RADIUS', 'READ', 'STEP', 'THEN', 'TO', 'WITH'
        ];
        return statementKeywords.includes(upperKeyword);
    }

    // Token manipulation helpers
    private peek(): Token
    {
        return this.tokens[this.current];
    }

    private advance(): Token
    {
        if (!this.isAtEnd())
        {
            this.current++;
        }

        return this.tokens[this.current - 1];
    }

    private isAtEnd(): boolean
    {
        return this.current >= this.tokens.length || this.peek().type === TokenType.EOF;
    }

    private match(...types: TokenType[]): boolean
    {
        for (const type of types)
        {
            if (!this.isAtEnd() && this.peek().type === type)
            {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private matchKeyword(keyword: string): boolean
    {
        if (!this.isAtEnd() && 
            this.peek().type === TokenType.Keyword && 
            this.peek().value.toUpperCase() === keyword.toUpperCase())
        {
            this.advance();
            return true;
        }

        return false;
    }

    private consume(type: TokenType, message: string): Token
    {
        if (!this.isAtEnd() && this.peek().type === type)
        {
            return this.advance();
        }

        throw new Error(`Expected ${message}, got: ${this.peek().value}`);
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
