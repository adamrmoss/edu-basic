import { ExecutionContext } from '../src/lang/execution-context';
import { EduBasicType } from '../src/lang/edu-basic-value';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { ExecutionResult } from '../src/lang/statements/statement';
import { PutStatement, TurtleStatement } from '../src/lang/statements/graphics';

describe('Graphics statements (direct execution)', () =>
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
});

