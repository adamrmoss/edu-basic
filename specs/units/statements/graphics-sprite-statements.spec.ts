import { ExecutionContext } from '@/lang/execution-context';
import { Program } from '@/lang/program';
import { RuntimeExecution } from '@/lang/runtime-execution';
import { EduBasicType } from '@/lang/edu-basic-value';

import { Audio } from '@/lang/audio';
import { Graphics } from '@/lang/graphics';
import { FileSystemService } from '@/app/disk/filesystem.service';

import { LiteralExpression } from '@/lang/expressions/literal-expression';

import { PaintStatement, PutStatement, GetStatement } from '@/lang/statements/graphics';

import { BufferGraphics } from '../mocks';

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

describe('Graphics sprite statements', () =>
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
        if (sprite.type !== EduBasicType.Array)
        {
            throw new Error('Expected sprite%[] to be an array');
        }

        expect(sprite.elementType).toBe(EduBasicType.Integer);

        const values = sprite.value.map(v =>
        {
            if (v.type !== EduBasicType.Integer)
            {
                throw new Error('Expected sprite%[] elements to be INTEGER');
            }

            return v.value;
        });
        expect(values).toEqual([1, 1, 0x11223344]);
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
});

