import { ExpressionParserService } from '../src/app/interpreter/expression-parser.service';
import { ParserContext } from '../src/app/interpreter/parser/parsers/parser-context';
import { ArrayParsers } from '../src/app/interpreter/parser/parsers/array-parsers';
import { AudioParsers } from '../src/app/interpreter/parser/parsers/audio-parsers';
import { ControlFlowParsers } from '../src/app/interpreter/parser/parsers/control-flow-parsers';
import { FileIoParsers } from '../src/app/interpreter/parser/parsers/file-io-parsers';
import { GraphicsParsers } from '../src/app/interpreter/parser/parsers/graphics-parsers';
import { IoParsers } from '../src/app/interpreter/parser/parsers/io-parsers';
import { MiscParsers } from '../src/app/interpreter/parser/parsers/misc-parsers';
import { VariableParsers } from '../src/app/interpreter/parser/parsers/variable-parsers';
import { Token, TokenType } from '../src/app/interpreter/tokenizer.service';
import {
    CallStatement,
    CaseStatement,
    CatchStatement,
    ContinueStatement,
    DoLoopStatement,
    ElseIfStatement,
    ElseStatement,
    EndStatement,
    ExitStatement,
    FinallyStatement,
    ForStatement,
    GosubStatement,
    GotoStatement,
    IfStatement,
    LabelStatement,
    LoopStatement,
    NextStatement,
    ReturnStatement,
    SelectCaseStatement,
    SubStatement,
    ThrowStatement,
    TryStatement,
    UendStatement,
    UnlessStatement,
    UntilStatement,
    WendStatement,
    WhileStatement
} from '../src/lang/statements/control-flow';
import { PopStatement, PushStatement, ShiftStatement, UnshiftStatement } from '../src/lang/statements/array';
import { PlayStatement, TempoStatement, VoiceStatement, VolumeStatement } from '../src/lang/statements/audio';
import {
    CloseStatement,
    CopyStatement,
    DeleteStatement,
    LineInputStatement,
    ListdirStatement,
    MkdirStatement,
    MoveStatement,
    OpenStatement,
    ReadFileStatement,
    ReadfileStatement,
    RmdirStatement,
    SeekStatement,
    WriteFileStatement,
    WritefileStatement
} from '../src/lang/statements/file-io';
import {
    ArcStatement,
    CircleStatement,
    GetStatement,
    LineStatement,
    OvalStatement,
    PaintStatement,
    PsetStatement,
    PutStatement,
    RectangleStatement,
    TriangleStatement,
    TurtleStatement
} from '../src/lang/statements/graphics';
import { ClsStatement, ColorStatement, InputStatement, LocateStatement, PrintStatement } from '../src/lang/statements/io';
import { ConsoleStatement, HelpStatement, RandomizeStatement, SetStatement, SleepStatement } from '../src/lang/statements/misc';
import { DimStatement, LetStatement, LocalStatement } from '../src/lang/statements/variables';

describe('Parser parsers (direct parser class calls)', () =>
{
    const expressionParser = new ExpressionParserService();

    function t(type: TokenType, value: string): Token
    {
        return { type, value, line: 1, column: 1 };
    }

    function ctx(tokens: Token[]): ParserContext
    {
        return new ParserContext(tokens, { value: 0 }, expressionParser);
    }

    function eofTokens(tokens: Token[]): Token[]
    {
        return [...tokens, t(TokenType.EOF, '')];
    }

    describe('ControlFlowParsers', () =>
    {
        it('parses core statement forms (happy paths)', () =>
        {
            const ifResult = ControlFlowParsers.parseIf(ctx(eofTokens([
                t(TokenType.Keyword, 'IF'),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'THEN')
            ])));
            expect(ifResult.success).toBe(true);
            if (!ifResult.success) { return; }
            expect(ifResult.value).toBeInstanceOf(IfStatement);

            const elseifResult = ControlFlowParsers.parseElseIf(ctx(eofTokens([
                t(TokenType.Keyword, 'ELSEIF'),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'THEN')
            ])));
            expect(elseifResult.success).toBe(true);
            if (!elseifResult.success) { return; }
            expect(elseifResult.value).toBeInstanceOf(ElseIfStatement);

            const elseResult = ControlFlowParsers.parseElse(ctx(eofTokens([
                t(TokenType.Keyword, 'ELSE')
            ])));
            expect(elseResult.success).toBe(true);
            if (!elseResult.success) { return; }
            expect(elseResult.value).toBeInstanceOf(ElseStatement);

            const unlessResult = ControlFlowParsers.parseUnless(ctx(eofTokens([
                t(TokenType.Keyword, 'UNLESS'),
                t(TokenType.Integer, '0'),
                t(TokenType.Keyword, 'THEN')
            ])));
            expect(unlessResult.success).toBe(true);
            if (!unlessResult.success) { return; }
            expect(unlessResult.value).toBeInstanceOf(UnlessStatement);

            const selectCaseResult = ControlFlowParsers.parseSelectCase(ctx(eofTokens([
                t(TokenType.Keyword, 'SELECT'),
                t(TokenType.Keyword, 'CASE'),
                t(TokenType.Integer, '1')
            ])));
            expect(selectCaseResult.success).toBe(true);
            if (!selectCaseResult.success) { return; }
            expect(selectCaseResult.value).toBeInstanceOf(SelectCaseStatement);

            const caseResult = ControlFlowParsers.parseCase(ctx(eofTokens([
                t(TokenType.Keyword, 'CASE')
            ])));
            expect(caseResult.success).toBe(true);
            if (!caseResult.success) { return; }
            expect(caseResult.value).toBeInstanceOf(CaseStatement);

            const forResult = ControlFlowParsers.parseFor(ctx(eofTokens([
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Identifier, 'i%'),
                t(TokenType.Equal, '='),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Integer, '10'),
                t(TokenType.Keyword, 'STEP'),
                t(TokenType.Integer, '2')
            ])));
            expect(forResult.success).toBe(true);
            if (!forResult.success) { return; }
            expect(forResult.value).toBeInstanceOf(ForStatement);

            const forNoStepResult = ControlFlowParsers.parseFor(ctx(eofTokens([
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Identifier, 'j%'),
                t(TokenType.Equal, '='),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Integer, '2')
            ])));
            expect(forNoStepResult.success).toBe(true);
            if (!forNoStepResult.success) { return; }
            expect(forNoStepResult.value).toBeInstanceOf(ForStatement);

            const nextWithVarResult = ControlFlowParsers.parseNext(ctx(eofTokens([
                t(TokenType.Keyword, 'NEXT'),
                t(TokenType.Identifier, 'i%')
            ])));
            expect(nextWithVarResult.success).toBe(true);
            if (!nextWithVarResult.success) { return; }
            expect(nextWithVarResult.value).toBeInstanceOf(NextStatement);

            const nextNoVarResult = ControlFlowParsers.parseNext(ctx(eofTokens([
                t(TokenType.Keyword, 'NEXT')
            ])));
            expect(nextNoVarResult.success).toBe(true);
            if (!nextNoVarResult.success) { return; }
            expect(nextNoVarResult.value).toBeInstanceOf(NextStatement);

            const whileResult = ControlFlowParsers.parseWhile(ctx(eofTokens([
                t(TokenType.Keyword, 'WHILE'),
                t(TokenType.Integer, '1')
            ])));
            expect(whileResult.success).toBe(true);
            if (!whileResult.success) { return; }
            expect(whileResult.value).toBeInstanceOf(WhileStatement);

            const wendResult = ControlFlowParsers.parseWend(ctx(eofTokens([
                t(TokenType.Keyword, 'WEND')
            ])));
            expect(wendResult.success).toBe(true);
            if (!wendResult.success) { return; }
            expect(wendResult.value).toBeInstanceOf(WendStatement);

            const untilResult = ControlFlowParsers.parseUntil(ctx(eofTokens([
                t(TokenType.Keyword, 'UNTIL'),
                t(TokenType.Integer, '0')
            ])));
            expect(untilResult.success).toBe(true);
            if (!untilResult.success) { return; }
            expect(untilResult.value).toBeInstanceOf(UntilStatement);

            const uendResult = ControlFlowParsers.parseUend(ctx(eofTokens([
                t(TokenType.Keyword, 'UEND')
            ])));
            expect(uendResult.success).toBe(true);
            if (!uendResult.success) { return; }
            expect(uendResult.value).toBeInstanceOf(UendStatement);

            const doResult = ControlFlowParsers.parseDo(ctx(eofTokens([
                t(TokenType.Keyword, 'DO'),
                t(TokenType.Keyword, 'WHILE'),
                t(TokenType.Integer, '1')
            ])));
            expect(doResult.success).toBe(true);
            if (!doResult.success) { return; }
            expect(doResult.value).toBeInstanceOf(DoLoopStatement);

            const doUntilResult = ControlFlowParsers.parseDo(ctx(eofTokens([
                t(TokenType.Keyword, 'DO'),
                t(TokenType.Keyword, 'UNTIL'),
                t(TokenType.Integer, '0')
            ])));
            expect(doUntilResult.success).toBe(true);
            if (!doUntilResult.success) { return; }
            expect(doUntilResult.value).toBeInstanceOf(DoLoopStatement);

            const doBareResult = ControlFlowParsers.parseDo(ctx(eofTokens([
                t(TokenType.Keyword, 'DO')
            ])));
            expect(doBareResult.success).toBe(true);
            if (!doBareResult.success) { return; }
            expect(doBareResult.value).toBeInstanceOf(DoLoopStatement);

            const loopResult = ControlFlowParsers.parseLoop(ctx(eofTokens([
                t(TokenType.Keyword, 'LOOP')
            ])));
            expect(loopResult.success).toBe(true);
            if (!loopResult.success) { return; }
            expect(loopResult.value).toBeInstanceOf(LoopStatement);

            const subResult = ControlFlowParsers.parseSub(ctx(eofTokens([
                t(TokenType.Keyword, 'SUB'),
                t(TokenType.Identifier, 'MySub'),
                t(TokenType.Keyword, 'BYREF'),
                t(TokenType.Identifier, 'x%'),
                t(TokenType.Comma, ','),
                t(TokenType.Identifier, 'y%')
            ])));
            expect(subResult.success).toBe(true);
            if (!subResult.success) { return; }
            expect(subResult.value).toBeInstanceOf(SubStatement);

            const callResult = ControlFlowParsers.parseCall(ctx(eofTokens([
                t(TokenType.Keyword, 'CALL'),
                t(TokenType.Identifier, 'MySub'),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2')
            ])));
            expect(callResult.success).toBe(true);
            if (!callResult.success) { return; }
            expect(callResult.value).toBeInstanceOf(CallStatement);

            const tryResult = ControlFlowParsers.parseTry(ctx(eofTokens([
                t(TokenType.Keyword, 'TRY')
            ])));
            expect(tryResult.success).toBe(true);
            if (!tryResult.success) { return; }
            expect(tryResult.value).toBeInstanceOf(TryStatement);

            const catchResult = ControlFlowParsers.parseCatch(ctx(eofTokens([
                t(TokenType.Keyword, 'CATCH')
            ])));
            expect(catchResult.success).toBe(true);
            if (!catchResult.success) { return; }
            expect(catchResult.value).toBeInstanceOf(CatchStatement);

            const finallyResult = ControlFlowParsers.parseFinally(ctx(eofTokens([
                t(TokenType.Keyword, 'FINALLY')
            ])));
            expect(finallyResult.success).toBe(true);
            if (!finallyResult.success) { return; }
            expect(finallyResult.value).toBeInstanceOf(FinallyStatement);

            const gotoResult = ControlFlowParsers.parseGoto(ctx(eofTokens([
                t(TokenType.Keyword, 'GOTO'),
                t(TokenType.Identifier, 'Start')
            ])));
            expect(gotoResult.success).toBe(true);
            if (!gotoResult.success) { return; }
            expect(gotoResult.value).toBeInstanceOf(GotoStatement);

            const gosubResult = ControlFlowParsers.parseGosub(ctx(eofTokens([
                t(TokenType.Keyword, 'GOSUB'),
                t(TokenType.Identifier, 'Start')
            ])));
            expect(gosubResult.success).toBe(true);
            if (!gosubResult.success) { return; }
            expect(gosubResult.value).toBeInstanceOf(GosubStatement);

            const returnResult = ControlFlowParsers.parseReturn(ctx(eofTokens([
                t(TokenType.Keyword, 'RETURN')
            ])));
            expect(returnResult.success).toBe(true);
            if (!returnResult.success) { return; }
            expect(returnResult.value).toBeInstanceOf(ReturnStatement);

            const labelResult = ControlFlowParsers.parseLabel(ctx(eofTokens([
                t(TokenType.Keyword, 'LABEL'),
                t(TokenType.Identifier, 'Start')
            ])));
            expect(labelResult.success).toBe(true);
            if (!labelResult.success) { return; }
            expect(labelResult.value).toBeInstanceOf(LabelStatement);

            const endIfResult = ControlFlowParsers.parseEnd(ctx(eofTokens([
                t(TokenType.Keyword, 'END'),
                t(TokenType.Keyword, 'IF')
            ])));
            expect(endIfResult.success).toBe(true);
            if (!endIfResult.success) { return; }
            expect(endIfResult.value).toBeInstanceOf(EndStatement);

            const endProgramResult = ControlFlowParsers.parseEnd(ctx(eofTokens([
                t(TokenType.Keyword, 'END')
            ])));
            expect(endProgramResult.success).toBe(true);
            if (!endProgramResult.success) { return; }
            expect(endProgramResult.value).toBeInstanceOf(EndStatement);

            const exitResult = ControlFlowParsers.parseExit(ctx(eofTokens([
                t(TokenType.Keyword, 'EXIT'),
                t(TokenType.Keyword, 'FOR')
            ])));
            expect(exitResult.success).toBe(true);
            if (!exitResult.success) { return; }
            expect(exitResult.value).toBeInstanceOf(ExitStatement);

            const continueResult = ControlFlowParsers.parseContinue(ctx(eofTokens([
                t(TokenType.Keyword, 'CONTINUE'),
                t(TokenType.Keyword, 'DO')
            ])));
            expect(continueResult.success).toBe(true);
            if (!continueResult.success) { return; }
            expect(continueResult.value).toBeInstanceOf(ContinueStatement);

            const throwResult = ControlFlowParsers.parseThrow(ctx(eofTokens([
                t(TokenType.Keyword, 'THROW'),
                t(TokenType.String, 'Boom')
            ])));
            expect(throwResult.success).toBe(true);
            if (!throwResult.success) { return; }
            expect(throwResult.value).toBeInstanceOf(ThrowStatement);
        });

        it('covers a few common failure paths', () =>
        {
            const badExit = ControlFlowParsers.parseExit(ctx(eofTokens([
                t(TokenType.Keyword, 'EXIT')
            ])));
            expect(badExit.success).toBe(false);
            if (badExit.success) { return; }
            expect(badExit.error).toContain('EXIT must specify target');

            const badContinue = ControlFlowParsers.parseContinue(ctx(eofTokens([
                t(TokenType.Keyword, 'CONTINUE')
            ])));
            expect(badContinue.success).toBe(false);
            if (badContinue.success) { return; }
            expect(badContinue.error).toContain('CONTINUE must specify target');
        });
    });

    describe('IoParsers', () =>
    {
        it('parses PRINT/INPUT/COLOR/LOCATE/CLS (happy paths)', () =>
        {
            const printEmptyResult = IoParsers.parsePrint(ctx(eofTokens([
                t(TokenType.Keyword, 'PRINT')
            ])));
            expect(printEmptyResult.success).toBe(true);
            if (!printEmptyResult.success) { return; }
            expect(printEmptyResult.value).toBeInstanceOf(PrintStatement);

            const printCommaResult = IoParsers.parsePrint(ctx(eofTokens([
                t(TokenType.Keyword, 'PRINT'),
                t(TokenType.String, 'A'),
                t(TokenType.Comma, ','),
                t(TokenType.String, 'B')
            ])));
            expect(printCommaResult.success).toBe(true);
            if (!printCommaResult.success) { return; }
            expect(printCommaResult.value).toBeInstanceOf(PrintStatement);

            const printNoNewlineResult = IoParsers.parsePrint(ctx(eofTokens([
                t(TokenType.Keyword, 'PRINT'),
                t(TokenType.String, 'A'),
                t(TokenType.Semicolon, ';')
            ])));
            expect(printNoNewlineResult.success).toBe(true);
            if (!printNoNewlineResult.success) { return; }
            expect(printNoNewlineResult.value).toBeInstanceOf(PrintStatement);

            const inputResult = IoParsers.parseInput(ctx(eofTokens([
                t(TokenType.Keyword, 'INPUT'),
                t(TokenType.Identifier, 'x$')
            ])));
            expect(inputResult.success).toBe(true);
            if (!inputResult.success) { return; }
            expect(inputResult.value).toBeInstanceOf(InputStatement);

            const colorResult = IoParsers.parseColor(ctx(eofTokens([
                t(TokenType.Keyword, 'COLOR'),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2')
            ])));
            expect(colorResult.success).toBe(true);
            if (!colorResult.success) { return; }
            expect(colorResult.value).toBeInstanceOf(ColorStatement);

            const locateResult = IoParsers.parseLocate(ctx(eofTokens([
                t(TokenType.Keyword, 'LOCATE'),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2')
            ])));
            expect(locateResult.success).toBe(true);
            if (!locateResult.success) { return; }
            expect(locateResult.value).toBeInstanceOf(LocateStatement);

            const clsResult = IoParsers.parseCls(ctx(eofTokens([
                t(TokenType.Keyword, 'CLS')
            ])));
            expect(clsResult.success).toBe(true);
            if (!clsResult.success) { return; }
            expect(clsResult.value).toBeInstanceOf(ClsStatement);
        });

        it('covers a COLOR failure path (missing foreground)', () =>
        {
            const badColor = IoParsers.parseColor(ctx(eofTokens([
                t(TokenType.Keyword, 'COLOR'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2')
            ])));
            expect(badColor.success).toBe(false);
        });
    });

    describe('ArrayParsers', () =>
    {
        it('parses PUSH/POP/SHIFT/UNSHIFT (happy paths)', () =>
        {
            const pushResult = ArrayParsers.parsePush(ctx(eofTokens([
                t(TokenType.Keyword, 'PUSH'),
                t(TokenType.Identifier, 'a%[]'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '1')
            ])));
            expect(pushResult.success).toBe(true);
            if (!pushResult.success) { return; }
            expect(pushResult.value).toBeInstanceOf(PushStatement);

            const popNoTargetResult = ArrayParsers.parsePop(ctx(eofTokens([
                t(TokenType.Keyword, 'POP'),
                t(TokenType.Identifier, 'a%[]')
            ])));
            expect(popNoTargetResult.success).toBe(true);
            if (!popNoTargetResult.success) { return; }
            expect(popNoTargetResult.value).toBeInstanceOf(PopStatement);

            const popWithTargetResult = ArrayParsers.parsePop(ctx(eofTokens([
                t(TokenType.Keyword, 'POP'),
                t(TokenType.Identifier, 'a%[]'),
                t(TokenType.Comma, ','),
                t(TokenType.Identifier, 'x%')
            ])));
            expect(popWithTargetResult.success).toBe(true);
            if (!popWithTargetResult.success) { return; }
            expect(popWithTargetResult.value).toBeInstanceOf(PopStatement);

            const shiftWithTargetResult = ArrayParsers.parseShift(ctx(eofTokens([
                t(TokenType.Keyword, 'SHIFT'),
                t(TokenType.Identifier, 'a%[]'),
                t(TokenType.Comma, ','),
                t(TokenType.Identifier, 'x%')
            ])));
            expect(shiftWithTargetResult.success).toBe(true);
            if (!shiftWithTargetResult.success) { return; }
            expect(shiftWithTargetResult.value).toBeInstanceOf(ShiftStatement);

            const unshiftResult = ArrayParsers.parseUnshift(ctx(eofTokens([
                t(TokenType.Keyword, 'UNSHIFT'),
                t(TokenType.Identifier, 'a%[]'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '1')
            ])));
            expect(unshiftResult.success).toBe(true);
            if (!unshiftResult.success) { return; }
            expect(unshiftResult.value).toBeInstanceOf(UnshiftStatement);
        });
    });

    describe('AudioParsers', () =>
    {
        it('parses TEMPO/VOLUME/VOICE/PLAY (happy paths)', () =>
        {
            const tempoResult = AudioParsers.parseTempo(ctx(eofTokens([
                t(TokenType.Keyword, 'TEMPO'),
                t(TokenType.Integer, '120')
            ])));
            expect(tempoResult.success).toBe(true);
            if (!tempoResult.success) { return; }
            expect(tempoResult.value).toBeInstanceOf(TempoStatement);

            const volumeResult = AudioParsers.parseVolume(ctx(eofTokens([
                t(TokenType.Keyword, 'VOLUME'),
                t(TokenType.Integer, '80')
            ])));
            expect(volumeResult.success).toBe(true);
            if (!volumeResult.success) { return; }
            expect(volumeResult.value).toBeInstanceOf(VolumeStatement);

            const voiceResult = AudioParsers.parseVoice(ctx(eofTokens([
                t(TokenType.Keyword, 'VOICE'),
                t(TokenType.Integer, '0'),
                t(TokenType.Keyword, 'INSTRUMENT'),
                t(TokenType.String, 'piano')
            ])));
            expect(voiceResult.success).toBe(true);
            if (!voiceResult.success) { return; }
            expect(voiceResult.value).toBeInstanceOf(VoiceStatement);

            const playResult = AudioParsers.parsePlay(ctx(eofTokens([
                t(TokenType.Keyword, 'PLAY'),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.String, 'C D E')
            ])));
            expect(playResult.success).toBe(true);
            if (!playResult.success) { return; }
            expect(playResult.value).toBeInstanceOf(PlayStatement);
        });
    });

    describe('FileIoParsers', () =>
    {
        it('parses common file I/O statement forms (happy paths)', () =>
        {
            const openResult = FileIoParsers.parseOpen(ctx(eofTokens([
                t(TokenType.Keyword, 'OPEN'),
                t(TokenType.String, 'file.txt'),
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Keyword, 'READ'),
                t(TokenType.Keyword, 'AS'),
                t(TokenType.Identifier, 'h%')
            ])));
            expect(openResult.success).toBe(true);
            if (!openResult.success) { return; }
            expect(openResult.value).toBeInstanceOf(OpenStatement);

            const closeResult = FileIoParsers.parseClose(ctx(eofTokens([
                t(TokenType.Keyword, 'CLOSE'),
                t(TokenType.Identifier, 'h%')
            ])));
            expect(closeResult.success).toBe(true);
            if (!closeResult.success) { return; }
            expect(closeResult.value).toBeInstanceOf(CloseStatement);

            const readResult = FileIoParsers.parseRead(ctx(eofTokens([
                t(TokenType.Keyword, 'READ'),
                t(TokenType.Identifier, 'x$'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.Identifier, 'h%')
            ])));
            expect(readResult.success).toBe(true);
            if (!readResult.success) { return; }
            expect(readResult.value).toBeInstanceOf(ReadFileStatement);

            const writeResult = FileIoParsers.parseWrite(ctx(eofTokens([
                t(TokenType.Keyword, 'WRITE'),
                t(TokenType.String, 'Hello'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Identifier, 'h%')
            ])));
            expect(writeResult.success).toBe(true);
            if (!writeResult.success) { return; }
            expect(writeResult.value).toBeInstanceOf(WriteFileStatement);

            const seekResult = FileIoParsers.parseSeek(ctx(eofTokens([
                t(TokenType.Keyword, 'SEEK'),
                t(TokenType.Integer, '0'),
                t(TokenType.Keyword, 'IN'),
                t(TokenType.Identifier, 'h%')
            ])));
            expect(seekResult.success).toBe(true);
            if (!seekResult.success) { return; }
            expect(seekResult.value).toBeInstanceOf(SeekStatement);

            const readfileResult = FileIoParsers.parseReadfile(ctx(eofTokens([
                t(TokenType.Keyword, 'READFILE'),
                t(TokenType.Identifier, 'x$'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.String, 'file.txt')
            ])));
            expect(readfileResult.success).toBe(true);
            if (!readfileResult.success) { return; }
            expect(readfileResult.value).toBeInstanceOf(ReadfileStatement);

            const writefileResult = FileIoParsers.parseWritefile(ctx(eofTokens([
                t(TokenType.Keyword, 'WRITEFILE'),
                t(TokenType.String, 'Hello'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.String, 'file.txt')
            ])));
            expect(writefileResult.success).toBe(true);
            if (!writefileResult.success) { return; }
            expect(writefileResult.value).toBeInstanceOf(WritefileStatement);

            const listdirResult = FileIoParsers.parseListdir(ctx(eofTokens([
                t(TokenType.Keyword, 'LISTDIR'),
                t(TokenType.Identifier, 'arr$[]'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.String, '.')
            ])));
            expect(listdirResult.success).toBe(true);
            if (!listdirResult.success) { return; }
            expect(listdirResult.value).toBeInstanceOf(ListdirStatement);

            const mkdirResult = FileIoParsers.parseMkdir(ctx(eofTokens([
                t(TokenType.Keyword, 'MKDIR'),
                t(TokenType.String, 'dir')
            ])));
            expect(mkdirResult.success).toBe(true);
            if (!mkdirResult.success) { return; }
            expect(mkdirResult.value).toBeInstanceOf(MkdirStatement);

            const rmdirResult = FileIoParsers.parseRmdir(ctx(eofTokens([
                t(TokenType.Keyword, 'RMDIR'),
                t(TokenType.String, 'dir')
            ])));
            expect(rmdirResult.success).toBe(true);
            if (!rmdirResult.success) { return; }
            expect(rmdirResult.value).toBeInstanceOf(RmdirStatement);

            const copyResult = FileIoParsers.parseCopy(ctx(eofTokens([
                t(TokenType.Keyword, 'COPY'),
                t(TokenType.String, 'a'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.String, 'b')
            ])));
            expect(copyResult.success).toBe(true);
            if (!copyResult.success) { return; }
            expect(copyResult.value).toBeInstanceOf(CopyStatement);

            const moveResult = FileIoParsers.parseMove(ctx(eofTokens([
                t(TokenType.Keyword, 'MOVE'),
                t(TokenType.String, 'a'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.String, 'b')
            ])));
            expect(moveResult.success).toBe(true);
            if (!moveResult.success) { return; }
            expect(moveResult.value).toBeInstanceOf(MoveStatement);

            const deleteResult = FileIoParsers.parseDelete(ctx(eofTokens([
                t(TokenType.Keyword, 'DELETE'),
                t(TokenType.String, 'a')
            ])));
            expect(deleteResult.success).toBe(true);
            if (!deleteResult.success) { return; }
            expect(deleteResult.value).toBeInstanceOf(DeleteStatement);
        });

        it('covers parseOpen invalid file mode', () =>
        {
            const badModeResult = FileIoParsers.parseOpen(ctx(eofTokens([
                t(TokenType.Keyword, 'OPEN'),
                t(TokenType.String, 'file.txt'),
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Keyword, 'BADMODE'),
                t(TokenType.Keyword, 'AS'),
                t(TokenType.Identifier, 'h%')
            ])));
            expect(badModeResult.success).toBe(false);
        });
    });

    describe('GraphicsParsers', () =>
    {
        it('parses common graphics statement forms (happy paths)', () =>
        {
            const psetResult = GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Integer, '3')
            ])));
            expect(psetResult.success).toBe(true);
            if (!psetResult.success) { return; }
            expect(psetResult.value).toBeInstanceOf(PsetStatement);

            const rectResult = GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '10'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '10'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'FILLED')
            ])));
            expect(rectResult.success).toBe(true);
            if (!rectResult.success) { return; }
            expect(rectResult.value).toBeInstanceOf(RectangleStatement);

            const ovalResult = GraphicsParsers.parseOval(ctx(eofTokens([
                t(TokenType.Keyword, 'OVAL'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '5'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '6'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'RADII'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'FILLED')
            ])));
            expect(ovalResult.success).toBe(true);
            if (!ovalResult.success) { return; }
            expect(ovalResult.value).toBeInstanceOf(OvalStatement);

            const circleResult = GraphicsParsers.parseCircle(ctx(eofTokens([
                t(TokenType.Keyword, 'CIRCLE'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '5'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '6'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'RADIUS'),
                t(TokenType.Integer, '4'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'FILLED')
            ])));
            expect(circleResult.success).toBe(true);
            if (!circleResult.success) { return; }
            expect(circleResult.value).toBeInstanceOf(CircleStatement);

            const triangleResult = GraphicsParsers.parseTriangle(ctx(eofTokens([
                t(TokenType.Keyword, 'TRIANGLE'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '10'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '10'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'FILLED')
            ])));
            expect(triangleResult.success).toBe(true);
            if (!triangleResult.success) { return; }
            expect(triangleResult.value).toBeInstanceOf(TriangleStatement);

            const arcResult = GraphicsParsers.parseArc(ctx(eofTokens([
                t(TokenType.Keyword, 'ARC'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '5'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '6'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'RADIUS'),
                t(TokenType.Integer, '4'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.Integer, '0'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Integer, '90'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Integer, '1')
            ])));
            expect(arcResult.success).toBe(true);
            if (!arcResult.success) { return; }
            expect(arcResult.value).toBeInstanceOf(ArcStatement);

            const paintResult = GraphicsParsers.parsePaint(ctx(eofTokens([
                t(TokenType.Keyword, 'PAINT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Integer, '3')
            ])));
            expect(paintResult.success).toBe(true);
            if (!paintResult.success) { return; }
            expect(paintResult.value).toBeInstanceOf(PaintStatement);

            const getResult = GraphicsParsers.parseGet(ctx(eofTokens([
                t(TokenType.Keyword, 'GET'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '10'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '10'),
                t(TokenType.RightParen, ')')
            ])));
            expect(getResult.success).toBe(true);
            if (!getResult.success) { return; }
            expect(getResult.value).toBeInstanceOf(GetStatement);

            const putResult = GraphicsParsers.parsePut(ctx(eofTokens([
                t(TokenType.Keyword, 'PUT'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')')
            ])));
            expect(putResult.success).toBe(true);
            if (!putResult.success) { return; }
            expect(putResult.value).toBeInstanceOf(PutStatement);

            const turtleResult = GraphicsParsers.parseTurtle(ctx(eofTokens([
                t(TokenType.Keyword, 'TURTLE'),
                t(TokenType.String, 'FD 10')
            ])));
            expect(turtleResult.success).toBe(true);
            if (!turtleResult.success) { return; }
            expect(turtleResult.value).toBeInstanceOf(TurtleStatement);

            const lineInputResult = GraphicsParsers.parseLineInputOrGraphics(ctx(eofTokens([
                t(TokenType.Keyword, 'LINE'),
                t(TokenType.Keyword, 'INPUT'),
                t(TokenType.Identifier, 'x$'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.Identifier, 'h%')
            ])));
            expect(lineInputResult.success).toBe(true);
            if (!lineInputResult.success) { return; }
            expect(lineInputResult.value).toBeInstanceOf(LineInputStatement);

            const lineGraphicsResult = GraphicsParsers.parseLineInputOrGraphics(ctx(eofTokens([
                t(TokenType.Keyword, 'LINE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '10'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '10'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Integer, '1')
            ])));
            expect(lineGraphicsResult.success).toBe(true);
            if (!lineGraphicsResult.success) { return; }
            expect(lineGraphicsResult.value).toBeInstanceOf(LineStatement);
        });

        it('covers parseLineInputOrGraphics failure', () =>
        {
            const badLine = GraphicsParsers.parseLineInputOrGraphics(ctx(eofTokens([
                t(TokenType.Keyword, 'LINE'),
                t(TokenType.Keyword, 'TO')
            ])));
            expect(badLine.success).toBe(false);
        });
    });

    describe('VariableParsers', () =>
    {
        it('parses LET/LOCAL/DIM (happy paths)', () =>
        {
            const letResult = VariableParsers.parseLet(ctx(eofTokens([
                t(TokenType.Keyword, 'LET'),
                t(TokenType.Identifier, 'x%'),
                t(TokenType.Equal, '='),
                t(TokenType.Integer, '1')
            ])));
            expect(letResult.success).toBe(true);
            if (!letResult.success) { return; }
            expect(letResult.value).toBeInstanceOf(LetStatement);

            const localResult = VariableParsers.parseLocal(ctx(eofTokens([
                t(TokenType.Keyword, 'LOCAL'),
                t(TokenType.Identifier, 'x%'),
                t(TokenType.Equal, '='),
                t(TokenType.Integer, '1')
            ])));
            expect(localResult.success).toBe(true);
            if (!localResult.success) { return; }
            expect(localResult.value).toBeInstanceOf(LocalStatement);

            const dimResult = VariableParsers.parseDim(ctx(eofTokens([
                t(TokenType.Keyword, 'DIM'),
                t(TokenType.Identifier, 'a%'),
                t(TokenType.LeftBracket, '['),
                t(TokenType.Integer, '10'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '20'),
                t(TokenType.RightBracket, ']')
            ])));
            expect(dimResult.success).toBe(true);
            if (!dimResult.success) { return; }
            expect(dimResult.value).toBeInstanceOf(DimStatement);
        });
    });

    describe('MiscParsers', () =>
    {
        it('parses SLEEP/SET/RANDOMIZE/HELP/CONSOLE (happy paths)', () =>
        {
            const sleepResult = MiscParsers.parseSleep(ctx(eofTokens([
                t(TokenType.Keyword, 'SLEEP'),
                t(TokenType.Integer, '1')
            ])));
            expect(sleepResult.success).toBe(true);
            if (!sleepResult.success) { return; }
            expect(sleepResult.value).toBeInstanceOf(SleepStatement);

            const setResult = MiscParsers.parseSet(ctx(eofTokens([
                t(TokenType.Keyword, 'SET'),
                t(TokenType.Keyword, 'LINE'),
                t(TokenType.Keyword, 'SPACING'),
                t(TokenType.Keyword, 'ON')
            ])));
            expect(setResult.success).toBe(true);
            if (!setResult.success) { return; }
            expect(setResult.value).toBeInstanceOf(SetStatement);

            const randomizeResult = MiscParsers.parseRandomize(ctx(eofTokens([
                t(TokenType.Keyword, 'RANDOMIZE'),
                t(TokenType.Integer, '123')
            ])));
            expect(randomizeResult.success).toBe(true);
            if (!randomizeResult.success) { return; }
            expect(randomizeResult.value).toBeInstanceOf(RandomizeStatement);

            const helpResult = MiscParsers.parseHelp(ctx(eofTokens([
                t(TokenType.Keyword, 'HELP'),
                t(TokenType.Keyword, 'PRINT')
            ])));
            expect(helpResult.success).toBe(true);
            if (!helpResult.success) { return; }
            expect(helpResult.value).toBeInstanceOf(HelpStatement);

            const consoleResult = MiscParsers.parseConsole(ctx(eofTokens([
                t(TokenType.Keyword, 'CONSOLE'),
                t(TokenType.Integer, '1')
            ])));
            expect(consoleResult.success).toBe(true);
            if (!consoleResult.success) { return; }
            expect(consoleResult.value).toBeInstanceOf(ConsoleStatement);
        });
    });
});

