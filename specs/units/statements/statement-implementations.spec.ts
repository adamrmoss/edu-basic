import { ExecutionContext } from '@/lang/execution-context';
import { Program } from '@/lang/program';
import { RuntimeExecution } from '@/lang/runtime-execution';
import { ExecutionResult } from '@/lang/statements/statement';
import { EduBasicType, EduBasicValue } from '@/lang/edu-basic-value';

import { ClsStatement, ColorStatement, LocateStatement, PrintStatement } from '@/lang/statements/io';
import {
    ArcStatement,
    CircleStatement,
    LineStatement,
    OvalStatement,
    PsetStatement,
    RectangleStatement,
    TriangleStatement
} from '@/lang/statements/graphics';
import { PopStatement, PushStatement, ShiftStatement, UnshiftStatement } from '@/lang/statements/array';
import { DimStatement, LetBracketStatement, LetStatement } from '@/lang/statements/variables';
import { RandomizeStatement } from '@/lang/statements/misc';
import { PlayStatement, TempoStatement, VoiceStatement, VolumeStatement } from '@/lang/statements/audio';

import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { coerceArrayElements } from '@/lang/edu-basic-value';
import { FileSystemService } from '@/app/disk/filesystem.service';

import { MockAudio, MockGraphics, mockAudioContext } from '../mocks';

describe('Statement Implementations', () =>
{
    let context: ExecutionContext;
    let graphics: MockGraphics;
    let audio: MockAudio;
    let program: Program;
    let runtime: RuntimeExecution;
    
    beforeEach(() =>
    {
        mockAudioContext();
        context = new ExecutionContext();
        graphics = new MockGraphics();
        audio = new MockAudio();
        program = new Program();
        const fileSystem = new FileSystemService();
        runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem);
    });
    
    describe('CLS Statement', () =>
    {
        it('should clear the screen', () =>
        {
            const stmt = new ClsStatement();
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.clearCalled).toBe(true);
        });
        
        it('should have correct toString representation', () =>
        {
            const stmt = new ClsStatement();
            expect(stmt.toString()).toBe('CLS');
        });
    });
    
    describe('COLOR Statement', () =>
    {
        it('should set foreground color only', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFF0000FF })
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.trackedForegroundColor).toEqual({ r: 255, g: 0, b: 0, a: 255 });
            expect(graphics.trackedBackgroundColor).toBeNull();
        });
        
        it('should set both foreground and background colors', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFFFFFFFF }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0x000000FF })
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.trackedForegroundColor).toEqual({ r: 255, g: 255, b: 255, a: 255 });
            expect(graphics.trackedBackgroundColor).toEqual({ r: 0, g: 0, b: 0, a: 255 });
        });
        
        it('should extract RGBA components correctly from hex integer', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0x12345678 })
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.trackedForegroundColor).toEqual({ r: 0x12, g: 0x34, b: 0x56, a: 0x78 });
        });
        
        it('should accept color name strings for foreground', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.String, value: "red" })
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.trackedForegroundColor).toEqual({ r: 255, g: 0, b: 0, a: 255 });
        });
        
        it('should accept color name strings for background', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFF0000FF }),
                new LiteralExpression({ type: EduBasicType.String, value: "blue" })
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.trackedForegroundColor).toEqual({ r: 255, g: 0, b: 0, a: 255 });
            expect(graphics.trackedBackgroundColor).toEqual({ r: 0, g: 0, b: 255, a: 255 });
        });
        
        it('should accept color names case-insensitively (uppercase)', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.String, value: "RED" })
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.trackedForegroundColor).toEqual({ r: 255, g: 0, b: 0, a: 255 });
        });
        
        it('should accept color names case-insensitively (mixed case)', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.String, value: "ReD" })
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.trackedForegroundColor).toEqual({ r: 255, g: 0, b: 0, a: 255 });
        });
        
        it('should accept color names case-insensitively (lowercase)', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.String, value: "red" })
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.trackedForegroundColor).toEqual({ r: 255, g: 0, b: 0, a: 255 });
        });
        
        it('should handle various CSS color names', () =>
        {
            const testCases = [
                { name: "aliceblue", expected: { r: 240, g: 248, b: 255, a: 255 } },
                { name: "cornflowerblue", expected: { r: 100, g: 149, b: 237, a: 255 } },
                { name: "darkgreen", expected: { r: 0, g: 100, b: 0, a: 255 } },
                { name: "gold", expected: { r: 255, g: 215, b: 0, a: 255 } },
                { name: "rebeccapurple", expected: { r: 102, g: 51, b: 153, a: 255 } },
            ];
            
            for (const testCase of testCases)
            {
                const stmt = new ColorStatement(
                    new LiteralExpression({ type: EduBasicType.String, value: testCase.name })
                );
                
                stmt.execute(context, graphics, audio, program, runtime);
                
                expect(graphics.trackedForegroundColor).toEqual(testCase.expected);
            }
        });
        
        it('should handle color name aliases (gray/grey)', () =>
        {
            const grayStmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.String, value: "gray" })
            );
            grayStmt.execute(context, graphics, audio, program, runtime);
            const grayColor = graphics.trackedForegroundColor;
            
            const greyStmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.String, value: "grey" })
            );
            greyStmt.execute(context, graphics, audio, program, runtime);
            const greyColor = graphics.trackedForegroundColor;
            
            expect(grayColor).toEqual(greyColor);
            expect(grayColor).toEqual({ r: 128, g: 128, b: 128, a: 255 });
        });
        
        it('should handle color name aliases (aqua/cyan)', () =>
        {
            const aquaStmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.String, value: "aqua" })
            );
            aquaStmt.execute(context, graphics, audio, program, runtime);
            const aquaColor = graphics.trackedForegroundColor;
            
            const cyanStmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.String, value: "cyan" })
            );
            cyanStmt.execute(context, graphics, audio, program, runtime);
            const cyanColor = graphics.trackedForegroundColor;
            
            expect(aquaColor).toEqual(cyanColor);
            expect(aquaColor).toEqual({ r: 0, g: 255, b: 255, a: 255 });
        });
        
        it('should throw error for unknown color name', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.String, value: "notacolor" })
            );
            
            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('Unknown color name: notacolor');
        });
        
        it('should throw error for non-integer and non-string background', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFF0000FF }),
                new LiteralExpression({ type: EduBasicType.Real, value: 3.14 })
            );
            
            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('Color must be an integer or a color name');
        });
        
        it('should have correct toString representation with foreground only', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFF0000FF })
            );
            
            expect(stmt.toString()).toBe('COLOR 4278190335');
        });
        
        it('should have correct toString representation with both colors', () =>
        {
            const stmt = new ColorStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFF0000FF }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0x00FF00FF })
            );
            
            expect(stmt.toString()).toBe('COLOR 4278190335, 16711935');
        });
    });
    
    describe('LOCATE Statement', () =>
    {
        it('should set cursor position with integer expressions', () =>
        {
            const stmt = new LocateStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 20 })
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.cursorPosition).toEqual({ row: 10, column: 20 });
        });
        
        it('should floor real number coordinates', () =>
        {
            const stmt = new LocateStatement(
                new LiteralExpression({ type: EduBasicType.Real, value: 5.7 }),
                new LiteralExpression({ type: EduBasicType.Real, value: 12.3 })
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.cursorPosition).toEqual({ row: 5, column: 12 });
        });
        
        it('should have correct toString representation', () =>
        {
            const stmt = new LocateStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 })
            );
            
            expect(stmt.toString()).toBe('LOCATE 5, 10');
        });
    });
    
    describe('PSET Statement', () =>
    {
        it('should draw pixel without color (uses default)', () =>
        {
            const stmt = new PsetStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                null
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.pixels).toHaveLength(1);
            expect(graphics.pixels[0]).toEqual({ x: 100, y: 200, color: undefined });
        });
        
        it('should draw pixel with explicit color', () =>
        {
            const stmt = new PsetStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 75 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFF00FFAA })
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.pixels).toHaveLength(1);
            expect(graphics.pixels[0].x).toBe(50);
            expect(graphics.pixels[0].y).toBe(75);
            expect(graphics.pixels[0].color).toEqual({ r: 255, g: 0, b: 255, a: 170 });
        });
        
        it('should extract RGBA components correctly from hex integer', () =>
        {
            const colorValue = 0x12345678;
            const stmt = new PsetStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: colorValue })
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            const expectedR = (colorValue >> 24) & 0xFF;
            const expectedG = (colorValue >> 16) & 0xFF;
            const expectedB = (colorValue >> 8) & 0xFF;
            const expectedA = colorValue & 0xFF;
            
            expect(graphics.pixels[0].color).toEqual({
                r: expectedR,
                g: expectedG,
                b: expectedB,
                a: expectedA
            });
        });
        
        it('should have correct toString representation', () =>
        {
            const stmt = new PsetStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 20 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFF0000FF })
            );
            
            expect(stmt.toString()).toBe('PSET (10, 20) WITH 4278190335');
        });
        
        it('should accept color name strings with WITH clause', () =>
        {
            const stmt = new PsetStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 75 }),
                new LiteralExpression({ type: EduBasicType.String, value: "blue" })
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.pixels[0].color).toEqual({ r: 0, g: 0, b: 255, a: 255 });
        });
        
        it('should accept color names case-insensitively in graphics statements', () =>
        {
            const testCases = [
                { name: "RED", expected: { r: 255, g: 0, b: 0, a: 255 } },
                { name: "Green", expected: { r: 0, g: 128, b: 0, a: 255 } },
                { name: "blue", expected: { r: 0, g: 0, b: 255, a: 255 } },
            ];
            
            for (const testCase of testCases)
            {
                const stmt = new PsetStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                    new LiteralExpression({ type: EduBasicType.String, value: testCase.name })
                );
                
                graphics.pixels = [];
                stmt.execute(context, graphics, audio, program, runtime);
                
                expect(graphics.pixels[0].color).toEqual(testCase.expected);
            }
        });
    });
    
    describe('LINE Statement', () =>
    {
        it('should draw line without color', () =>
        {
            const stmt = new LineStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 20 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                null
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.lines).toHaveLength(1);
            expect(graphics.lines[0]).toEqual({
                x1: 10,
                y1: 20,
                x2: 100,
                y2: 200,
                color: undefined
            });
        });
        
        it('should draw line with explicit color', () =>
        {
            const stmt = new LineStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0x00FF00FF })
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.lines[0].color).toEqual({ r: 0, g: 255, b: 0, a: 255 });
        });
        
        it('should accept color name strings with WITH clause', () =>
        {
            const stmt = new LineStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.String, value: "cornflowerblue" })
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.lines[0].color).toEqual({ r: 100, g: 149, b: 237, a: 255 });
        });
    });
    
    describe('RECTANGLE Statement', () =>
    {
        it('should draw outline rectangle', () =>
        {
            const stmt = new RectangleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 20 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 80 }),
                null,
                false
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.rectangles).toHaveLength(1);
            expect(graphics.rectangles[0].x).toBe(10);
            expect(graphics.rectangles[0].y).toBe(20);
            expect(graphics.rectangles[0].width).toBe(40);
            expect(graphics.rectangles[0].height).toBe(60);
            expect(graphics.rectangles[0].filled).toBe(false);
        });
        
        it('should draw filled rectangle with color', () =>
        {
            const stmt = new RectangleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFF0000FF }),
                true
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.rectangles[0].filled).toBe(true);
            expect(graphics.rectangles[0].color).toEqual({ r: 255, g: 0, b: 0, a: 255 });
        });
        
        it('should handle rectangles with reversed coordinates', () =>
        {
            const stmt = new RectangleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                null,
                false
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.rectangles[0].x).toBe(50);
            expect(graphics.rectangles[0].y).toBe(50);
            expect(graphics.rectangles[0].width).toBe(50);
            expect(graphics.rectangles[0].height).toBe(50);
        });
        
        it('should accept color name strings with WITH clause', () =>
        {
            const stmt = new RectangleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 20 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 80 }),
                new LiteralExpression({ type: EduBasicType.String, value: "gold" }),
                true
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.rectangles[0].color).toEqual({ r: 255, g: 215, b: 0, a: 255 });
        });
    });
    
    describe('OVAL Statement', () =>
    {
        it('should draw oval', () =>
        {
            const stmt = new OvalStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 30 }),
                null,
                false
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.ovals).toHaveLength(1);
            expect(graphics.ovals[0].x).toBe(50);
            expect(graphics.ovals[0].y).toBe(70);
            expect(graphics.ovals[0].width).toBe(100);
            expect(graphics.ovals[0].height).toBe(60);
            expect(graphics.ovals[0].filled).toBe(false);
        });
        
        it('should draw filled oval with color', () =>
        {
            const stmt = new OvalStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 150 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 40 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 60 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0x0000FFFF }),
                true
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.ovals[0].filled).toBe(true);
            expect(graphics.ovals[0].color).toEqual({ r: 0, g: 0, b: 255, a: 255 });
        });
        
        it('should accept color name strings with WITH clause', () =>
        {
            const stmt = new OvalStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 30 }),
                new LiteralExpression({ type: EduBasicType.String, value: "darkgreen" }),
                true
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.ovals[0].color).toEqual({ r: 0, g: 100, b: 0, a: 255 });
        });
    });
    
    describe('CIRCLE Statement', () =>
    {
        it('should draw circle outline', () =>
        {
            const stmt = new CircleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                null,
                false
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.circles).toHaveLength(1);
            expect(graphics.circles[0]).toMatchObject({
                x: 100,
                y: 100,
                radius: 50,
                filled: false
            });
        });
        
        it('should draw filled circle with color', () =>
        {
            const stmt = new CircleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 75 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFFFF00FF }),
                true
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.circles[0].filled).toBe(true);
            expect(graphics.circles[0].color).toEqual({ r: 255, g: 255, b: 0, a: 255 });
        });
        
        it('should accept color name strings with WITH clause', () =>
        {
            const stmt = new CircleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.String, value: "rebeccapurple" }),
                true
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.circles[0].color).toEqual({ r: 102, g: 51, b: 153, a: 255 });
        });
    });
    
    describe('TRIANGLE Statement', () =>
    {
        it('should draw triangle outline', () =>
        {
            const stmt = new TriangleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 90 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
                null,
                false
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.triangles).toHaveLength(1);
            expect(graphics.triangles[0]).toMatchObject({
                x1: 10,
                y1: 10,
                x2: 50,
                y2: 100,
                x3: 90,
                y3: 10,
                filled: false
            });
        });
        
        it('should draw filled triangle with color', () =>
        {
            const stmt = new TriangleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFF00FFFF }),
                true
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.triangles[0].filled).toBe(true);
            expect(graphics.triangles[0].color).toEqual({ r: 255, g: 0, b: 255, a: 255 });
        });
        
        it('should accept color name strings with WITH clause', () =>
        {
            const stmt = new TriangleStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.String, value: "hotpink" }),
                true
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.triangles[0].color).toEqual({ r: 255, g: 105, b: 180, a: 255 });
        });
    });
    
    describe('ARC Statement', () =>
    {
        it('should draw arc', () =>
        {
            const stmt = new ArcStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 100 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 50 }),
                new LiteralExpression({ type: EduBasicType.Real, value: 0 }),
                new LiteralExpression({ type: EduBasicType.Real, value: 3.14159 }),
                null
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.arcs).toHaveLength(1);
            expect(graphics.arcs[0]).toMatchObject({
                x: 100,
                y: 100,
                radius: 50,
                startAngle: 0,
                endAngle: 3.14159
            });
        });
        
        it('should draw arc with color', () =>
        {
            const stmt = new ArcStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 30 }),
                new LiteralExpression({ type: EduBasicType.Real, value: 1.57 }),
                new LiteralExpression({ type: EduBasicType.Real, value: 4.71 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 0xFFFFFFFF })
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.arcs[0].color).toEqual({ r: 255, g: 255, b: 255, a: 255 });
        });
        
        it('should accept color name strings with WITH clause', () =>
        {
            const stmt = new ArcStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 200 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 30 }),
                new LiteralExpression({ type: EduBasicType.Real, value: 1.57 }),
                new LiteralExpression({ type: EduBasicType.Real, value: 4.71 }),
                new LiteralExpression({ type: EduBasicType.String, value: "limegreen" })
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            expect(graphics.arcs[0].color).toEqual({ r: 50, g: 205, b: 50, a: 255 });
        });
    });
    
    describe('Array Manipulation Statements', () =>
    {
        describe('PUSH Statement', () =>
        {
            it('should add element to end of array', () =>
            {
                context.setVariable('arr%[]', { type: EduBasicType.Array, value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 }
                ], elementType: EduBasicType.Integer });
                
                const stmt = new PushStatement(
                    'arr%[]',
                    new LiteralExpression({ type: EduBasicType.Integer, value: 3 })
                );
                
                const result = stmt.execute(context, graphics, audio, program, runtime);
                
                expect(result.result).toBe(ExecutionResult.Continue);
                const arr = context.getVariable('arr%[]');
                expect(arr.type).toBe(EduBasicType.Array);
                expect((arr.value as any[]).length).toBe(3);
                expect((arr.value as any[])[2]).toEqual({ type: EduBasicType.Integer, value: 3 });
            });
            
            it('should throw error if variable is not an array', () =>
            {
                context.setVariable('x%', { type: EduBasicType.Integer, value: 5 });
                
                const stmt = new PushStatement(
                    'x%',
                    new LiteralExpression({ type: EduBasicType.Integer, value: 10 })
                );
                
                expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('PUSH: x% is not an array');
            });
        });
        
        describe('POP Statement', () =>
        {
            it('should remove element from end of array', () =>
            {
                context.setVariable('arr%[]', { type: EduBasicType.Array, value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 3 }
                ], elementType: EduBasicType.Integer });
                
                const stmt = new PopStatement('arr%[]', 'result%');
                const result = stmt.execute(context, graphics, audio, program, runtime);
                
                expect(result.result).toBe(ExecutionResult.Continue);
                const arr = context.getVariable('arr%[]');
                expect((arr.value as any[]).length).toBe(2);
                
                const resultVar = context.getVariable('result%');
                expect(resultVar).toEqual({ type: EduBasicType.Integer, value: 3 });
            });
            
            it('should pop without storing if no target variable', () =>
            {
                context.setVariable('arr%[]', { type: EduBasicType.Array, value: [
                    { type: EduBasicType.Integer, value: 1 }
                ], elementType: EduBasicType.Integer });
                
                const stmt = new PopStatement('arr%[]', null);
                stmt.execute(context, graphics, audio, program, runtime);
                
                const arr = context.getVariable('arr%[]');
                expect((arr.value as any[]).length).toBe(0);
            });
            
            it('should throw error if array is empty', () =>
            {
                context.setVariable('arr%[]', { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer });
                
                const stmt = new PopStatement('arr%[]', null);
                
                expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('POP: arr%[] is empty');
            });
            
            it('should throw error if variable is not an array', () =>
            {
                context.setVariable('x%', { type: EduBasicType.Integer, value: 5 });
                
                const stmt = new PopStatement('x%', null);
                
                expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('POP: x% is not an array');
            });
        });
        
        describe('SHIFT Statement', () =>
        {
            it('should remove element from beginning of array', () =>
            {
                context.setVariable('arr$[]', { type: EduBasicType.Array, value: [
                    { type: EduBasicType.String, value: 'first' },
                    { type: EduBasicType.String, value: 'second' },
                    { type: EduBasicType.String, value: 'third' }
                ], elementType: EduBasicType.String });
                
                const stmt = new ShiftStatement('arr$[]', 'result$');
                const result = stmt.execute(context, graphics, audio, program, runtime);
                
                expect(result.result).toBe(ExecutionResult.Continue);
                const arr = context.getVariable('arr$[]');
                expect((arr.value as any[]).length).toBe(2);
                expect((arr.value as any[])[0]).toEqual({ type: EduBasicType.String, value: 'second' });
                
                const resultVar = context.getVariable('result$');
                expect(resultVar).toEqual({ type: EduBasicType.String, value: 'first' });
            });
            
            it('should throw error if array is empty', () =>
            {
                context.setVariable('arr%[]', { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer });
                
                const stmt = new ShiftStatement('arr%[]', null);
                
                expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('SHIFT: arr%[] is empty');
            });

            it('should shift without storing when no target variable', () =>
            {
                context.setVariable('arr%[]', {
                    type: EduBasicType.Array,
                    value: [
                        { type: EduBasicType.Integer, value: 1 },
                        { type: EduBasicType.Integer, value: 2 }
                    ],
                    elementType: EduBasicType.Integer
                });

                context.setVariable('result%', { type: EduBasicType.Integer, value: 999 });

                const stmt = new ShiftStatement('arr%[]', null);
                const result = stmt.execute(context, graphics, audio, program, runtime);

                expect(result.result).toBe(ExecutionResult.Continue);
                expect(context.getVariable('result%')).toEqual({ type: EduBasicType.Integer, value: 999 });

                const arr = context.getVariable('arr%[]');
                expect((arr.value as any[]).length).toBe(1);
                expect((arr.value as any[])[0]).toEqual({ type: EduBasicType.Integer, value: 2 });
            });

            it('should throw error if variable is not an array', () =>
            {
                context.setVariable('x%', { type: EduBasicType.Integer, value: 5 });

                const stmt = new ShiftStatement('x%', null);

                expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('SHIFT: x% is not an array');
            });

            it('should format toString correctly', () =>
            {
                const withTarget = new ShiftStatement('arr%[]', 'result%');
                expect(withTarget.toString()).toBe('SHIFT arr%[] INTO result%');

                const withoutTarget = new ShiftStatement('arr%[]', null);
                expect(withoutTarget.toString()).toBe('SHIFT arr%[]');
            });
        });
        
        describe('UNSHIFT Statement', () =>
        {
            it('should add element to beginning of array', () =>
            {
                context.setVariable('arr%[]', { type: EduBasicType.Array, value: [
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 3 }
                ], elementType: EduBasicType.Integer });
                
                const stmt = new UnshiftStatement(
                    'arr%[]',
                    new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
                );
                
                const result = stmt.execute(context, graphics, audio, program, runtime);
                
                expect(result.result).toBe(ExecutionResult.Continue);
                const arr = context.getVariable('arr%[]');
                expect((arr.value as any[]).length).toBe(3);
                expect((arr.value as any[])[0]).toEqual({ type: EduBasicType.Integer, value: 1 });
            });
            
            it('should throw error if variable is not an array', () =>
            {
                context.setVariable('x%', { type: EduBasicType.Integer, value: 5 });
                
                const stmt = new UnshiftStatement(
                    'x%',
                    new LiteralExpression({ type: EduBasicType.Integer, value: 10 })
                );
                
                expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('UNSHIFT: x% is not an array');
            });
        });
    });
    
    describe('DIM Statement', () =>
    {
        it('should create 1D array with specified size', () =>
        {
            const stmt = new DimStatement(
                'arr%[]',
                [{ type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 5 }) }]
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            const arr = context.getVariable('arr%[]');
            expect(arr.type).toBe(EduBasicType.Array);
            if (arr.type !== EduBasicType.Array) { throw new Error('Expected array'); }
            expect(arr.elementType).toBe(EduBasicType.Integer);
            expect((arr.value as any[]).length).toBe(5);
            expect(arr.dimensions).toEqual([{ lower: 1, length: 5, stride: 1 }]);
        });
        
        it('should create 2D array', () =>
        {
            const stmt = new DimStatement(
                'matrix%[,]',
                [
                    { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 3 }) },
                    { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 4 }) }
                ]
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            const arr = context.getVariable('matrix%[,]');
            if (arr.type !== EduBasicType.Array) { throw new Error('Expected array'); }
            expect(arr.dimensions).toEqual([
                { lower: 1, length: 3, stride: 4 },
                { lower: 1, length: 4, stride: 1 }
            ]);
            expect((arr.value as any[]).length).toBe(12);
        });
        
        it('should create 3D array', () =>
        {
            const stmt = new DimStatement(
                'cube%[,,]',
                [
                    { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 2 }) },
                    { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 3 }) },
                    { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 4 }) }
                ]
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            const arr = context.getVariable('cube%[,,]');
            if (arr.type !== EduBasicType.Array) { throw new Error('Expected array'); }
            expect(arr.dimensions).toEqual([
                { lower: 1, length: 2, stride: 12 },
                { lower: 1, length: 3, stride: 4 },
                { lower: 1, length: 4, stride: 1 }
            ]);
            expect((arr.value as any[]).length).toBe(24);
        });
        
        it('should throw error for negative dimensions', () =>
        {
            const stmt = new DimStatement(
                'arr%[]',
                [{ type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: -5 }) }]
            );
            
            expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('DIM: Array dimension cannot be negative');
        });
        
        it('should floor real number dimensions', () =>
        {
            const stmt = new DimStatement(
                'arr%[]',
                [{ type: 'size', size: new LiteralExpression({ type: EduBasicType.Real, value: 5.9 }) }]
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            const arr = context.getVariable('arr%[]');
            expect((arr.value as any[]).length).toBe(5);
        });

        it('should create an empty array when no dimensions are provided', () =>
        {
            const stmt = new DimStatement('empty%[]', []);
            const result = stmt.execute(context, graphics, audio, program, runtime);

            expect(result.result).toBe(ExecutionResult.Continue);
            const arr = context.getVariable('empty%[]');
            expect(arr.type).toBe(EduBasicType.Array);
            expect((arr.value as any[]).length).toBe(0);
        });

        it('should format toString correctly', () =>
        {
            const stmt = new DimStatement('arr%[,]', [
                { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 2 }) },
                { type: 'size', size: new LiteralExpression({ type: EduBasicType.Real, value: 3.5 }) }
            ]);

            expect(stmt.toString()).toBe('DIM arr%[,][2, 3.5]');
        });

        it('should create a ranged array with explicit bounds', () =>
        {
            const stmt = new DimStatement('r%[]', [
                { type: 'range', start: new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), end: new LiteralExpression({ type: EduBasicType.Integer, value: 11 }) }
            ]);

            stmt.execute(context, graphics, audio, program, runtime);

            const arr = context.getVariable('r%[]');
            if (arr.type !== EduBasicType.Array) { throw new Error('Expected array'); }
            expect(arr.dimensions).toEqual([{ lower: 0, length: 12, stride: 1 }]);
            expect((arr.value as any[]).length).toBe(12);
        });
    });
    
    describe('RANDOMIZE Statement', () =>
    {
        it('should seed random number generator with explicit seed', () =>
        {
            const stmt = new RandomizeStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 12345 }));
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
        });
        
        it('should seed with current time when no seed provided', () =>
        {
            const stmt = new RandomizeStatement(null);
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
        });
        
        it('should have correct toString representation', () =>
        {
            const stmt1 = new RandomizeStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));
            expect(stmt1.toString()).toBe('RANDOMIZE 42');
            
            const stmt2 = new RandomizeStatement(null);
            expect(stmt2.toString()).toBe('RANDOMIZE');
        });

        it('should validate seed type at runtime', () =>
        {
            const stmt = new RandomizeStatement(new LiteralExpression({ type: EduBasicType.String, value: 'nope' }));
            expect(() =>
            {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('RANDOMIZE: seed must be a number');
        });
    });
    
    describe('Audio Statements', () =>
    {
        describe('TEMPO Statement', () =>
        {
            it('should set tempo', () =>
            {
                const stmt = new TempoStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 120 })
                );
                
                const result = stmt.execute(context, graphics, audio, program, runtime);
                
                expect(result.result).toBe(ExecutionResult.Continue);
                expect(audio.trackedTempo).toBe(120);
            });
            
            it('should handle real number tempo', () =>
            {
                const stmt = new TempoStatement(
                    new LiteralExpression({ type: EduBasicType.Real, value: 95.5 })
                );
                
                stmt.execute(context, graphics, audio, program, runtime);
                
                expect(audio.trackedTempo).toBe(95.5);
            });
        });
        
        describe('VOLUME Statement', () =>
        {
            it('should set volume', () =>
            {
                const stmt = new VolumeStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 75 })
                );
                
                const result = stmt.execute(context, graphics, audio, program, runtime);
                
                expect(result.result).toBe(ExecutionResult.Continue);
                expect(audio.trackedVolume).toBe(75);
            });
            
            it('should handle real number volume', () =>
            {
                const stmt = new VolumeStatement(
                    new LiteralExpression({ type: EduBasicType.Real, value: 50.5 })
                );
                
                stmt.execute(context, graphics, audio, program, runtime);
                
                expect(audio.trackedVolume).toBe(50.5);
            });
        });
        
        describe('VOICE Statement', () =>
        {
            it('should set voice and instrument', () =>
            {
                const stmt = new VoiceStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 0 })
                );
                
                const result = stmt.execute(context, graphics, audio, program, runtime);
                
                expect(result.result).toBe(ExecutionResult.Continue);
                expect(audio.voice).toBe(2);
            });
            
            it('should floor real number voice index', () =>
            {
                const stmt = new VoiceStatement(
                    new LiteralExpression({ type: EduBasicType.Real, value: 3.7 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 0 })
                );

                stmt.execute(context, graphics, audio, program, runtime);

                expect(audio.voice).toBe(3);
            });

            it('should call setVoiceInstrument with program number', () =>
            {
                const stmt = new VoiceStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 56 })
                );

                stmt.execute(context, graphics, audio, program, runtime);

                expect(audio.instrumentCalls).toHaveLength(1);
                expect(audio.instrumentCalls[0].voiceIndex).toBe(2);
                expect(audio.instrumentCalls[0].program).toBe(56);
            });

            it('should call setVoiceInstrumentByName with string instrument', () =>
            {
                const stmt = new VoiceStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                    new LiteralExpression({ type: EduBasicType.String, value: 'Acoustic Grand Piano' })
                );

                stmt.execute(context, graphics, audio, program, runtime);

                expect(audio.instrumentByNameCalls).toHaveLength(1);
                expect(audio.instrumentByNameCalls[0].voiceIndex).toBe(0);
                expect(audio.instrumentByNameCalls[0].name).toBe('Acoustic Grand Piano');
            });
        });
        
        describe('PLAY Statement', () =>
        {
            it('should play MML sequence', () =>
            {
                const stmt = new PlayStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                    new LiteralExpression({ type: EduBasicType.String, value: 'CDEFGAB' })
                );
                
                const result = stmt.execute(context, graphics, audio, program, runtime);

                expect(result.result).toBe(ExecutionResult.Continue);
                expect(audio.sequences).toHaveLength(1);
                expect(audio.sequences[0].voiceIndex).toBe(0);
                expect(audio.sequences[0].mml).toBe('CDEFGAB');
            });

            it('should handle complex MML sequences', () =>
            {
                const stmt = new PlayStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                    new LiteralExpression({ type: EduBasicType.String, value: 'O4 L4 C D E F G A B O5 C' })
                );

                stmt.execute(context, graphics, audio, program, runtime);

                expect(audio.sequences).toHaveLength(1);
                expect(audio.sequences[0].voiceIndex).toBe(1);
                expect(audio.sequences[0].mml).toBe('O4 L4 C D E F G A B O5 C');
            });

            it('should default voice to 0 and MML to empty string for non-numeric / non-string expressions', () =>
            {
                const stmt = new PlayStatement(
                    new LiteralExpression({ type: EduBasicType.String, value: 'not-a-number' }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 123 })
                );

                stmt.execute(context, graphics, audio, program, runtime);

                expect(audio.sequences).toHaveLength(1);
                expect(audio.sequences[0].voiceIndex).toBe(0);
                expect(audio.sequences[0].mml).toBe('');
            });

            it('should floor real voice numbers', () =>
            {
                const stmt = new PlayStatement(
                    new LiteralExpression({ type: EduBasicType.Real, value: 1.9 }),
                    new LiteralExpression({ type: EduBasicType.String, value: 'C' })
                );

                stmt.execute(context, graphics, audio, program, runtime);

                expect(audio.sequences).toHaveLength(1);
                expect(audio.sequences[0].voiceIndex).toBe(1);
                expect(audio.sequences[0].mml).toBe('C');
            });
        });

        describe('Audio statement toString', () =>
        {
            it('should format TEMPO correctly', () =>
            {
                const stmt = new TempoStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 120 }));
                expect(stmt.toString()).toBe('TEMPO 120');
            });

            it('should format VOLUME correctly', () =>
            {
                const stmt = new VolumeStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 80 }));
                expect(stmt.toString()).toBe('VOLUME 80');
            });

            it('should format VOICE with instrument number correctly', () =>
            {
                const stmt = new VoiceStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 56 })
                );
                expect(stmt.toString()).toBe('VOICE 0 INSTRUMENT 56');
            });

            it('should format VOICE with instrument name correctly', () =>
            {
                const stmt = new VoiceStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                    new LiteralExpression({ type: EduBasicType.String, value: 'Violin' })
                );
                expect(stmt.toString()).toBe('VOICE 1 INSTRUMENT "Violin"');
            });

            it('should format PLAY correctly', () =>
            {
                const stmt = new PlayStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                    new LiteralExpression({ type: EduBasicType.String, value: 'CDEFGAB' })
                );
                expect(stmt.toString()).toBe('PLAY 0, "CDEFGAB"');
            });
        });
    });
    
    describe('PRINT Statement', () =>
    {
        beforeEach(() =>
        {
            graphics.printedText = [];
            graphics.newLineCount = 0;
        });
        
        it('should print single string expression', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'Hello' })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('Hello');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print single integer expression', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.Integer, value: 42 })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('42');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print single real expression', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.Real, value: 3.14 })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('3.14');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print single complex expression', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('3+4i');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print multiple expressions with no spacing (comma-separated)', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'Name: ' }),
                new LiteralExpression({ type: EduBasicType.String, value: 'Alice' }),
                new LiteralExpression({ type: EduBasicType.String, value: ' Age: ' }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 25 })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('Name: Alice Age: 25');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print mixed types (string, integer, real, complex)', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'Item: ' }),
                new LiteralExpression({ type: EduBasicType.String, value: 'Widget' }),
                new LiteralExpression({ type: EduBasicType.String, value: ' Count: ' }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
                new LiteralExpression({ type: EduBasicType.String, value: ' Price: ' }),
                new LiteralExpression({ type: EduBasicType.Real, value: 19.99 }),
                new LiteralExpression({ type: EduBasicType.String, value: ' Complex: ' }),
                new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('Item: Widget Count: 10 Price: 19.99 Complex: 3+4i');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should not add newline when semicolon at end', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'Enter name: ' })
            ], false);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('Enter name: ');
            expect(graphics.newLineCount).toBe(0);
        });
        
        it('should print empty PRINT as blank line', () =>
        {
            const stmt = new PrintStatement([]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should concatenate multiple items with no spacing', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'A' }),
                new LiteralExpression({ type: EduBasicType.String, value: 'B' }),
                new LiteralExpression({ type: EduBasicType.String, value: 'C' })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('ABC');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should handle negative integers', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.Integer, value: -42 })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('-42');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should handle negative reals', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.Real, value: -3.14 })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('-3.14');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should handle complex with negative imaginary part', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: -4 } })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('3-4i');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should handle zero values', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.String, value: ' ' }),
                new LiteralExpression({ type: EduBasicType.Real, value: 0.0 }),
                new LiteralExpression({ type: EduBasicType.String, value: ' ' }),
                new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('0 0 0+0i');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should handle large numbers', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.Integer, value: 123456789 }),
                new LiteralExpression({ type: EduBasicType.String, value: ' ' }),
                new LiteralExpression({ type: EduBasicType.Real, value: 123456.789 })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('123456789 123456.789');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should handle empty string', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: '' }),
                new LiteralExpression({ type: EduBasicType.String, value: 'test' }),
                new LiteralExpression({ type: EduBasicType.String, value: '' })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('test');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print array with integers', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Array,
                    value: [
                        { type: EduBasicType.Integer, value: 1 },
                        { type: EduBasicType.Integer, value: 2 },
                        { type: EduBasicType.Integer, value: 3 }
                    ],
                    elementType: EduBasicType.Integer
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('[1, 2, 3]');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print empty array', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Array,
                    value: [],
                    elementType: EduBasicType.Integer
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('[]');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print array with mixed types', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Array,
                    value: [
                        { type: EduBasicType.Integer, value: 1 },
                        { type: EduBasicType.String, value: 'hello' },
                        { type: EduBasicType.Real, value: 3.14 }
                    ],
                    elementType: EduBasicType.Integer
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('[1, "hello", 3.14]');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print array with complex numbers', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Array,
                    value: [
                        { type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } },
                        { type: EduBasicType.Complex, value: { real: 3, imaginary: -4 } }
                    ],
                    elementType: EduBasicType.Complex
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('[1+2i, 3-4i]');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print empty structure', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Structure,
                    value: new Map()
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('{ }');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print structure with members', () =>
        {
            const members = new Map<string, EduBasicValue>();
            members.set('name$', { type: EduBasicType.String, value: 'Alice' });
            members.set('score%', { type: EduBasicType.Integer, value: 100 });
            members.set('level%', { type: EduBasicType.Integer, value: 5 });
            
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Structure,
                    value: members
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('{ name$: "Alice", score%: 100, level%: 5 }');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print structure with nested structures', () =>
        {
            const nestedMembers = new Map<string, EduBasicValue>();
            nestedMembers.set('first$', { type: EduBasicType.String, value: 'John' });
            nestedMembers.set('last$', { type: EduBasicType.String, value: 'Doe' });
            
            const members = new Map<string, EduBasicValue>();
            members.set('name', { type: EduBasicType.Structure, value: nestedMembers });
            members.set('age%', { type: EduBasicType.Integer, value: 30 });
            
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Structure,
                    value: members
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('{ name: { first$: "John", last$: "Doe" }, age%: 30 }');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print structure with array members', () =>
        {
            const members = new Map<string, EduBasicValue>();
            members.set('name$', { type: EduBasicType.String, value: 'Alice' });
            members.set('scores%[]', {
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 100 },
                    { type: EduBasicType.Integer, value: 95 }
                ],
                elementType: EduBasicType.Integer
            });
            
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Structure,
                    value: members
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('{ name$: "Alice", scores%[]: [100, 95] }');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print array with string elements', () =>
        {
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Array,
                    value: [
                        { type: EduBasicType.String, value: 'hello' },
                        { type: EduBasicType.String, value: 'world' }
                    ],
                    elementType: EduBasicType.String
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('["hello", "world"]');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print array with structure elements', () =>
        {
            const struct1 = new Map<string, EduBasicValue>();
            struct1.set('name$', { type: EduBasicType.String, value: 'Alice' });
            struct1.set('score%', { type: EduBasicType.Integer, value: 100 });
            
            const struct2 = new Map<string, EduBasicValue>();
            struct2.set('name$', { type: EduBasicType.String, value: 'Bob' });
            struct2.set('score%', { type: EduBasicType.Integer, value: 95 });
            
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Array,
                    value: [
                        { type: EduBasicType.Structure, value: struct1 },
                        { type: EduBasicType.Structure, value: struct2 }
                    ],
                    elementType: EduBasicType.Structure
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('[{ name$: "Alice", score%: 100 }, { name$: "Bob", score%: 95 }]');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print structure with nested arrays containing strings', () =>
        {
            const members = new Map<string, EduBasicValue>();
            members.set('name$', { type: EduBasicType.String, value: 'Player' });
            members.set('items$[]', {
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.String, value: 'sword' },
                    { type: EduBasicType.String, value: 'shield' }
                ],
                elementType: EduBasicType.String
            });
            
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Structure,
                    value: members
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('{ name$: "Player", items$[]: ["sword", "shield"] }');
            expect(graphics.newLineCount).toBe(1);
        });
        
        it('should print structure with nested structures and arrays', () =>
        {
            const nestedStruct = new Map<string, EduBasicValue>();
            nestedStruct.set('first$', { type: EduBasicType.String, value: 'John' });
            nestedStruct.set('last$', { type: EduBasicType.String, value: 'Doe' });
            
            const members = new Map<string, EduBasicValue>();
            members.set('name', { type: EduBasicType.Structure, value: nestedStruct });
            members.set('scores%[]', {
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 85 },
                    { type: EduBasicType.Integer, value: 90 }
                ],
                elementType: EduBasicType.Integer
            });
            members.set('tags$[]', {
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.String, value: 'student' },
                    { type: EduBasicType.String, value: 'active' }
                ],
                elementType: EduBasicType.String
            });
            
            const stmt = new PrintStatement([
                new LiteralExpression({
                    type: EduBasicType.Structure,
                    value: members
                })
            ]);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            expect(graphics.getPrintedOutput()).toBe('{ name: { first$: "John", last$: "Doe" }, scores%[]: [85, 90], tags$[]: ["student", "active"] }');
            expect(graphics.newLineCount).toBe(2);
        });
    });
    
    describe('LET Statement', () =>
    {
        it('should throw error when assigning complex to real variable', () =>
        {
            const complexValue = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const stmt = new LetStatement('x#', complexValue);
            
            expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('Cannot assign complex number to REAL variable');
        });

        it('should throw error when assigning complex to integer variable', () =>
        {
            const complexValue = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const stmt = new LetStatement('x%', complexValue);
            
            expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('Cannot assign complex number to INTEGER variable');
        });

        it('should throw error when assigning complex array to real array', () =>
        {
            const arrayValue: EduBasicValue = {
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } },
                    { type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } }
                ],
                elementType: EduBasicType.Complex
            };
            const arrayExpr = new LiteralExpression(arrayValue);
            const stmt = new LetStatement('numbers#[]', arrayExpr);
            
            expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('Cannot assign complex array to REAL array');
        });

        it('should allow assigning complex to complex variable', () =>
        {
            const complexValue = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const stmt = new LetStatement('x&', complexValue);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            const value = context.getVariable('x&');
            expect(value.type).toBe(EduBasicType.Complex);
        });

        it('should coerce array literal elements to Real when assigning to Real array', () =>
        {
            const arrayValue = coerceArrayElements([
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Real, value: 3.14 }
            ]);
            const arrayExpr = new LiteralExpression(arrayValue);
            const stmt = new LetStatement('numbers#[]', arrayExpr);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            const arr = context.getVariable('numbers#[]');
            expect(arr.type).toBe(EduBasicType.Array);
            if (arr.type === EduBasicType.Array)
            {
                expect(arr.elementType).toBe(EduBasicType.Real);
                expect(arr.value[0].type).toBe(EduBasicType.Real);
                expect(arr.value[0].value).toBe(1);
                expect(arr.value[1].type).toBe(EduBasicType.Real);
                expect(arr.value[1].value).toBe(3.14);
            }
        });
        
        it('should coerce array literal elements to Complex when assigning to Complex array', () =>
        {
            const arrayValue = coerceArrayElements([
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Real, value: 3.14 }
            ]);
            const arrayExpr = new LiteralExpression(arrayValue);
            const stmt = new LetStatement('numbers&[]', arrayExpr);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            const arr = context.getVariable('numbers&[]');
            expect(arr.type).toBe(EduBasicType.Array);
            if (arr.type === EduBasicType.Array)
            {
                expect(arr.elementType).toBe(EduBasicType.Complex);
                expect(arr.value[0].type).toBe(EduBasicType.Complex);
                if (arr.value[0].type === EduBasicType.Complex)
                {
                    expect(arr.value[0].value.real).toBe(1);
                    expect(arr.value[0].value.imaginary).toBe(0);
                }
                expect(arr.value[1].type).toBe(EduBasicType.Complex);
                if (arr.value[1].type === EduBasicType.Complex)
                {
                    expect(arr.value[1].value.real).toBe(3.14);
                    expect(arr.value[1].value.imaginary).toBe(0);
                }
            }
        });
        
        it('should coerce array literal elements to Integer when assigning to Integer array', () =>
        {
            const arrayValue = coerceArrayElements([
                { type: EduBasicType.Integer, value: 5 },
                { type: EduBasicType.Real, value: 3.7 }
            ]);
            const arrayExpr = new LiteralExpression(arrayValue);
            const stmt = new LetStatement('numbers%[]', arrayExpr);
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            const arr = context.getVariable('numbers%[]');
            expect(arr.type).toBe(EduBasicType.Array);
            if (arr.type === EduBasicType.Array)
            {
                expect(arr.elementType).toBe(EduBasicType.Integer);
                expect(arr.value[0].type).toBe(EduBasicType.Integer);
                expect(arr.value[0].value).toBe(5);
                expect(arr.value[1].type).toBe(EduBasicType.Integer);
                expect(arr.value[1].value).toBe(3);
            }
        });
    });

    describe('LET [ ] assignment', () =>
    {
        it('should assign to a 1D typed array element and auto-grow when not dimensioned', () =>
        {
            const stmt = new LetBracketStatement(
                'a%',
                [{ type: 'indices', indices: [new LiteralExpression({ type: EduBasicType.Integer, value: 3 })] }],
                new LiteralExpression({ type: EduBasicType.Integer, value: 7 })
            );

            const result = stmt.execute(context, graphics, audio, program, runtime);
            expect(result.result).toBe(ExecutionResult.Continue);

            const arr = context.getVariable('a%[]');
            expect(arr.type).toBe(EduBasicType.Array);
            if (arr.type !== EduBasicType.Array) { throw new Error('Expected array'); }

            expect(arr.elementType).toBe(EduBasicType.Integer);
            expect(arr.value.length).toBe(3);
            expect(arr.value[2]).toEqual({ type: EduBasicType.Integer, value: 7 });
        });

        it('should assign to a structure member and coerce by sigil', () =>
        {
            const stmt = new LetBracketStatement(
                'player',
                [{ type: 'member', memberName: 'score%' }],
                new LiteralExpression({ type: EduBasicType.Real, value: 3.14 })
            );

            stmt.execute(context, graphics, audio, program, runtime);

            const player = context.getVariable('player');
            expect(player.type).toBe(EduBasicType.Structure);
            if (player.type !== EduBasicType.Structure) { throw new Error('Expected structure'); }

            const score = player.value.get('score%');
            expect(score).toEqual({ type: EduBasicType.Integer, value: 3 });
        });

        it('should assign to a 2D DIM\'d array using comma-separated indices', () =>
        {
            const dim = new DimStatement('m#[,]', [
                { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 2 }) },
                { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 3 }) }
            ]);
            dim.execute(context, graphics, audio, program, runtime);

            const set = new LetBracketStatement(
                'm#',
                [{ type: 'indices', indices: [
                    new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 2 })
                ]}],
                new LiteralExpression({ type: EduBasicType.Real, value: 4.5 })
            );

            set.execute(context, graphics, audio, program, runtime);

            const arr = context.getVariable('m#[,]');
            expect(arr.type).toBe(EduBasicType.Array);
            if (arr.type !== EduBasicType.Array) { throw new Error('Expected array'); }

            expect(arr.dimensions?.length).toBe(2);
            expect(arr.value[1]).toEqual({ type: EduBasicType.Real, value: 4.5 });
        });

        it('should throw when assigning multi-dimensional indices without DIM', () =>
        {
            const stmt = new LetBracketStatement(
                'm#',
                [{ type: 'indices', indices: [
                    new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 2 })
                ]}],
                new LiteralExpression({ type: EduBasicType.Real, value: 1.0 })
            );

            expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('requires DIM');
        });

        it('should throw on out-of-bounds assignment for DIM\'d arrays', () =>
        {
            const dim = new DimStatement('m%[,]', [
                { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 2 }) },
                { type: 'size', size: new LiteralExpression({ type: EduBasicType.Integer, value: 2 }) }
            ]);
            dim.execute(context, graphics, audio, program, runtime);

            const stmt = new LetBracketStatement(
                'm%',
                [{ type: 'indices', indices: [
                    new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
                ]}],
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
            );

            expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('out of bounds');
        });
    });
});
