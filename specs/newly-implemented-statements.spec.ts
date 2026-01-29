import { ExecutionContext } from '../src/lang/execution-context';
import { Program } from '../src/lang/program';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { ExecutionResult } from '../src/lang/statements/statement';
import { EduBasicType } from '../src/lang/edu-basic-value';

import { Audio } from '../src/lang/audio';
import { Graphics } from '../src/lang/graphics';
import { FileSystemService } from '../src/app/disk/filesystem.service';

import { LiteralExpression } from '../src/lang/expressions/literal-expression';

import { InputStatement } from '../src/lang/statements/io';
import { SetOption, SetStatement } from '../src/lang/statements/misc';
import { GetStatement, PaintStatement, PutStatement, TurtleStatement } from '../src/lang/statements/graphics';

class BufferGraphics extends Graphics
{
    public constructor(private readonly testBuffer: ImageData)
    {
        super();
    }

    public override getBuffer(): ImageData | null
    {
        return this.testBuffer;
    }
}

class LineTrackingGraphics extends Graphics
{
    public lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    public override drawLine(x1: number, y1: number, x2: number, y2: number): void
    {
        this.lines.push({ x1, y1, x2, y2 });
    }
}

class CursorTrackingGraphics extends Graphics
{
    public lastCursor: { row: number; column: number } | null = null;
    public newLineCalls: number = 0;

    public override setCursorPosition(row: number, column: number): void
    {
        super.setCursorPosition(row, column);
        this.lastCursor = { row, column };
    }

    public override newLine(): void
    {
        this.newLineCalls++;
        super.newLine();
    }
}

function setPixel(buffer: ImageData, width: number, height: number, x: number, y: number, rgba: number): void
{
    const flippedY = height - 1 - y;
    const index = (flippedY * width + x) * 4;
    buffer.data[index] = (rgba >> 24) & 0xFF;
    buffer.data[index + 1] = (rgba >> 16) & 0xFF;
    buffer.data[index + 2] = (rgba >> 8) & 0xFF;
    buffer.data[index + 3] = rgba & 0xFF;
}

function getPixel(buffer: ImageData, width: number, height: number, x: number, y: number): { r: number; g: number; b: number; a: number }
{
    const flippedY = height - 1 - y;
    const index = (flippedY * width + x) * 4;
    return {
        r: buffer.data[index],
        g: buffer.data[index + 1],
        b: buffer.data[index + 2],
        a: buffer.data[index + 3]
    };
}

describe('Newly implemented statements', () =>
{
    let context: ExecutionContext;
    let program: Program;
    let runtime: RuntimeExecution;
    let audio: Audio;
    let fileSystem: FileSystemService;

    beforeEach(() =>
    {
        context = new ExecutionContext();
        program = new Program();
        audio = new Audio();
        fileSystem = new FileSystemService();
        runtime = new RuntimeExecution(program, context, new Graphics(), audio, fileSystem);
    });

    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    it('INPUT should assign scalar values based on sigil', () =>
    {
        jest.spyOn(window, 'prompt').mockReturnValueOnce('42');

        const stmt = new InputStatement('x%');
        const result = stmt.execute(context, new Graphics(), audio, program, runtime);

        expect(result.result).toBe(ExecutionResult.Continue);
        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 42 });
    });

    it('INPUT should fill arrays from comma-separated values', () =>
    {
        jest.spyOn(window, 'prompt').mockReturnValueOnce('1, 2, 3');

        context.setVariable('scores%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 0 },
                { type: EduBasicType.Integer, value: 0 },
                { type: EduBasicType.Integer, value: 0 },
                { type: EduBasicType.Integer, value: 0 },
                { type: EduBasicType.Integer, value: 0 }
            ]
        }, false);

        const stmt = new InputStatement('scores%[]');
        stmt.execute(context, new Graphics(), audio, program, runtime);

        const scores = context.getVariable('scores%[]');
        expect(scores.type).toBe(EduBasicType.Array);
        expect(scores.elementType).toBe(EduBasicType.Integer);
        expect(scores.value.slice(0, 3).map(v => v.value)).toEqual([1, 2, 3]);
        expect(scores.value.slice(3).map(v => v.value)).toEqual([0, 0]);
    });

    it('SET should toggle text wrap and line spacing', () =>
    {
        const graphics = new CursorTrackingGraphics();

        new SetStatement(SetOption.TextWrapOff).execute(context, graphics, audio, program, runtime);
        new SetStatement(SetOption.LineSpacingOn).execute(context, graphics, audio, program, runtime);

        graphics.setCursorPosition(0, 0);
        graphics.printText('X'.repeat(100));
        expect(graphics.newLineCalls).toBe(0);

        graphics.setCursorPosition(0, 0);
        graphics.newLine();
        expect(graphics.lastCursor?.row).toBe(2);
    });

    it('GET should capture a region into an integer array sprite', () =>
    {
        const buffer = {
            width: 640,
            height: 480,
            data: new Uint8ClampedArray(640 * 480 * 4)
        } as any as ImageData;

        setPixel(buffer, 640, 480, 1, 2, 0x11223344);

        const graphics = new BufferGraphics(buffer);
        const stmt = new GetStatement(
            'sprite%[]',
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 })
        );

        stmt.execute(context, graphics, audio, program, runtime);

        const sprite = context.getVariable('sprite%[]');
        expect(sprite.type).toBe(EduBasicType.Array);
        expect(sprite.elementType).toBe(EduBasicType.Integer);
        expect(sprite.value.map(v => v.value)).toEqual([1, 1, 0x11223344]);
    });

    it('PUT should alpha-blend sprite pixels onto the buffer', () =>
    {
        const buffer = {
            width: 640,
            height: 480,
            data: new Uint8ClampedArray(640 * 480 * 4)
        } as any as ImageData;

        buffer.data.fill(0);
        setPixel(buffer, 640, 480, 5, 5, 0x000000FF);

        context.setVariable('sprite%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 0xFF000080 }
            ]
        }, false);

        const graphics = new BufferGraphics(buffer);
        const stmt = new PutStatement(
            'sprite%[]',
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 })
        );

        stmt.execute(context, graphics, audio, program, runtime);

        const pixel = getPixel(buffer, 640, 480, 5, 5);
        expect(pixel).toEqual({ r: 128, g: 0, b: 0, a: 255 });
    });

    it('PAINT should flood fill a contiguous region', () =>
    {
        const buffer = {
            width: 640,
            height: 480,
            data: new Uint8ClampedArray(640 * 480 * 4)
        } as any as ImageData;

        buffer.data.fill(255);

        for (let y = 0; y < 3; y++)
        {
            for (let x = 0; x < 3; x++)
            {
                setPixel(buffer, 640, 480, x, y, 0x000000FF);
            }
        }

        const graphics = new BufferGraphics(buffer);
        const stmt = new PaintStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0x00FF00FF })
        );

        stmt.execute(context, graphics, audio, program, runtime);

        const inside = getPixel(buffer, 640, 480, 1, 1);
        const outside = getPixel(buffer, 640, 480, 10, 10);

        expect(inside).toEqual({ r: 0, g: 255, b: 0, a: 255 });
        expect(outside).toEqual({ r: 255, g: 255, b: 255, a: 255 });
    });

    it('TURTLE should draw lines for movement commands with pen down', () =>
    {
        const graphics = new LineTrackingGraphics();
        const turtle = new TurtleStatement(new LiteralExpression({ type: EduBasicType.String, value: 'HOME FD 10 RT 90 FD 10' }));

        const result = turtle.execute(context, graphics, audio, program, runtime);

        expect(result.result).toBe(ExecutionResult.Continue);
        expect(graphics.lines.length).toBe(2);
    });
});

