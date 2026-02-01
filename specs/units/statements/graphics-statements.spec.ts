import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionResult } from '@/lang/statements/statement';
import {
    CircleStatement,
    GetStatement,
    LineStatement,
    OvalStatement,
    PutStatement,
    RectangleStatement,
    TriangleStatement,
    TurtleStatement
} from '@/lang/statements/graphics';

describe('Graphics statements (unit)', () =>
{
    beforeEach(() =>
    {
        const turtles = (TurtleStatement as any).turtles as Map<number, any> | undefined;
        if (turtles)
        {
            turtles.clear();
        }
    });

    it('TURTLE should require a string command list', () =>
    {
        const context = new ExecutionContext();
        const graphics = { width: 100, height: 100 } as any;
        const audio = {} as any;
        const program = {} as any;
        const runtime = { requestTabSwitch: jest.fn() } as any;

        const stmt = new TurtleStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }));
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow('TURTLE: commands must be a string');
    });

    it('TURTLE should execute commands and reuse state', () =>
    {
        const context = new ExecutionContext();
        const drawLine = jest.fn();
        const flush = jest.fn();

        const graphics = {
            width: 100,
            height: 100,
            drawLine,
            flush
        } as any;

        const audio = {} as any;
        const program = {} as any;
        const runtime = { requestTabSwitch: jest.fn() } as any;

        const stmt = new TurtleStatement(new LiteralExpression({ type: EduBasicType.String, value: 'PU FD 10 PD FD 5' }));
        stmt.execute(context, graphics, audio, program, runtime);
        stmt.execute(context, graphics, audio, program, runtime);

        expect(flush).toHaveBeenCalled();
        expect(runtime.requestTabSwitch).toHaveBeenCalledWith('output');
        expect(drawLine).toHaveBeenCalled();
    });

    it('TURTLE should draw lines for movement commands with pen down', () =>
    {
        const context = new ExecutionContext();
        const audio = {} as any;
        const program = {} as any;
        const runtime = { requestTabSwitch: jest.fn() } as any;

        const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
        const graphics = {
            width: 100,
            height: 100,
            drawLine: (x1: number, y1: number, x2: number, y2: number) =>
            {
                lines.push({ x1, y1, x2, y2 });
            },
            flush: jest.fn()
        } as any;

        new TurtleStatement(new LiteralExpression({ type: EduBasicType.String, value: 'HOME FD 10 RT 90 FD 10' }))
            .execute(context, graphics, audio, program, runtime);

        expect(lines.length).toBe(2);
    });

    it('TURTLE should throw on malformed or unknown commands', () =>
    {
        const context = new ExecutionContext();
        const graphics = { width: 100, height: 100, drawLine: jest.fn(), flush: jest.fn() } as any;
        const audio = {} as any;
        const program = {} as any;
        const runtime = { requestTabSwitch: jest.fn() } as any;

        expect(() =>
        {
            new TurtleStatement(new LiteralExpression({ type: EduBasicType.String, value: 'FD' }))
                .execute(context, graphics, audio, program, runtime);
        }).toThrow('TURTLE: missing value for FD');

        expect(() =>
        {
            new TurtleStatement(new LiteralExpression({ type: EduBasicType.String, value: 'FD X' }))
                .execute(context, graphics, audio, program, runtime);
        }).toThrow('TURTLE: invalid value for FD');

        expect(() =>
        {
            new TurtleStatement(new LiteralExpression({ type: EduBasicType.String, value: 'ZZ 1' }))
                .execute(context, graphics, audio, program, runtime);
        }).toThrow('TURTLE: unknown command ZZ');
    });

    it('PUT should validate sprite array and tolerate missing buffer', () =>
    {
        const context = new ExecutionContext();
        const graphics = { width: 10, height: 10, getBuffer: () => null, flush: jest.fn() } as any;
        const audio = {} as any;
        const program = {} as any;
        const runtime = { requestTabSwitch: jest.fn() } as any;

        const badDest = new PutStatement('sprite%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), new LiteralExpression({ type: EduBasicType.Integer, value: 0 }));
        expect(() =>
        {
            badDest.execute(context, graphics, audio, program, runtime);
        }).toThrow('PUT: source must be an array');

        context.setVariable('sprite%[]', { type: EduBasicType.Integer, value: 0 } as any, false);
        const notArray = new PutStatement('sprite%[]', new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), new LiteralExpression({ type: EduBasicType.Integer, value: 0 }));
        expect(() =>
        {
            notArray.execute(context, graphics, audio, program, runtime);
        }).toThrow('PUT: sprite%[] is not an array');

        context.setVariable('sprite%[]', { type: EduBasicType.Array, elementType: EduBasicType.Integer, value: [] } as any, false);
        expect(() =>
        {
            notArray.execute(context, graphics, audio, program, runtime);
        }).toThrow('PUT: invalid sprite array');

        context.setVariable('sprite%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 0xFF0000FF }
            ]
        } as any, false);

        const noBuffer = new PutStatement('sprite%[]', new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), new LiteralExpression({ type: EduBasicType.Integer, value: 0 }));
        const status = noBuffer.execute(context, graphics, audio, program, runtime);
        expect(status).toEqual({ result: ExecutionResult.Continue });
    });

    it('PUT should render pixels and skip invalid/transparent/out-of-bounds pixels', () =>
    {
        const context = new ExecutionContext();

        const buffer = {
            data: new Uint8ClampedArray(4 * 4 * 4)
        } as any;

        const graphics = {
            width: 4,
            height: 4,
            getBuffer: () => buffer,
            flush: jest.fn()
        } as any;

        const audio = {} as any;
        const program = {} as any;
        const runtime = { requestTabSwitch: jest.fn() } as any;

        context.setVariable('sprite%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 2 },
                { type: EduBasicType.Integer, value: 2 },
                { type: EduBasicType.Integer, value: 0xFF0000FF },
                { type: EduBasicType.String, value: 'bad' } as any,
                { type: EduBasicType.Integer, value: 0xFF000000 },
                { type: EduBasicType.Integer, value: 0x00FF00FF }
            ]
        } as any, false);

        const stmt = new PutStatement(
            'sprite%[]',
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 })
        );
        const status = stmt.execute(context, graphics, audio, program, runtime);
        expect(status).toEqual({ result: ExecutionResult.Continue });

        expect(graphics.flush).toHaveBeenCalled();
        expect(runtime.requestTabSwitch).toHaveBeenCalledWith('output');

        const hasAny = buffer.data.some((b: number) => b !== 0);
        expect(hasAny).toBe(true);

        const outOfBounds = new PutStatement(
            'sprite%[]',
            new LiteralExpression({ type: EduBasicType.Integer, value: 999 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 999 })
        );
        outOfBounds.execute(context, graphics, audio, program, runtime);
    });

    it('PUT should throw on malformed sprite header and insufficient pixels', () =>
    {
        const context = new ExecutionContext();
        const buffer = { data: new Uint8ClampedArray(4 * 4 * 4) } as any;
        const graphics = { width: 4, height: 4, getBuffer: () => buffer, flush: jest.fn() } as any;
        const audio = {} as any;
        const program = {} as any;
        const runtime = { requestTabSwitch: jest.fn() } as any;

        context.setVariable('sprite%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.String, value: 'w' } as any,
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 0xFF0000FF }
            ]
        } as any, false);

        const stmt = new PutStatement('sprite%[]', new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), new LiteralExpression({ type: EduBasicType.Integer, value: 0 }));
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow('PUT: invalid sprite header');

        context.setVariable('sprite%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 2 },
                { type: EduBasicType.Integer, value: 2 },
                { type: EduBasicType.Integer, value: 0xFF0000FF }
            ]
        } as any, false);

        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow('PUT: sprite array too small');
    });

    it('shape statements should render with and without WITH color', () =>
    {
        const context = new ExecutionContext();
        const drawCircle = jest.fn();
        const drawLine = jest.fn();
        const drawOval = jest.fn();
        const drawRectangle = jest.fn();
        const drawTriangle = jest.fn();
        const flush = jest.fn();

        const graphics = {
            drawCircle,
            drawLine,
            drawOval,
            drawRectangle,
            drawTriangle,
            flush
        } as any;

        const audio = {} as any;
        const program = {} as any;
        const runtime = { requestTabSwitch: jest.fn() } as any;

        const withColor = new LiteralExpression({ type: EduBasicType.Integer, value: 0x11223344 });

        new CircleStatement(
            new LiteralExpression({ type: EduBasicType.Real, value: 1.9 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
            null,
            false
        ).execute(context, graphics, audio, program, runtime);

        new CircleStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
            withColor,
            true
        ).execute(context, graphics, audio, program, runtime);

        expect(drawCircle).toHaveBeenCalled();
        expect(runtime.requestTabSwitch).toHaveBeenCalledWith('output');

        new LineStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        ).execute(context, graphics, audio, program, runtime);

        new LineStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            withColor
        ).execute(context, graphics, audio, program, runtime);

        expect(drawLine).toHaveBeenCalled();

        new OvalStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 6 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null,
            false
        ).execute(context, graphics, audio, program, runtime);

        new OvalStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 6 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            withColor,
            true
        ).execute(context, graphics, audio, program, runtime);

        expect(drawOval).toHaveBeenCalled();

        new RectangleStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            null,
            false
        ).execute(context, graphics, audio, program, runtime);

        new RectangleStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            withColor,
            true
        ).execute(context, graphics, audio, program, runtime);

        expect(drawRectangle).toHaveBeenCalled();

        new TriangleStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null,
            false
        ).execute(context, graphics, audio, program, runtime);

        new TriangleStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            withColor,
            true
        ).execute(context, graphics, audio, program, runtime);

        expect(drawTriangle).toHaveBeenCalled();
        expect(flush).toHaveBeenCalled();
    });

    it('GET should validate destination variable and handle missing/available buffers', () =>
    {
        const context = new ExecutionContext();
        const audio = {} as any;
        const program = {} as any;
        const runtime = {} as any;

        const noArray = new GetStatement(
            'sprite%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );
        expect(() =>
        {
            noArray.execute(context, { width: 2, height: 2, getBuffer: () => null } as any, audio, program, runtime);
        }).toThrow('GET: destination must be an array');

        const graphicsNoBuffer = { width: 2, height: 2, getBuffer: () => null } as any;
        const stmt = new GetStatement(
            'sprite%[]',
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );
        stmt.execute(context, graphicsNoBuffer, audio, program, runtime);

        const v = context.getVariable('sprite%[]');
        expect(v.type).toBe(EduBasicType.Array);
        if (v.type !== EduBasicType.Array)
        {
            return;
        }
        expect(v.elementType).toBe(EduBasicType.Integer);
        expect(v.value.length).toBe(2);

        const buffer = { data: new Uint8ClampedArray(2 * 2 * 4) } as any;
        const graphicsWithBuffer = { width: 2, height: 2, getBuffer: () => buffer } as any;
        stmt.execute(context, graphicsWithBuffer, audio, program, runtime);

        const v2 = context.getVariable('sprite%[]');
        expect(v2.type).toBe(EduBasicType.Array);
        if (v2.type !== EduBasicType.Array)
        {
            return;
        }
        expect(v2.value.length).toBeGreaterThan(2);
    });
});

