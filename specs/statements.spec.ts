import { ExecutionContext } from '../src/lang/execution-context';
import { Program } from '../src/lang/program';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { ExecutionResult } from '../src/lang/statements/statement';
import { EduBasicType } from '../src/lang/edu-basic-value';

import { ClsStatement } from '../src/lang/statements/io/cls-statement';
import { ColorStatement } from '../src/lang/statements/io/color-statement';
import { LocateStatement } from '../src/lang/statements/io/locate-statement';
import { PsetStatement } from '../src/lang/statements/graphics/pset-statement';
import { LineStatement } from '../src/lang/statements/graphics/line-statement';
import { RectangleStatement } from '../src/lang/statements/graphics/rectangle-statement';
import { OvalStatement } from '../src/lang/statements/graphics/oval-statement';
import { CircleStatement } from '../src/lang/statements/graphics/circle-statement';
import { TriangleStatement } from '../src/lang/statements/graphics/triangle-statement';
import { ArcStatement } from '../src/lang/statements/graphics/arc-statement';
import { PushStatement } from '../src/lang/statements/array/push-statement';
import { PopStatement } from '../src/lang/statements/array/pop-statement';
import { ShiftStatement } from '../src/lang/statements/array/shift-statement';
import { UnshiftStatement } from '../src/lang/statements/array/unshift-statement';
import { DimStatement } from '../src/lang/statements/variables/dim-statement';
import { RandomizeStatement } from '../src/lang/statements/misc/randomize-statement';
import { TempoStatement } from '../src/lang/statements/audio/tempo-statement';
import { VolumeStatement } from '../src/lang/statements/audio/volume-statement';
import { VoiceStatement } from '../src/lang/statements/audio/voice-statement';
import { PlayStatement } from '../src/lang/statements/audio/play-statement';

import { LiteralExpression } from '../src/lang/expressions/literals/literal-expression';
import { PrintStatement } from '../src/lang/statements/io/print-statement';
import { Graphics, Color } from '../src/lang/graphics';
import { Audio } from '../src/lang/audio';
import { FileSystemService } from '../src/app/files/filesystem.service';

class MockGraphics extends Graphics
{
    public clearCalled: boolean = false;
    public cursorPosition: { row: number; column: number } | null = null;
    public trackedForegroundColor: Color | null = null;
    public trackedBackgroundColor: Color | null = null;
    public pixels: Array<{ x: number; y: number; color?: Color }> = [];
    public lines: Array<{ x1: number; y1: number; x2: number; y2: number; color?: Color }> = [];
    public rectangles: Array<{ x: number; y: number; width: number; height: number; filled: boolean; color?: Color }> = [];
    public ovals: Array<{ x: number; y: number; width: number; height: number; filled: boolean; color?: Color }> = [];
    public circles: Array<{ x: number; y: number; radius: number; filled: boolean; color?: Color }> = [];
    public triangles: Array<{ x1: number; y1: number; x2: number; y2: number; x3: number; y3: number; filled: boolean; color?: Color }> = [];
    public arcs: Array<{ x: number; y: number; radius: number; startAngle: number; endAngle: number; color?: Color }> = [];
    public printedText: string[] = [];
    public newLineCount: number = 0;
    
    public override setForegroundColor(color: Color): void
    {
        super.setForegroundColor(color);
        this.trackedForegroundColor = color;
    }
    
    public override setBackgroundColor(color: Color): void
    {
        super.setBackgroundColor(color);
        this.trackedBackgroundColor = color;
    }
    
    public override setCursorPosition(row: number, column: number): void
    {
        super.setCursorPosition(row, column);
        this.cursorPosition = { row, column };
    }
    
    public override drawPixel(x: number, y: number, color?: Color): void
    {
        this.pixels.push({ x, y, color });
    }
    
    public override drawLine(x1: number, y1: number, x2: number, y2: number, color?: Color): void
    {
        this.lines.push({ x1, y1, x2, y2, color });
    }
    
    public override drawRectangle(x: number, y: number, width: number, height: number, filled: boolean, color?: Color): void
    {
        this.rectangles.push({ x, y, width, height, filled, color });
    }
    
    public override drawOval(x: number, y: number, width: number, height: number, filled: boolean, color?: Color): void
    {
        this.ovals.push({ x, y, width, height, filled, color });
    }
    
    public override drawCircle(x: number, y: number, radius: number, filled: boolean, color?: Color): void
    {
        this.circles.push({ x, y, radius, filled, color });
    }
    
    public override drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, filled: boolean, color?: Color): void
    {
        this.triangles.push({ x1, y1, x2, y2, x3, y3, filled, color });
    }
    
    public override drawArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, color?: Color): void
    {
        this.arcs.push({ x, y, radius, startAngle, endAngle, color });
    }
    
    public override clear(): void
    {
        this.clearCalled = true;
    }
    
    public override printText(text: string): void
    {
        this.printedText.push(text);
        super.printText(text);
    }
    
    public override newLine(): void
    {
        this.newLineCount++;
        super.newLine();
    }
    
    public getPrintedOutput(): string
    {
        return this.printedText.join('');
    }
}

class MockAudio extends Audio
{
    public trackedTempo: number | null = null;
    public trackedVolume: number | null = null;
    public voice: number | null = null;
    public sequences: string[] = [];
    
    public override setTempo(bpm: number): void
    {
        super.setTempo(bpm);
        this.trackedTempo = bpm;
    }
    
    public override setVolume(volume: number): void
    {
        super.setVolume(volume);
        this.trackedVolume = volume;
    }
    
    public override setVoice(voiceIndex: number): void
    {
        super.setVoice(voiceIndex);
        this.voice = voiceIndex;
    }
    
    public override playSequence(mml: string): void
    {
        super.playSequence(mml);
        this.sequences.push(mml);
    }
}

describe('Statement Implementations', () =>
{
    let context: ExecutionContext;
    let graphics: MockGraphics;
    let audio: MockAudio;
    let program: Program;
    let runtime: RuntimeExecution;
    
    beforeEach(() =>
    {
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
                [new LiteralExpression({ type: EduBasicType.Integer, value: 5 })]
            );
            
            const result = stmt.execute(context, graphics, audio, program, runtime);
            
            expect(result.result).toBe(ExecutionResult.Continue);
            const arr = context.getVariable('arr%[]');
            expect(arr.type).toBe(EduBasicType.Array);
            expect((arr.value as any[]).length).toBe(5);
        });
        
        it('should create 2D array', () =>
        {
            const stmt = new DimStatement(
                'matrix%[]',
                [
                    new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 4 })
                ]
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            const arr = context.getVariable('matrix%[]');
            expect((arr.value as any[]).length).toBe(3);
            expect((arr.value as any[])[0].length).toBe(4);
        });
        
        it('should create 3D array', () =>
        {
            const stmt = new DimStatement(
                'cube%[]',
                [
                    new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                    new LiteralExpression({ type: EduBasicType.Integer, value: 4 })
                ]
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            const arr = context.getVariable('cube%[]');
            expect((arr.value as any[]).length).toBe(2);
            expect((arr.value as any[])[0].length).toBe(3);
            expect((arr.value as any[])[0][0].length).toBe(4);
        });
        
        it('should throw error for negative dimensions', () =>
        {
            const stmt = new DimStatement(
                'arr%[]',
                [new LiteralExpression({ type: EduBasicType.Integer, value: -5 })]
            );
            
            expect(() => stmt.execute(context, graphics, audio, program, runtime)).toThrow('DIM: Array dimension cannot be negative');
        });
        
        it('should floor real number dimensions', () =>
        {
            const stmt = new DimStatement(
                'arr%[]',
                [new LiteralExpression({ type: EduBasicType.Real, value: 5.9 })]
            );
            
            stmt.execute(context, graphics, audio, program, runtime);
            
            const arr = context.getVariable('arr%[]');
            expect((arr.value as any[]).length).toBe(5);
        });
    });
    
    describe('RANDOMIZE Statement', () =>
    {
        it('should seed random number generator with explicit seed', () =>
        {
            const stmt = new RandomizeStatement(12345);
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
            const stmt1 = new RandomizeStatement(42);
            expect(stmt1.toString()).toBe('RANDOMIZE 42');
            
            const stmt2 = new RandomizeStatement(null);
            expect(stmt2.toString()).toBe('RANDOMIZE');
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
            it('should set voice', () =>
            {
                const stmt = new VoiceStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                    null,
                    null,
                    null,
                    null
                );
                
                const result = stmt.execute(context, graphics, audio, program, runtime);
                
                expect(result.result).toBe(ExecutionResult.Continue);
                expect(audio.voice).toBe(2);
            });
            
            it('should floor real number voice index', () =>
            {
                const stmt = new VoiceStatement(
                    new LiteralExpression({ type: EduBasicType.Real, value: 3.7 }),
                    null,
                    null,
                    null,
                    null
                );
                
                stmt.execute(context, graphics, audio, program, runtime);
                
                expect(audio.voice).toBe(3);
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
                expect(audio.sequences[0]).toBe('CDEFGAB');
            });
            
            it('should handle complex MML sequences', () =>
            {
                const stmt = new PlayStatement(
                    new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                    new LiteralExpression({ type: EduBasicType.String, value: 'O4 L4 C D E F G A B O5 C' })
                );
                
                stmt.execute(context, graphics, audio, program, runtime);
                
                expect(audio.sequences[0]).toBe('O4 L4 C D E F G A B O5 C');
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
            expect(graphics.getPrintedOutput()).toBe('[1, hello, 3.14]');
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
    });
});

