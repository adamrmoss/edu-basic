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
import { OpenStatement } from '../src/lang/statements/file-io';

describe('Parser parsers (edge cases)', () =>
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

    function expectFailure(result: { success: boolean }): void
    {
        expect(result.success).toBe(false);
    }

    describe('FileIoParsers', () =>
    {
        it('parses OPEN in APPEND/OVERWRITE modes', () =>
        {
            const appendResult = FileIoParsers.parseOpen(ctx(eofTokens([
                t(TokenType.Keyword, 'OPEN'),
                t(TokenType.String, 'file.txt'),
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Keyword, 'APPEND'),
                t(TokenType.Keyword, 'AS'),
                t(TokenType.Identifier, 'h%')
            ])));
            expect(appendResult.success).toBe(true);
            if (!appendResult.success) { return; }
            expect(appendResult.value).toBeInstanceOf(OpenStatement);

            const overwriteResult = FileIoParsers.parseOpen(ctx(eofTokens([
                t(TokenType.Keyword, 'OPEN'),
                t(TokenType.String, 'file.txt'),
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Keyword, 'OVERWRITE'),
                t(TokenType.Keyword, 'AS'),
                t(TokenType.Identifier, 'h%')
            ])));
            expect(overwriteResult.success).toBe(true);
            if (!overwriteResult.success) { return; }
            expect(overwriteResult.value).toBeInstanceOf(OpenStatement);
        });

        it('fails parsing when required tokens/expressions are missing', () =>
        {
            expectFailure(FileIoParsers.parseOpen(ctx(eofTokens([
                t(TokenType.Keyword, 'CLOSE'),
                t(TokenType.Identifier, 'h%')
            ]))));

            expectFailure(FileIoParsers.parseOpen(ctx(eofTokens([
                t(TokenType.Keyword, 'OPEN')
            ]))));

            expectFailure(FileIoParsers.parseOpen(ctx(eofTokens([
                t(TokenType.Keyword, 'OPEN'),
                t(TokenType.String, 'file.txt'),
                t(TokenType.Keyword, 'AS'),
                t(TokenType.Identifier, 'h%')
            ]))));

            expectFailure(FileIoParsers.parseOpen(ctx(eofTokens([
                t(TokenType.Keyword, 'OPEN'),
                t(TokenType.String, 'file.txt'),
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Keyword, 'READ'),
                t(TokenType.Identifier, 'h%')
            ]))));

            expectFailure(FileIoParsers.parseOpen(ctx(eofTokens([
                t(TokenType.Keyword, 'OPEN'),
                t(TokenType.String, 'file.txt'),
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Keyword, 'READ'),
                t(TokenType.Keyword, 'AS'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(FileIoParsers.parseClose(ctx(eofTokens([
                t(TokenType.Identifier, 'OPEN'),
                t(TokenType.String, 'file.txt')
            ]))));

            expectFailure(FileIoParsers.parseClose(ctx(eofTokens([
                t(TokenType.Keyword, 'CLOSE')
            ]))));

            expectFailure(FileIoParsers.parseRead(ctx(eofTokens([
                t(TokenType.Keyword, 'WRITE'),
                t(TokenType.String, 'Hello')
            ]))));

            expectFailure(FileIoParsers.parseRead(ctx(eofTokens([
                t(TokenType.Keyword, 'READ'),
                t(TokenType.String, 'x$'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.Identifier, 'h%')
            ]))));

            expectFailure(FileIoParsers.parseRead(ctx(eofTokens([
                t(TokenType.Keyword, 'READ'),
                t(TokenType.Identifier, 'x$'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Identifier, 'h%')
            ]))));

            expectFailure(FileIoParsers.parseWrite(ctx(eofTokens([
                t(TokenType.Keyword, 'READ'),
                t(TokenType.Identifier, 'x$')
            ]))));

            expectFailure(FileIoParsers.parseWrite(ctx(eofTokens([
                t(TokenType.Keyword, 'WRITE')
            ]))));

            expectFailure(FileIoParsers.parseWrite(ctx(eofTokens([
                t(TokenType.Keyword, 'WRITE'),
                t(TokenType.String, 'Hello'),
                t(TokenType.Keyword, 'IN'),
                t(TokenType.Identifier, 'h%')
            ]))));

            expectFailure(FileIoParsers.parseSeek(ctx(eofTokens([
                t(TokenType.Keyword, 'SEEK'),
                t(TokenType.Integer, '0'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Identifier, 'h%')
            ]))));

            expectFailure(FileIoParsers.parseReadfile(ctx(eofTokens([
                t(TokenType.Keyword, 'READFILE'),
                t(TokenType.String, 'x$'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.String, 'file.txt')
            ]))));

            expectFailure(FileIoParsers.parseWritefile(ctx(eofTokens([
                t(TokenType.Keyword, 'WRITEFILE'),
                t(TokenType.String, 'Hello'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.String, 'file.txt')
            ]))));

            expectFailure(FileIoParsers.parseListdir(ctx(eofTokens([
                t(TokenType.Keyword, 'LISTDIR'),
                t(TokenType.String, 'arr$[]'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.String, '.')
            ]))));

            expectFailure(FileIoParsers.parseListdir(ctx(eofTokens([
                t(TokenType.Keyword, 'LISTDIR'),
                t(TokenType.Identifier, 'arr$[]'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.String, '.')
            ]))));

            expectFailure(FileIoParsers.parseMkdir(ctx(eofTokens([
                t(TokenType.Keyword, 'MKDIR')
            ]))));

            expectFailure(FileIoParsers.parseRmdir(ctx(eofTokens([
                t(TokenType.Keyword, 'RMDIR')
            ]))));

            expectFailure(FileIoParsers.parseCopy(ctx(eofTokens([
                t(TokenType.Keyword, 'COPY'),
                t(TokenType.String, 'a'),
                t(TokenType.Keyword, 'IN'),
                t(TokenType.String, 'b')
            ]))));

            expectFailure(FileIoParsers.parseMove(ctx(eofTokens([
                t(TokenType.Keyword, 'MOVE'),
                t(TokenType.String, 'a'),
                t(TokenType.Keyword, 'IN'),
                t(TokenType.String, 'b')
            ]))));

            expectFailure(FileIoParsers.parseDelete(ctx(eofTokens([
                t(TokenType.Keyword, 'DELETE')
            ]))));
        });
    });

    describe('GraphicsParsers', () =>
    {
        it('fails parsing when required tokens/expressions are missing', () =>
        {
            expectFailure(GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Integer, '2')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.LeftParen, '(')
            ]))));

            expectFailure(GraphicsParsers.parseOval(ctx(eofTokens([
                t(TokenType.Keyword, 'OVAL'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'RADII')
            ]))));

            expectFailure(GraphicsParsers.parseCircle(ctx(eofTokens([
                t(TokenType.Keyword, 'CIRCLE'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')')
            ]))));

            expectFailure(GraphicsParsers.parseTriangle(ctx(eofTokens([
                t(TokenType.Keyword, 'TRIANGLE'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.LeftParen, '(')
            ]))));

            expectFailure(GraphicsParsers.parseArc(ctx(eofTokens([
                t(TokenType.Keyword, 'ARC'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'RADIUS'),
                t(TokenType.Integer, '3'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.Integer, '0')
            ]))));

            expectFailure(GraphicsParsers.parsePaint(ctx(eofTokens([
                t(TokenType.Keyword, 'PAINT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')')
            ]))));

            expectFailure(GraphicsParsers.parseGet(ctx(eofTokens([
                t(TokenType.Keyword, 'GET'),
                t(TokenType.Identifier, 'arr%[]')
            ]))));

            expectFailure(GraphicsParsers.parsePut(ctx(eofTokens([
                t(TokenType.Keyword, 'PUT'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Keyword, 'FROM')
            ]))));

            expectFailure(GraphicsParsers.parseTurtle(ctx(eofTokens([
                t(TokenType.Keyword, 'TURTLE')
            ]))));

            expectFailure(GraphicsParsers.parseLineInputOrGraphics(ctx(eofTokens([
                t(TokenType.Keyword, 'LINE'),
                t(TokenType.Keyword, 'INPUT'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.Identifier, 'h%')
            ]))));

            expectFailure(GraphicsParsers.parseLineInputOrGraphics(ctx(eofTokens([
                t(TokenType.Keyword, 'LINE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'TO')
            ]))));
        });
    });

    describe('ArrayParsers', () =>
    {
        it('parses POP/SHIFT with and without a target variable', () =>
        {
            const popNoTarget = ArrayParsers.parsePop(ctx(eofTokens([
                t(TokenType.Keyword, 'POP'),
                t(TokenType.Identifier, 'arr%[]')
            ])));
            expect(popNoTarget.success).toBe(true);

            const popWithTarget = ArrayParsers.parsePop(ctx(eofTokens([
                t(TokenType.Keyword, 'POP'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Comma, ','),
                t(TokenType.Identifier, 'x%')
            ])));
            expect(popWithTarget.success).toBe(true);

            const shiftNoTarget = ArrayParsers.parseShift(ctx(eofTokens([
                t(TokenType.Keyword, 'SHIFT'),
                t(TokenType.Identifier, 'arr%[]')
            ])));
            expect(shiftNoTarget.success).toBe(true);

            const shiftWithTarget = ArrayParsers.parseShift(ctx(eofTokens([
                t(TokenType.Keyword, 'SHIFT'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Comma, ','),
                t(TokenType.Identifier, 'x%')
            ])));
            expect(shiftWithTarget.success).toBe(true);
        });

        it('fails parsing when required tokens/expressions are missing', () =>
        {
            expectFailure(ArrayParsers.parsePush(ctx(eofTokens([
                t(TokenType.Identifier, 'PUSH'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(ArrayParsers.parsePush(ctx(eofTokens([
                t(TokenType.Keyword, 'SHIFT'),
                t(TokenType.Identifier, 'arr%[]')
            ]))));

            expectFailure(ArrayParsers.parsePush(ctx(eofTokens([
                t(TokenType.Keyword, 'PUSH')
            ]))));

            expectFailure(ArrayParsers.parsePush(ctx(eofTokens([
                t(TokenType.Keyword, 'PUSH'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(ArrayParsers.parsePush(ctx(eofTokens([
                t(TokenType.Keyword, 'PUSH'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(ArrayParsers.parsePush(ctx(eofTokens([
                t(TokenType.Keyword, 'PUSH'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Comma, ',')
            ]))));

            expectFailure(ArrayParsers.parsePop(ctx(eofTokens([
                t(TokenType.Identifier, 'POP'),
                t(TokenType.Identifier, 'arr%[]')
            ]))));

            expectFailure(ArrayParsers.parsePop(ctx(eofTokens([
                t(TokenType.Keyword, 'POP')
            ]))));

            expectFailure(ArrayParsers.parsePop(ctx(eofTokens([
                t(TokenType.Keyword, 'POP'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(ArrayParsers.parsePop(ctx(eofTokens([
                t(TokenType.Keyword, 'POP'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Comma, ',')
            ]))));

            expectFailure(ArrayParsers.parseShift(ctx(eofTokens([
                t(TokenType.Identifier, 'SHIFT'),
                t(TokenType.Identifier, 'arr%[]')
            ]))));

            expectFailure(ArrayParsers.parseShift(ctx(eofTokens([
                t(TokenType.Keyword, 'SHIFT')
            ]))));

            expectFailure(ArrayParsers.parseShift(ctx(eofTokens([
                t(TokenType.Keyword, 'SHIFT'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(ArrayParsers.parseUnshift(ctx(eofTokens([
                t(TokenType.Keyword, 'UNSHIFT'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Comma, ',')
            ]))));

            expectFailure(ArrayParsers.parseUnshift(ctx(eofTokens([
                t(TokenType.Keyword, 'UNSHIFT'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Comma, ','),
                t(TokenType.Comma, ',')
            ]))));
        });
    });

    describe('AudioParsers', () =>
    {
        it('fails parsing when required tokens/expressions are missing', () =>
        {
            expectFailure(AudioParsers.parseTempo(ctx(eofTokens([
                t(TokenType.Identifier, 'TEMPO'),
                t(TokenType.Integer, '120')
            ]))));

            expectFailure(AudioParsers.parseTempo(ctx(eofTokens([
                t(TokenType.Keyword, 'TEMPO')
            ]))));

            expectFailure(AudioParsers.parseVolume(ctx(eofTokens([
                t(TokenType.Keyword, 'VOLUME')
            ]))));

            expectFailure(AudioParsers.parseVolume(ctx(eofTokens([
                t(TokenType.Identifier, 'VOLUME'),
                t(TokenType.Integer, '80')
            ]))));

            expectFailure(AudioParsers.parseVoice(ctx(eofTokens([
                t(TokenType.Keyword, 'VOICE'),
                t(TokenType.Integer, '0'),
                t(TokenType.Identifier, 'TO'),
                t(TokenType.String, 'piano')
            ]))));

            expectFailure(AudioParsers.parseVoice(ctx(eofTokens([
                t(TokenType.Identifier, 'VOICE'),
                t(TokenType.Integer, '0'),
                t(TokenType.Keyword, 'INSTRUMENT'),
                t(TokenType.String, 'piano')
            ]))));

            expectFailure(AudioParsers.parseVoice(ctx(eofTokens([
                t(TokenType.Keyword, 'VOICE'),
                t(TokenType.Integer, '0'),
                t(TokenType.Keyword, 'INSTRUMENT')
            ]))));

            expectFailure(AudioParsers.parsePlay(ctx(eofTokens([
                t(TokenType.Keyword, 'PLAY'),
                t(TokenType.Integer, '0'),
                t(TokenType.String, 'C D E')
            ]))));

            expectFailure(AudioParsers.parsePlay(ctx(eofTokens([
                t(TokenType.Identifier, 'PLAY'),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.String, 'C D E')
            ]))));

            expectFailure(AudioParsers.parsePlay(ctx(eofTokens([
                t(TokenType.Keyword, 'PLAY'),
                t(TokenType.Comma, ','),
                t(TokenType.String, 'C D E')
            ]))));

            expectFailure(AudioParsers.parsePlay(ctx(eofTokens([
                t(TokenType.Keyword, 'PLAY'),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ',')
            ]))));
        });
    });

    describe('GraphicsParsers', () =>
    {
        it('parses common forms without optional WITH/FILLED', () =>
        {
            const psetNoWith = GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')')
            ])));
            expect(psetNoWith.success).toBe(true);

            const rectNoWithNoFilled = GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '1'),
                t(TokenType.RightParen, ')')
            ])));
            expect(rectNoWithNoFilled.success).toBe(true);

            const ovalNoWithNoFilled = GraphicsParsers.parseOval(ctx(eofTokens([
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
                t(TokenType.RightParen, ')')
            ])));
            expect(ovalNoWithNoFilled.success).toBe(true);

            const circleNoWithNoFilled = GraphicsParsers.parseCircle(ctx(eofTokens([
                t(TokenType.Keyword, 'CIRCLE'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '5'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '6'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'RADIUS'),
                t(TokenType.Integer, '4')
            ])));
            expect(circleNoWithNoFilled.success).toBe(true);

            const arcNoWith = GraphicsParsers.parseArc(ctx(eofTokens([
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
                t(TokenType.Integer, '90')
            ])));
            expect(arcNoWith.success).toBe(true);
        });

        it('fails parsing when WITH is present but missing a color expression', () =>
        {
            expectFailure(GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Comma, ',')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '1'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Comma, ',')
            ]))));
        });

        it('covers many early-return branches for graphics parsing', () =>
        {
            expectFailure(GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Identifier, 'PSET')
            ]))));

            expectFailure(GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Comma, ',')
            ]))));

            expectFailure(GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Integer, '2')
            ]))));

            expectFailure(GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.RightParen, ')')
            ]))));

            expectFailure(GraphicsParsers.parsePset(ctx(eofTokens([
                t(TokenType.Keyword, 'PSET'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Identifier, 'RECTANGLE')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Identifier, 'FROM')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.Integer, '0')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Comma, ',')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Integer, '0')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.RightParen, ')')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.Integer, '0')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Identifier, 'TO')
            ]))));

            expectFailure(GraphicsParsers.parseRectangle(ctx(eofTokens([
                t(TokenType.Keyword, 'RECTANGLE'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '0'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '0'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Integer, '0')
            ]))));

            expectFailure(GraphicsParsers.parsePaint(ctx(eofTokens([
                t(TokenType.Identifier, 'PAINT')
            ]))));

            expectFailure(GraphicsParsers.parsePaint(ctx(eofTokens([
                t(TokenType.Keyword, 'PAINT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Identifier, 'WITH'),
                t(TokenType.Integer, '3')
            ]))));

            expectFailure(GraphicsParsers.parsePaint(ctx(eofTokens([
                t(TokenType.Keyword, 'PAINT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'WITH'),
                t(TokenType.Comma, ',')
            ]))));

            expectFailure(GraphicsParsers.parseOval(ctx(eofTokens([
                t(TokenType.Identifier, 'OVAL')
            ]))));

            expectFailure(GraphicsParsers.parseOval(ctx(eofTokens([
                t(TokenType.Keyword, 'OVAL'),
                t(TokenType.Identifier, 'AT')
            ]))));

            expectFailure(GraphicsParsers.parseOval(ctx(eofTokens([
                t(TokenType.Keyword, 'OVAL'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Identifier, 'RADII')
            ]))));

            expectFailure(GraphicsParsers.parseCircle(ctx(eofTokens([
                t(TokenType.Identifier, 'CIRCLE')
            ]))));

            expectFailure(GraphicsParsers.parseCircle(ctx(eofTokens([
                t(TokenType.Keyword, 'CIRCLE'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Identifier, 'RADIUS')
            ]))));

            expectFailure(GraphicsParsers.parseArc(ctx(eofTokens([
                t(TokenType.Identifier, 'ARC')
            ]))));

            expectFailure(GraphicsParsers.parseArc(ctx(eofTokens([
                t(TokenType.Keyword, 'ARC'),
                t(TokenType.Keyword, 'AT'),
                t(TokenType.LeftParen, '('),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'RADIUS'),
                t(TokenType.Integer, '3'),
                t(TokenType.Keyword, 'FROM'),
                t(TokenType.Integer, '0'),
                t(TokenType.Identifier, 'TO')
            ]))));

            expectFailure(GraphicsParsers.parseTriangle(ctx(eofTokens([
                t(TokenType.Identifier, 'TRIANGLE')
            ]))));

            expectFailure(GraphicsParsers.parseGet(ctx(eofTokens([
                t(TokenType.Identifier, 'GET')
            ]))));

            expectFailure(GraphicsParsers.parseGet(ctx(eofTokens([
                t(TokenType.Keyword, 'GET'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(GraphicsParsers.parsePut(ctx(eofTokens([
                t(TokenType.Keyword, 'PUT'),
                t(TokenType.Identifier, 'arr%[]'),
                t(TokenType.Identifier, 'AT')
            ]))));

            expectFailure(GraphicsParsers.parseTurtle(ctx(eofTokens([
                t(TokenType.Identifier, 'TURTLE'),
                t(TokenType.String, 'FD 10')
            ]))));

            expectFailure(GraphicsParsers.parseLineInputOrGraphics(ctx(eofTokens([
                t(TokenType.Identifier, 'LINE')
            ]))));
        });
    });

    describe('VariableParsers', () =>
    {
        it('fails parsing when required tokens/expressions are missing', () =>
        {
            expectFailure(VariableParsers.parseLet(ctx(eofTokens([
                t(TokenType.Keyword, 'LET'),
                t(TokenType.Identifier, 'x%'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(VariableParsers.parseLocal(ctx(eofTokens([
                t(TokenType.Keyword, 'LOCAL'),
                t(TokenType.Identifier, 'x%'),
                t(TokenType.Equal, '=')
            ]))));

            expectFailure(VariableParsers.parseDim(ctx(eofTokens([
                t(TokenType.Keyword, 'DIM'),
                t(TokenType.Identifier, 'a%'),
                t(TokenType.Integer, '10')
            ]))));

            expectFailure(VariableParsers.parseDim(ctx(eofTokens([
                t(TokenType.Keyword, 'DIM'),
                t(TokenType.Identifier, 'a%'),
                t(TokenType.LeftBracket, '['),
                t(TokenType.Integer, '10'),
                t(TokenType.Comma, ','),
                t(TokenType.RightBracket, ']')
            ]))));

            expectFailure(VariableParsers.parseDim(ctx(eofTokens([
                t(TokenType.Keyword, 'DIM'),
                t(TokenType.Identifier, 'a%'),
                t(TokenType.LeftBracket, '['),
                t(TokenType.Integer, '10')
            ]))));
        });
    });

    describe('IoParsers', () =>
    {
        it('parses PRINT with comma separators and without a newline', () =>
        {
            const commaSeparated = IoParsers.parsePrint(ctx(eofTokens([
                t(TokenType.Keyword, 'PRINT'),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2')
            ])));
            expect(commaSeparated.success).toBe(true);

            const noNewline = IoParsers.parsePrint(ctx(eofTokens([
                t(TokenType.Keyword, 'PRINT'),
                t(TokenType.String, 'A'),
                t(TokenType.Semicolon, ';')
            ])));
            expect(noNewline.success).toBe(true);
        });

        it('fails parsing when required tokens/expressions are missing', () =>
        {
            expectFailure(IoParsers.parseInput(ctx(eofTokens([
                t(TokenType.Keyword, 'INPUT')
            ]))));

            expectFailure(IoParsers.parseLocate(ctx(eofTokens([
                t(TokenType.Keyword, 'LOCATE'),
                t(TokenType.Integer, '1'),
                t(TokenType.Integer, '2')
            ]))));

            expectFailure(IoParsers.parsePrint(ctx(eofTokens([
                t(TokenType.Keyword, 'PRINT'),
                t(TokenType.Comma, ',')
            ]))));
        });

        it('parses COLOR in multiple forms and fails when missing foreground', () =>
        {
            const fgOnly = IoParsers.parseColor(ctx(eofTokens([
                t(TokenType.Keyword, 'COLOR'),
                t(TokenType.Integer, '1')
            ])));
            expect(fgOnly.success).toBe(true);

            const fgAndBg = IoParsers.parseColor(ctx(eofTokens([
                t(TokenType.Keyword, 'COLOR'),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2')
            ])));
            expect(fgAndBg.success).toBe(true);

            const missingForeground = IoParsers.parseColor(ctx(eofTokens([
                t(TokenType.Keyword, 'COLOR'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2')
            ])));
            expect(missingForeground.success).toBe(false);

            const missingBackgroundExpr = IoParsers.parseColor(ctx(eofTokens([
                t(TokenType.Keyword, 'COLOR'),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ',')
            ])));
            expect(missingBackgroundExpr.success).toBe(false);
        });
    });

    describe('MiscParsers', () =>
    {
        it('parses SET variants and fails on unknown option', () =>
        {
            const lineOff = MiscParsers.parseSet(ctx(eofTokens([
                t(TokenType.Keyword, 'SET'),
                t(TokenType.Keyword, 'LINE'),
                t(TokenType.Keyword, 'SPACING'),
                t(TokenType.Keyword, 'OFF')
            ])));
            expect(lineOff.success).toBe(true);

            const textOn = MiscParsers.parseSet(ctx(eofTokens([
                t(TokenType.Keyword, 'SET'),
                t(TokenType.Keyword, 'TEXT'),
                t(TokenType.Keyword, 'WRAP'),
                t(TokenType.Keyword, 'ON')
            ])));
            expect(textOn.success).toBe(true);

            const audioOff = MiscParsers.parseSet(ctx(eofTokens([
                t(TokenType.Keyword, 'SET'),
                t(TokenType.Keyword, 'AUDIO'),
                t(TokenType.Keyword, 'OFF')
            ])));
            expect(audioOff.success).toBe(true);

            const unknown = MiscParsers.parseSet(ctx(eofTokens([
                t(TokenType.Keyword, 'SET'),
                t(TokenType.Keyword, 'WAT')
            ])));
            expect(unknown.success).toBe(false);
        });

        it('parses RANDOMIZE with and without a seed, and tolerates an unparsable seed', () =>
        {
            const noSeed = MiscParsers.parseRandomize(ctx(eofTokens([
                t(TokenType.Keyword, 'RANDOMIZE')
            ])));
            expect(noSeed.success).toBe(true);

            const withSeed = MiscParsers.parseRandomize(ctx(eofTokens([
                t(TokenType.Keyword, 'RANDOMIZE'),
                t(TokenType.Integer, '123')
            ])));
            expect(withSeed.success).toBe(true);

            const badSeed = MiscParsers.parseRandomize(ctx(eofTokens([
                t(TokenType.Keyword, 'RANDOMIZE'),
                t(TokenType.Comma, ',')
            ])));
            expect(badSeed.success).toBe(false);
        });

        it('fails parsing when required tokens/expressions are missing', () =>
        {
            expectFailure(MiscParsers.parseSleep(ctx(eofTokens([
                t(TokenType.Keyword, 'SLEEP')
            ]))));

            expectFailure(MiscParsers.parseSet(ctx(eofTokens([
                t(TokenType.Keyword, 'SET')
            ]))));

            expectFailure(MiscParsers.parseHelp(ctx(eofTokens([
                t(TokenType.Keyword, 'HELP')
            ]))));

            expectFailure(MiscParsers.parseConsole(ctx(eofTokens([
                t(TokenType.Keyword, 'CONSOLE')
            ]))));
        });
    });

    describe('ControlFlowParsers', () =>
    {
        it('parses FOR with and without STEP', () =>
        {
            const noStep = ControlFlowParsers.parseFor(ctx(eofTokens([
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Identifier, 'i%'),
                t(TokenType.Equal, '='),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Integer, '10')
            ])));
            expect(noStep.success).toBe(true);

            const withStep = ControlFlowParsers.parseFor(ctx(eofTokens([
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Identifier, 'i%'),
                t(TokenType.Equal, '='),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Integer, '10'),
                t(TokenType.Keyword, 'STEP'),
                t(TokenType.Integer, '2')
            ])));
            expect(withStep.success).toBe(true);

            const badStep = ControlFlowParsers.parseFor(ctx(eofTokens([
                t(TokenType.Keyword, 'FOR'),
                t(TokenType.Identifier, 'i%'),
                t(TokenType.Equal, '='),
                t(TokenType.Integer, '1'),
                t(TokenType.Keyword, 'TO'),
                t(TokenType.Integer, '10'),
                t(TokenType.Keyword, 'STEP')
            ])));
            expect(badStep.success).toBe(false);
        });

        it('parses NEXT with and without a variable name', () =>
        {
            const bareNext = ControlFlowParsers.parseNext(ctx(eofTokens([
                t(TokenType.Keyword, 'NEXT')
            ])));
            expect(bareNext.success).toBe(true);

            const namedNext = ControlFlowParsers.parseNext(ctx(eofTokens([
                t(TokenType.Keyword, 'NEXT'),
                t(TokenType.Identifier, 'i%')
            ])));
            expect(namedNext.success).toBe(true);
        });

        it('parses DO variants', () =>
        {
            const doLoop = ControlFlowParsers.parseDo(ctx(eofTokens([
                t(TokenType.Keyword, 'DO')
            ])));
            expect(doLoop.success).toBe(true);

            const doWhile = ControlFlowParsers.parseDo(ctx(eofTokens([
                t(TokenType.Keyword, 'DO'),
                t(TokenType.Keyword, 'WHILE'),
                t(TokenType.Integer, '1')
            ])));
            expect(doWhile.success).toBe(true);

            const doUntil = ControlFlowParsers.parseDo(ctx(eofTokens([
                t(TokenType.Keyword, 'DO'),
                t(TokenType.Keyword, 'UNTIL'),
                t(TokenType.Integer, '1')
            ])));
            expect(doUntil.success).toBe(true);
        });

        it('parses SUB parameters (including BYREF) and fails on malformed BYREF parameter', () =>
        {
            const ok = ControlFlowParsers.parseSub(ctx(eofTokens([
                t(TokenType.Keyword, 'SUB'),
                t(TokenType.Identifier, 'S'),
                t(TokenType.Identifier, 'x%'),
                t(TokenType.Comma, ','),
                t(TokenType.Keyword, 'BYREF'),
                t(TokenType.Identifier, 'y$')
            ])));
            expect(ok.success).toBe(true);

            const badByRef = ControlFlowParsers.parseSub(ctx(eofTokens([
                t(TokenType.Keyword, 'SUB'),
                t(TokenType.Identifier, 'S'),
                t(TokenType.Keyword, 'BYREF')
            ])));
            expect(badByRef.success).toBe(false);
        });

        it('parses CALL with and without arguments and fails on malformed arguments', () =>
        {
            const noArgs = ControlFlowParsers.parseCall(ctx(eofTokens([
                t(TokenType.Keyword, 'CALL'),
                t(TokenType.Identifier, 'S')
            ])));
            expect(noArgs.success).toBe(true);

            const args = ControlFlowParsers.parseCall(ctx(eofTokens([
                t(TokenType.Keyword, 'CALL'),
                t(TokenType.Identifier, 'S'),
                t(TokenType.Integer, '1'),
                t(TokenType.Comma, ','),
                t(TokenType.Integer, '2')
            ])));
            expect(args.success).toBe(true);

            const badArgs = ControlFlowParsers.parseCall(ctx(eofTokens([
                t(TokenType.Keyword, 'CALL'),
                t(TokenType.Identifier, 'S'),
                t(TokenType.Comma, ',')
            ])));
            expect(badArgs.success).toBe(false);
        });

        it('parses END targets and EXIT/CONTINUE targets (and fails when missing a target)', () =>
        {
            expect(ControlFlowParsers.parseEnd(ctx(eofTokens([
                t(TokenType.Keyword, 'END')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseEnd(ctx(eofTokens([
                t(TokenType.Keyword, 'END'),
                t(TokenType.Keyword, 'IF')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseEnd(ctx(eofTokens([
                t(TokenType.Keyword, 'END'),
                t(TokenType.Keyword, 'UNLESS')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseEnd(ctx(eofTokens([
                t(TokenType.Keyword, 'END'),
                t(TokenType.Keyword, 'SELECT')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseEnd(ctx(eofTokens([
                t(TokenType.Keyword, 'END'),
                t(TokenType.Keyword, 'SUB')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseEnd(ctx(eofTokens([
                t(TokenType.Keyword, 'END'),
                t(TokenType.Keyword, 'TRY')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseExit(ctx(eofTokens([
                t(TokenType.Keyword, 'EXIT'),
                t(TokenType.Keyword, 'FOR')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseExit(ctx(eofTokens([
                t(TokenType.Keyword, 'EXIT'),
                t(TokenType.Keyword, 'WHILE')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseExit(ctx(eofTokens([
                t(TokenType.Keyword, 'EXIT'),
                t(TokenType.Keyword, 'DO')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseExit(ctx(eofTokens([
                t(TokenType.Keyword, 'EXIT'),
                t(TokenType.Keyword, 'SUB')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseExit(ctx(eofTokens([
                t(TokenType.Keyword, 'EXIT')
            ]))).success).toBe(false);

            expect(ControlFlowParsers.parseContinue(ctx(eofTokens([
                t(TokenType.Keyword, 'CONTINUE'),
                t(TokenType.Keyword, 'FOR')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseContinue(ctx(eofTokens([
                t(TokenType.Keyword, 'CONTINUE'),
                t(TokenType.Keyword, 'WHILE')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseContinue(ctx(eofTokens([
                t(TokenType.Keyword, 'CONTINUE'),
                t(TokenType.Keyword, 'DO')
            ]))).success).toBe(true);

            expect(ControlFlowParsers.parseContinue(ctx(eofTokens([
                t(TokenType.Keyword, 'CONTINUE')
            ]))).success).toBe(false);
        });

        it('fails parsing IF when condition or THEN is missing', () =>
        {
            expect(ControlFlowParsers.parseIf(ctx(eofTokens([
                t(TokenType.Keyword, 'IF'),
                t(TokenType.RightParen, ')'),
                t(TokenType.Keyword, 'THEN')
            ]))).success).toBe(false);

            expect(ControlFlowParsers.parseIf(ctx(eofTokens([
                t(TokenType.Keyword, 'IF'),
                t(TokenType.Integer, '1')
            ]))).success).toBe(false);
        });

        it('fails parsing other control-flow forms when required parts are missing', () =>
        {
            expectFailure(ControlFlowParsers.parseSelectCase(ctx(eofTokens([
                t(TokenType.Keyword, 'SELECT'),
                t(TokenType.Identifier, 'CASE'),
                t(TokenType.Integer, '1')
            ]))));

            expectFailure(ControlFlowParsers.parseSelectCase(ctx(eofTokens([
                t(TokenType.Keyword, 'SELECT'),
                t(TokenType.Keyword, 'CASE')
            ]))));

            expectFailure(ControlFlowParsers.parseThrow(ctx(eofTokens([
                t(TokenType.Keyword, 'THROW')
            ]))));

            expectFailure(ControlFlowParsers.parseThrow(ctx(eofTokens([
                t(TokenType.Keyword, 'THROW'),
                t(TokenType.Comma, ',')
            ]))));

            expectFailure(ControlFlowParsers.parseGoto(ctx(eofTokens([
                t(TokenType.Keyword, 'GOTO')
            ]))));

            expectFailure(ControlFlowParsers.parseGosub(ctx(eofTokens([
                t(TokenType.Keyword, 'GOSUB')
            ]))));

            expectFailure(ControlFlowParsers.parseLabel(ctx(eofTokens([
                t(TokenType.Keyword, 'LABEL')
            ]))));

            expectFailure(ControlFlowParsers.parseReturn(ctx(eofTokens([
                t(TokenType.Identifier, 'RETURN')
            ]))));

            expectFailure(ControlFlowParsers.parseTry(ctx(eofTokens([
                t(TokenType.Identifier, 'TRY')
            ]))));

            expectFailure(ControlFlowParsers.parseCatch(ctx(eofTokens([
                t(TokenType.Identifier, 'CATCH')
            ]))));

            expectFailure(ControlFlowParsers.parseFinally(ctx(eofTokens([
                t(TokenType.Identifier, 'FINALLY')
            ]))));

            expectFailure(ControlFlowParsers.parseWhile(ctx(eofTokens([
                t(TokenType.Keyword, 'WHILE')
            ]))));

            expectFailure(ControlFlowParsers.parseWhile(ctx(eofTokens([
                t(TokenType.Keyword, 'WHILE'),
                t(TokenType.Comma, ',')
            ]))));

            expectFailure(ControlFlowParsers.parseUnless(ctx(eofTokens([
                t(TokenType.Keyword, 'UNLESS'),
                t(TokenType.Comma, ','),
                t(TokenType.Keyword, 'THEN')
            ]))));

            expectFailure(ControlFlowParsers.parseUntil(ctx(eofTokens([
                t(TokenType.Keyword, 'UNTIL')
            ]))));

            expectFailure(ControlFlowParsers.parseDo(ctx(eofTokens([
                t(TokenType.Keyword, 'DO'),
                t(TokenType.Keyword, 'WHILE')
            ]))));

            expectFailure(ControlFlowParsers.parseDo(ctx(eofTokens([
                t(TokenType.Keyword, 'DO'),
                t(TokenType.Keyword, 'UNTIL')
            ]))));
        });
    });
}

