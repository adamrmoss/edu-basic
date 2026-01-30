import { ParserService } from '../src/app/interpreter/parser';
import { ExpressionParserService } from '../src/app/interpreter/expression-parser.service';

import { ConsoleStatement, HelpStatement, RandomizeStatement, SetOption, SetStatement, SleepStatement } from '../src/lang/statements/misc';
import { PopStatement, PushStatement, ShiftStatement, UnshiftStatement } from '../src/lang/statements/array';
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
import { FileMode } from '../src/lang/statements/file-io/open-statement';

describe('ParserService (additional statement parsers)', () =>
{
    let parser: ParserService;

    beforeEach(() =>
    {
        const expressionParser = new ExpressionParserService();
        parser = new ParserService(expressionParser);
    });

    describe('Array Statements', () =>
    {
        it('should parse PUSH statement', () =>
        {
            const result = parser.parseLine(1, 'PUSH arr%[], 3');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PushStatement);
        });

        it('should parse POP statement without target variable', () =>
        {
            const result = parser.parseLine(1, 'POP arr%[]');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PopStatement);
        });

        it('should parse POP statement with target variable', () =>
        {
            const result = parser.parseLine(1, 'POP arr%[], result%');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(PopStatement);
        });

        it('should parse SHIFT statement without target variable', () =>
        {
            const result = parser.parseLine(1, 'SHIFT arr$[]');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ShiftStatement);
        });

        it('should parse SHIFT statement with target variable', () =>
        {
            const result = parser.parseLine(1, 'SHIFT arr$[], result$');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ShiftStatement);
        });

        it('should parse UNSHIFT statement', () =>
        {
            const result = parser.parseLine(1, 'UNSHIFT arr%[], 1');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(UnshiftStatement);
        });
    });

    describe('Misc Statements', () =>
    {
        it('should parse SLEEP statement', () =>
        {
            const result = parser.parseLine(1, 'SLEEP 1000');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(SleepStatement);
        });

        it('should parse SET LINE SPACING ON/OFF', () =>
        {
            const resultOn = parser.parseLine(1, 'SET LINE SPACING ON');
            expect(resultOn.success).toBe(true);
            if (resultOn.success)
            {
                expect(resultOn.value.hasError).toBe(false);
                expect(resultOn.value.statement).toBeInstanceOf(SetStatement);

                const stmt = resultOn.value.statement as SetStatement;
                expect(stmt.option).toBe(SetOption.LineSpacingOn);
            }

            const resultOff = parser.parseLine(2, 'SET LINE SPACING OFF');
            expect(resultOff.success).toBe(true);
            if (resultOff.success)
            {
                expect(resultOff.value.hasError).toBe(false);
                expect(resultOff.value.statement).toBeInstanceOf(SetStatement);

                const stmt = resultOff.value.statement as SetStatement;
                expect(stmt.option).toBe(SetOption.LineSpacingOff);
            }
        });

        it('should parse SET TEXT WRAP ON', () =>
        {
            const result = parser.parseLine(1, 'SET TEXT WRAP ON');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(SetStatement);

            const stmt = result.value.statement as SetStatement;
            expect(stmt.option).toBe(SetOption.TextWrapOn);
        });

        it('should parse SET AUDIO OFF', () =>
        {
            const result = parser.parseLine(1, 'SET AUDIO OFF');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(SetStatement);

            const stmt = result.value.statement as SetStatement;
            expect(stmt.option).toBe(SetOption.AudioOff);
        });

        it('should report error for unknown SET option keyword', () =>
        {
            const result = parser.parseLine(1, 'SET END');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(true);
            expect(result.value.errorMessage).toContain('Unknown SET option');
            expect(result.value.errorMessage).toContain('END');
        });

        it('should parse RANDOMIZE with and without seed expression', () =>
        {
            const noSeed = parser.parseLine(1, 'RANDOMIZE');
            expect(noSeed.success).toBe(true);
            if (noSeed.success)
            {
                expect(noSeed.value.hasError).toBe(false);
                expect(noSeed.value.statement).toBeInstanceOf(RandomizeStatement);
            }

            const withSeed = parser.parseLine(2, 'RANDOMIZE 123');
            expect(withSeed.success).toBe(true);
            if (withSeed.success)
            {
                expect(withSeed.value.hasError).toBe(false);
                expect(withSeed.value.statement).toBeInstanceOf(RandomizeStatement);

                const stmt = withSeed.value.statement as RandomizeStatement;
                expect(stmt.toString()).toBe('RANDOMIZE 123');
            }
        });

        it('should report error for malformed RANDOMIZE seed', () =>
        {
            const bad = parser.parseLine(1, 'RANDOMIZE ,');
            expect(bad.success).toBe(true);
            if (!bad.success)
            {
                return;
            }

            expect(bad.value.hasError).toBe(true);
            expect(bad.value.errorMessage).toContain('RANDOMIZE');
        });

        it('should parse HELP statement', () =>
        {
            const result = parser.parseLine(1, 'HELP PRINT');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(HelpStatement);
        });

        it('should parse CONSOLE statement', () =>
        {
            const result = parser.parseLine(1, 'CONSOLE "Hello"');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(ConsoleStatement);
        });
    });

    describe('File I/O Statements', () =>
    {
        it('should parse READ/WRITE/SEEK', () =>
        {
            const read = parser.parseLine(1, 'READ x$ FROM file%');
            expect(read.success).toBe(true);
            if (read.success)
            {
                expect(read.value.hasError).toBe(false);
                expect(read.value.statement).toBeInstanceOf(ReadFileStatement);
            }

            const write = parser.parseLine(2, 'WRITE "Hello" TO file%');
            expect(write.success).toBe(true);
            if (write.success)
            {
                expect(write.value.hasError).toBe(false);
                expect(write.value.statement).toBeInstanceOf(WriteFileStatement);
            }

            const seek = parser.parseLine(3, 'SEEK 10 IN file%');
            expect(seek.success).toBe(true);
            if (seek.success)
            {
                expect(seek.value.hasError).toBe(false);
                expect(seek.value.statement).toBeInstanceOf(SeekStatement);
            }
        });

        it('should parse READFILE/WRITEFILE', () =>
        {
            const readfile = parser.parseLine(1, 'READFILE content$ FROM "file.txt"');
            expect(readfile.success).toBe(true);
            if (readfile.success)
            {
                expect(readfile.value.hasError).toBe(false);
                expect(readfile.value.statement).toBeInstanceOf(ReadfileStatement);
            }

            const writefile = parser.parseLine(2, 'WRITEFILE "hello" TO "file.txt"');
            expect(writefile.success).toBe(true);
            if (writefile.success)
            {
                expect(writefile.value.hasError).toBe(false);
                expect(writefile.value.statement).toBeInstanceOf(WritefileStatement);
            }
        });

        it('should parse LISTDIR/MKDIR/RMDIR', () =>
        {
            const listdir = parser.parseLine(1, 'LISTDIR files$[] FROM "path"');
            expect(listdir.success).toBe(true);
            if (listdir.success)
            {
                expect(listdir.value.hasError).toBe(false);
                expect(listdir.value.statement).toBeInstanceOf(ListdirStatement);
            }

            const mkdir = parser.parseLine(2, 'MKDIR "path"');
            expect(mkdir.success).toBe(true);
            if (mkdir.success)
            {
                expect(mkdir.value.hasError).toBe(false);
                expect(mkdir.value.statement).toBeInstanceOf(MkdirStatement);
            }

            const rmdir = parser.parseLine(3, 'RMDIR "path"');
            expect(rmdir.success).toBe(true);
            if (rmdir.success)
            {
                expect(rmdir.value.hasError).toBe(false);
                expect(rmdir.value.statement).toBeInstanceOf(RmdirStatement);
            }
        });

        it('should parse COPY/MOVE/DELETE', () =>
        {
            const copy = parser.parseLine(1, 'COPY "a.txt" TO "b.txt"');
            expect(copy.success).toBe(true);
            if (copy.success)
            {
                expect(copy.value.hasError).toBe(false);
                expect(copy.value.statement).toBeInstanceOf(CopyStatement);
            }

            const move = parser.parseLine(2, 'MOVE "a.txt" TO "b.txt"');
            expect(move.success).toBe(true);
            if (move.success)
            {
                expect(move.value.hasError).toBe(false);
                expect(move.value.statement).toBeInstanceOf(MoveStatement);
            }

            const del = parser.parseLine(3, 'DELETE "a.txt"');
            expect(del.success).toBe(true);
            if (del.success)
            {
                expect(del.value.hasError).toBe(false);
                expect(del.value.statement).toBeInstanceOf(DeleteStatement);
            }
        });

        it('should report error for invalid OPEN mode keyword', () =>
        {
            // Use a real keyword that is not a valid file mode (READ/APPEND/OVERWRITE)
            const result = parser.parseLine(1, 'OPEN "x.txt" FOR EOF AS f%');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(true);
            expect(result.value.errorMessage).toContain('Invalid file mode');
        });
    });

    describe('Graphics Statements', () =>
    {
        it('should parse RECTANGLE and OVAL', () =>
        {
            const rect = parser.parseLine(1, 'RECTANGLE FROM (0, 0) TO (10, 10)');
            expect(rect.success).toBe(true);
            if (rect.success)
            {
                expect(rect.value.hasError).toBe(false);
                expect(rect.value.statement).toBeInstanceOf(RectangleStatement);
            }

            const rectFilled = parser.parseLine(2, 'RECTANGLE FROM (0, 0) TO (10, 10) WITH "red" FILLED');
            expect(rectFilled.success).toBe(true);
            if (rectFilled.success)
            {
                expect(rectFilled.value.hasError).toBe(false);
                expect(rectFilled.value.statement).toBeInstanceOf(RectangleStatement);
            }

            const ovalFilled = parser.parseLine(3, 'OVAL AT (0, 0) RADII (10, 20) FILLED');
            expect(ovalFilled.success).toBe(true);
            if (ovalFilled.success)
            {
                expect(ovalFilled.value.hasError).toBe(false);
                expect(ovalFilled.value.statement).toBeInstanceOf(OvalStatement);
            }
        });

        it('should parse CIRCLE and ARC', () =>
        {
            const circle = parser.parseLine(1, 'CIRCLE AT (0, 0) RADIUS 10');
            expect(circle.success).toBe(true);
            if (circle.success)
            {
                expect(circle.value.hasError).toBe(false);
                expect(circle.value.statement).toBeInstanceOf(CircleStatement);
            }

            const arc = parser.parseLine(2, 'ARC AT (0, 0) RADIUS 10 FROM 0 TO 1 WITH "blue"');
            expect(arc.success).toBe(true);
            if (arc.success)
            {
                expect(arc.value.hasError).toBe(false);
                expect(arc.value.statement).toBeInstanceOf(ArcStatement);
            }
        });

        it('should parse TRIANGLE (parser syntax)', () =>
        {
            const triangle = parser.parseLine(1, 'TRIANGLE (0, 0) (10, 0) (0, 10) WITH "limegreen" FILLED');
            expect(triangle.success).toBe(true);
            if (!triangle.success)
            {
                return;
            }

            expect(triangle.value.hasError).toBe(false);
            expect(triangle.value.statement).toBeInstanceOf(TriangleStatement);
        });

        it('should parse PAINT/GET/PUT/TURTLE', () =>
        {
            const paint = parser.parseLine(1, 'PAINT (1, 2) WITH "red"');
            expect(paint.success).toBe(true);
            if (paint.success)
            {
                expect(paint.value.hasError).toBe(false);
                expect(paint.value.statement).toBeInstanceOf(PaintStatement);
            }

            const get = parser.parseLine(2, 'GET sprite%[] FROM (0, 0) TO (1, 1)');
            expect(get.success).toBe(true);
            if (get.success)
            {
                expect(get.value.hasError).toBe(false);
                expect(get.value.statement).toBeInstanceOf(GetStatement);
            }

            const put = parser.parseLine(3, 'PUT sprite%[] AT (5, 6)');
            expect(put.success).toBe(true);
            if (put.success)
            {
                expect(put.value.hasError).toBe(false);
                expect(put.value.statement).toBeInstanceOf(PutStatement);
            }

            const turtle = parser.parseLine(4, 'TURTLE "FD 10 RT 90 FD 10"');
            expect(turtle.success).toBe(true);
            if (turtle.success)
            {
                expect(turtle.value.hasError).toBe(false);
                expect(turtle.value.statement).toBeInstanceOf(TurtleStatement);
            }
        });

        it('should parse LINE INPUT variant (not LINE FROM)', () =>
        {
            const result = parser.parseLine(1, 'LINE INPUT text$ FROM file%');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(false);
            expect(result.value.statement).toBeInstanceOf(LineInputStatement);
        });

        it('should report error for LINE without INPUT/FROM', () =>
        {
            const result = parser.parseLine(1, 'LINE 1');
            expect(result.success).toBe(true);
            if (!result.success)
            {
                return;
            }

            expect(result.value.hasError).toBe(true);
            expect(result.value.errorMessage).toContain('Expected INPUT or FROM after LINE');
        });
    });
});
