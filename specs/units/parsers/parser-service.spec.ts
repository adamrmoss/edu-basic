import { ParserService } from '@/app/interpreter/parser.service';
import { DimStatement, LetStatement, LocalStatement } from '@/lang/statements/variables';
import {
    EndStatement,
    EndType,
    ForStatement,
    GotoStatement,
    IfStatement,
    LabelStatement,
    WhileStatement
} from '@/lang/statements/control-flow';
import { ColorStatement, PrintStatement } from '@/lang/statements/io';
import { LineStatement, PsetStatement } from '@/lang/statements/graphics';
import { CloseStatement, FileMode, OpenStatement } from '@/lang/statements/file-io';
import { PlayStatement, TempoStatement, VoiceStatement, VolumeStatement } from '@/lang/statements/audio';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('ParserService', () =>
{
    let parser: ParserService;

    beforeEach(() =>
    {
        parser = new ParserService();
    });

    describe('Variable Statements', () =>
    {
        it('should parse LET statement', () =>
        {
            const result = parser.parseLine(1, 'LET x% = 42');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(LetStatement);
            
            const stmt = result.value.statement as LetStatement;
            expect(stmt.variableName).toBe('x%');
        });

        it('should canonicalize LET with NOTES operator with space (NOTES 0 not NOTES0)', () =>
        {
            const result = parser.parseLine(1, 'LET x% = NOTES 0');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(false);
            const stmt = result.value.statement as LetStatement;
            expect(stmt.toString()).toBe('LET x% = NOTES 0');
        });

        it('should parse LOCAL statement', () =>
        {
            const result = parser.parseLine(1, 'LOCAL temp# = 3.14');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(LocalStatement);
            
            const stmt = result.value.statement as LocalStatement;
            expect(stmt.variableName).toBe('temp#');
        });

        it('should parse DIM statement', () =>
        {
            const result = parser.parseLine(1, 'DIM numbers%[10]');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(DimStatement);
            
            const stmt = result.value.statement as DimStatement;
            expect(stmt.arrayName).toBe('numbers%[]');
            expect(stmt.dimensions.length).toBe(1);
        });

        it('should parse DIM with multiple dimensions', () =>
        {
            const result = parser.parseLine(1, 'DIM matrix#[5, 10]');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(DimStatement);
            
            const stmt = result.value.statement as DimStatement;
            expect(stmt.dimensions.length).toBe(2);
        });

        it('should parse LET with bracket assignment (1D and 2D)', () =>
        {
            const oneD = parser.parseLine(1, 'LET a%[5] = 100');
            expect(oneD.success).toBe(true);
            if (!oneD.success) { return; }
            expect(oneD.value.hasError).toBe(false);

            const twoD = parser.parseLine(1, 'LET m#[1, 2] = 4.5');
            expect(twoD.success).toBe(true);
            if (!twoD.success) { return; }
            expect(twoD.value.hasError).toBe(false);

            const structMember = parser.parseLine(1, 'LET player.score% = 100');
            expect(structMember.success).toBe(true);
            if (!structMember.success) { return; }
            expect(structMember.value.hasError).toBe(false);
        });
    });

    describe('Control Flow Statements', () =>
    {
        it('should parse IF statement', () =>
        {
            const result = parser.parseLine(1, 'IF x% > 0 THEN');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(IfStatement);
        });

        it('should parse GOTO statement', () =>
        {
            const result = parser.parseLine(1, 'GOTO MainLoop');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(GotoStatement);
            
            const stmt = result.value.statement as GotoStatement;
            expect(stmt.labelName).toBe('MainLoop');
        });

        it('should parse LABEL statement', () =>
        {
            const result = parser.parseLine(1, 'LABEL MainLoop');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(LabelStatement);
            
            const stmt = result.value.statement as LabelStatement;
            expect(stmt.labelName).toBe('MainLoop');
        });

        it('should parse FOR statement', () =>
        {
            const result = parser.parseLine(1, 'FOR i% = 1 TO 10');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ForStatement);
            
            const stmt = result.value.statement as ForStatement;
            expect(stmt.variableName).toBe('i%');
        });

        it('should parse FOR statement with STEP', () =>
        {
            const result = parser.parseLine(1, 'FOR i% = 0 TO 100 STEP 10');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ForStatement);
            
            const stmt = result.value.statement as ForStatement;
            expect(stmt.stepValue).not.toBeNull();
        });

        it('should parse WHILE statement', () =>
        {
            const result = parser.parseLine(1, 'WHILE count% < 10');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(WhileStatement);
        });

        it('should parse END statement', () =>
        {
            const result = parser.parseLine(1, 'END');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(EndStatement);
            
            const stmt = result.value.statement as EndStatement;
            expect(stmt.endType).toBe(EndType.Program);
        });

        it('should parse END IF statement', () =>
        {
            const result = parser.parseLine(1, 'END IF');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(EndStatement);
            
            const stmt = result.value.statement as EndStatement;
            expect(stmt.endType).toBe(EndType.If);
        });

        it('should parse END UNLESS statement', () =>
        {
            const result = parser.parseLine(1, 'END UNLESS');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(EndStatement);
            
            const stmt = result.value.statement as EndStatement;
            expect(stmt.endType).toBe(EndType.Unless);
        });

        it('should parse END SELECT statement', () =>
        {
            const result = parser.parseLine(1, 'END SELECT');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(EndStatement);
            
            const stmt = result.value.statement as EndStatement;
            expect(stmt.endType).toBe(EndType.Select);
        });

        it('should parse END SUB statement', () =>
        {
            const result = parser.parseLine(1, 'END SUB');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(EndStatement);
            
            const stmt = result.value.statement as EndStatement;
            expect(stmt.endType).toBe(EndType.Sub);
        });

        it('should parse END TRY statement', () =>
        {
            const result = parser.parseLine(1, 'END TRY');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(EndStatement);
            
            const stmt = result.value.statement as EndStatement;
            expect(stmt.endType).toBe(EndType.Try);
        });
    });

    describe('I/O Statements', () =>
    {
        it('should parse PRINT with single expression', () =>
        {
            const result = parser.parseLine(1, 'PRINT 42');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PrintStatement);
            
            const stmt = result.value.statement as PrintStatement;
            expect(stmt.expressions.length).toBe(1);
            expect(stmt.newline).toBe(true);
        });

        it('should parse PRINT with multiple expressions', () =>
        {
            const result = parser.parseLine(1, 'PRINT "Value:", x%, "Result:", y%');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PrintStatement);
            
            const stmt = result.value.statement as PrintStatement;
            expect(stmt.expressions.length).toBe(4);
        });

        it('should parse PRINT with semicolon suppressing newline', () =>
        {
            const result = parser.parseLine(1, 'PRINT "Hello";');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PrintStatement);
            
            const stmt = result.value.statement as PrintStatement;
            expect(stmt.newline).toBe(false);
        });

        it('should parse PRINT with parenthesized expression', () =>
        {
            const result = parser.parseLine(1, 'PRINT (1 + 2)');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PrintStatement);
            
            const stmt = result.value.statement as PrintStatement;
            expect(stmt.expressions.length).toBe(1);
            expect(stmt.newline).toBe(true);
        });

        it('should parse PRINT with nested parentheses', () =>
        {
            const result = parser.parseLine(1, 'PRINT ((1 + 2) * 3)');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PrintStatement);
            
            const stmt = result.value.statement as PrintStatement;
            expect(stmt.expressions.length).toBe(1);
        });

        it('should parse PRINT with multiple parenthesized expressions', () =>
        {
            const result = parser.parseLine(1, 'PRINT (1 + 2), (3 * 4), (5 - 6)');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PrintStatement);
            
            const stmt = result.value.statement as PrintStatement;
            expect(stmt.expressions.length).toBe(3);
        });

        it('should parse PRINT with complex expression containing parentheses', () =>
        {
            const result = parser.parseLine(1, 'PRINT (a% + b%) * (c% - d%)');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PrintStatement);
            
            const stmt = result.value.statement as PrintStatement;
            expect(stmt.expressions.length).toBe(1);
        });

        it('should parse COLOR statement', () =>
        {
            const result = parser.parseLine(1, 'COLOR &HFF0000FF');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ColorStatement);
        });

        it('should parse COLOR with foreground and background', () =>
        {
            const result = parser.parseLine(1, 'COLOR &HFF0000FF, &H000000FF');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ColorStatement);
        });
        
        it('should parse COLOR with color name string', () =>
        {
            const result = parser.parseLine(1, 'COLOR "green"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ColorStatement);
        });
        
        it('should parse COLOR with color names for both foreground and background', () =>
        {
            const result = parser.parseLine(1, 'COLOR "blue", "white"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ColorStatement);
        });
        
        it('should parse COLOR with color name for background only', () =>
        {
            const result = parser.parseLine(1, 'COLOR , "black"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            // COLOR requires at least a foreground color, so this should have an error
            expect(result.value.hasError).toBe(true);
            expect(result.value.errorMessage).toBeDefined();
        });
        
        it('should parse COLOR with mixed integer and color name', () =>
        {
            const result = parser.parseLine(1, 'COLOR &HFF0000FF, "blue"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ColorStatement);
        });
        
        it('should parse COLOR with color name and integer', () =>
        {
            const result = parser.parseLine(1, 'COLOR "red", &H000000FF');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ColorStatement);
        });
    });

    describe('Graphics Statements', () =>
    {
        it('should parse PSET statement', () =>
        {
            const result = parser.parseLine(1, 'PSET (100, 200)');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PsetStatement);
        });

        it('should parse PSET with color', () =>
        {
            const result = parser.parseLine(1, 'PSET (100, 200) WITH &HFFFFFFFF');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PsetStatement);
            
            const stmt = result.value.statement as PsetStatement;
        });
        
        it('should parse PSET with color name string', () =>
        {
            const result = parser.parseLine(1, 'PSET (100, 200) WITH "red"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PsetStatement);
            
            const stmt = result.value.statement as PsetStatement;
            expect(stmt.color).not.toBeNull();
        });

        it('should parse LINE statement', () =>
        {
            const result = parser.parseLine(1, 'LINE FROM (0, 0) TO (100, 100)');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(LineStatement);
        });

        it('should parse LINE with color', () =>
        {
            const result = parser.parseLine(1, 'LINE FROM (0, 0) TO (100, 100) WITH &HFF0000FF');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(LineStatement);
            
            const stmt = result.value.statement as LineStatement;
            expect(stmt.color).not.toBeNull();
        });
        
        it('should parse LINE with color name string', () =>
        {
            const result = parser.parseLine(1, 'LINE FROM (0, 0) TO (100, 100) WITH "cornflowerblue"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(LineStatement);
            
            const stmt = result.value.statement as LineStatement;
            expect(stmt.color).not.toBeNull();
        });
        
        it('should parse LINE with color name string', () =>
        {
            const result = parser.parseLine(1, 'LINE FROM (0, 0) TO (100, 100) WITH "cornflowerblue"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(LineStatement);
            
            const stmt = result.value.statement as LineStatement;
            expect(stmt.color).not.toBeNull();
        });
    });

    describe('File I/O Statements', () =>
    {
        it('should parse OPEN for READ', () =>
        {
            const result = parser.parseLine(1, 'OPEN "data.txt" FOR READ AS file%');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(OpenStatement);
            
            const stmt = result.value.statement as OpenStatement;
            expect(stmt.mode).toBe(FileMode.Read);
            expect(stmt.handleVariable).toBe('file%');
        });

        it('should parse OPEN for APPEND', () =>
        {
            const result = parser.parseLine(1, 'OPEN "log.txt" FOR APPEND AS log%');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(OpenStatement);
            
            const stmt = result.value.statement as OpenStatement;
            expect(stmt.mode).toBe(FileMode.Append);
        });

        it('should parse OPEN for OVERWRITE', () =>
        {
            const result = parser.parseLine(1, 'OPEN "out.txt" FOR OVERWRITE AS out%');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(OpenStatement);
            
            const stmt = result.value.statement as OpenStatement;
            expect(stmt.mode).toBe(FileMode.Overwrite);
        });

        it('should parse CLOSE statement', () =>
        {
            const result = parser.parseLine(1, 'CLOSE file%');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(CloseStatement);
        });
    });

    describe('Audio Statements', () =>
    {
        it('should parse TEMPO statement', () =>
        {
            const result = parser.parseLine(1, 'TEMPO 120');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(TempoStatement);
            const stmt = result.value.statement as TempoStatement;
            expect(stmt.bpm).toBeInstanceOf(LiteralExpression);
            expect((stmt.bpm as LiteralExpression).value).toEqual({ type: EduBasicType.Integer, value: 120 });
        });

        it('should parse VOLUME statement', () =>
        {
            const result = parser.parseLine(1, 'VOLUME 100');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(VolumeStatement);
            const stmt = result.value.statement as VolumeStatement;
            expect(stmt.level).toBeInstanceOf(LiteralExpression);
        });

        it('should parse VOICE with instrument number', () =>
        {
            const result = parser.parseLine(1, 'VOICE 0 INSTRUMENT 56');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(VoiceStatement);
            const stmt = result.value.statement as VoiceStatement;
            expect(stmt.voiceNumber).toBeInstanceOf(LiteralExpression);
            expect((stmt.voiceNumber as LiteralExpression).value).toEqual({ type: EduBasicType.Integer, value: 0 });
            expect(stmt.instrument).toBeInstanceOf(LiteralExpression);
            expect((stmt.instrument as LiteralExpression).value).toEqual({ type: EduBasicType.Integer, value: 56 });
        });

        it('should parse VOICE with instrument name', () =>
        {
            const result = parser.parseLine(1, 'VOICE 1 INSTRUMENT "Acoustic Grand Piano"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(VoiceStatement);
            const stmt = result.value.statement as VoiceStatement;
            expect(stmt.voiceNumber).toBeInstanceOf(LiteralExpression);
            expect((stmt.voiceNumber as LiteralExpression).value).toEqual({ type: EduBasicType.Integer, value: 1 });
            expect(stmt.instrument).toBeInstanceOf(LiteralExpression);
            expect((stmt.instrument as LiteralExpression).value).toEqual({ type: EduBasicType.String, value: 'Acoustic Grand Piano' });
        });

        it('should parse PLAY statement', () =>
        {
            const result = parser.parseLine(1, 'PLAY 0, "CDEFGAB"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PlayStatement);
            const stmt = result.value.statement as PlayStatement;
            expect(stmt.voiceNumber).toBeInstanceOf(LiteralExpression);
            expect((stmt.voiceNumber as LiteralExpression).value).toEqual({ type: EduBasicType.Integer, value: 0 });
            expect(stmt.mml).toBeInstanceOf(LiteralExpression);
            expect((stmt.mml as LiteralExpression).value).toEqual({ type: EduBasicType.String, value: 'CDEFGAB' });
        });

        it('should report error when VOICE missing INSTRUMENT keyword', () =>
        {
            const result = parser.parseLine(1, 'VOICE 0 56');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(true);
        });

        it('should report error when VOICE missing instrument expression', () =>
        {
            const result = parser.parseLine(1, 'VOICE 0 INSTRUMENT');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(true);
        });
    });

    describe('Comments and Empty Lines', () =>
    {
        it('should handle empty lines', () =>
        {
            const result = parser.parseLine(1, '');
            expect(result.success).toBe(true);
            
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(false);
        });

        it('should handle comment lines', () =>
        {
            const result = parser.parseLine(1, "' This is a comment");
            expect(result.success).toBe(true);
            
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(false);
        });

        it('should handle whitespace-only lines', () =>
        {
            const result = parser.parseLine(1, '    ');
            expect(result.success).toBe(true);
            
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(false);
        });
    });

    describe('Error Handling', () =>
    {
        it('should report error for unknown keyword', () =>
        {
            const result = parser.parseLine(1, 'UNKNOWNKEYWORD x% = 5');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(true);
            expect(result.value.errorMessage).toBeDefined();
        });

        it('should report error for malformed statement', () =>
        {
            const result = parser.parseLine(1, 'LET = 5');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(true);
            expect(result.value.errorMessage).toBeDefined();
        });

        it('should report error for missing expression', () =>
        {
            const result = parser.parseLine(1, 'LET x% =');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }
            expect(result.value.hasError).toBe(true);
            expect(result.value.errorMessage).toBeDefined();
        });
    });

    describe('Parser State Management', () =>
    {
        it('should track parsed lines', () =>
        {
            parser.parseLine(1, 'LET x% = 1');
            parser.parseLine(2, 'LET y% = 2');
            
            expect(parser.parsedLines.size).toBe(2);
        });

        it('should retrieve parsed line', () =>
        {
            parser.parseLine(1, 'LET x% = 42');
            
            const parsed = parser.getParsedLine(1);
            expect(parsed).toBeDefined();
            expect(parsed?.statement).toBeInstanceOf(LetStatement);
        });

        it('should remove line', () =>
        {
            parser.parseLine(1, 'LET x% = 1');
            parser.parseLine(2, 'LET y% = 2');
            
            parser.removeLine(1);
            
            expect(parser.parsedLines.size).toBe(1);
            expect(parser.getParsedLine(1)).toBeUndefined();
        });

        it('should clear all lines', () =>
        {
            parser.parseLine(1, 'LET x% = 1');
            parser.parseLine(2, 'LET y% = 2');
            
            parser.clear();
            
            expect(parser.parsedLines.size).toBe(0);
        });

        it('should get all statements in order', () =>
        {
            parser.parseLine(3, 'LET z% = 3');
            parser.parseLine(1, 'LET x% = 1');
            parser.parseLine(2, 'LET y% = 2');
            
            const statements = parser.getAllStatements();
            
            expect(statements.length).toBe(3);
            expect((statements[0] as LetStatement).variableName).toBe('x%');
            expect((statements[1] as LetStatement).variableName).toBe('y%');
            expect((statements[2] as LetStatement).variableName).toBe('z%');
        });
    });

    describe('Indent Management', () =>
    {
        it('should start with indent level 0', () =>
        {
            expect(parser.currentIndentLevel).toBe(0);
        });

        it('should set indent level', () =>
        {
            parser.currentIndentLevel = 2;
            
            expect(parser.currentIndentLevel).toBe(2);
        });

        it('should increase indent level', () =>
        {
            parser.increaseIndent();
            
            expect(parser.currentIndentLevel).toBe(1);
        });

        it('should decrease indent level', () =>
        {
            parser.currentIndentLevel = 3;
            parser.decreaseIndent();
            
            expect(parser.currentIndentLevel).toBe(2);
        });

        it('should not decrease indent below zero', () =>
        {
            parser.decreaseIndent();
            
            expect(parser.currentIndentLevel).toBe(0);
        });
    });
});

