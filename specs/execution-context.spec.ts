import { ExecutionContext } from '../src/lang/execution-context';
import { EduBasicType } from '../src/lang/edu-basic-value';

describe('ExecutionContext', () =>
{
    it('returns correct default values for scalars and arrays', () =>
    {
        const context = new ExecutionContext();

        expect(context.getVariable('i%')).toEqual({ type: EduBasicType.Integer, value: 0 });
        expect(context.getVariable('r#')).toEqual({ type: EduBasicType.Real, value: 0.0 });
        expect(context.getVariable('s$')).toEqual({ type: EduBasicType.String, value: '' });
        expect(context.getVariable('c&')).toEqual({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });

        const u = context.getVariable('u');
        expect(u.type).toBe(EduBasicType.Structure);

        const a = context.getVariable('a%[]');
        expect(a.type).toBe(EduBasicType.Array);
        if (a.type !== EduBasicType.Array)
        {
            return;
        }
        expect(a.elementType).toBe(EduBasicType.Integer);
        expect(a.value).toEqual([]);

        const sArr = context.getVariable('s$[]');
        expect(sArr.type).toBe(EduBasicType.Array);
        if (sArr.type !== EduBasicType.Array)
        {
            return;
        }
        expect(sArr.elementType).toBe(EduBasicType.String);
        expect(sArr.value).toEqual([]);

        const structArr = context.getVariable('x[]');
        expect(structArr.type).toBe(EduBasicType.Array);
        if (structArr.type !== EduBasicType.Array)
        {
            return;
        }
        expect(structArr.elementType).toBe(EduBasicType.Structure);
    });

    it('tracks canonical names for globals and locals', () =>
    {
        const context = new ExecutionContext();

        context.setVariable('Foo%', { type: EduBasicType.Integer, value: 1 }, false);
        expect(context.getCanonicalName('FOO%')).toBe('Foo%');
        expect(context.getVariable('foo%')).toEqual({ type: EduBasicType.Integer, value: 1 });
        expect(context.getCanonicalName('FOO%')).toBe('foo%');

        context.pushStackFrame(0);
        context.setVariable('Local%', { type: EduBasicType.Integer, value: 7 }, true);
        expect(context.getVariable('local%')).toEqual({ type: EduBasicType.Integer, value: 7 });
        expect(context.hasVariable('LOCAL%')).toBe(true);
        expect(context.getCanonicalName('LOCAL%')).toBe('local%');

        context.popStackFrame();
        expect(context.getVariable('local%')).toEqual({ type: EduBasicType.Integer, value: 0 });
        expect(context.hasVariable('local%')).toBe(false);

        context.setVariable('FallbackLocal%', { type: EduBasicType.Integer, value: 2 }, true);
        expect(context.getVariable('fallbacklocal%')).toEqual({ type: EduBasicType.Integer, value: 2 });
    });

    it('resolves and assigns BYREF variables through outer scopes (local)', () =>
    {
        const context = new ExecutionContext();

        context.pushStackFrame(0);
        context.setVariable('y%', { type: EduBasicType.Integer, value: 2 }, true);

        const byRef = new Map<string, string>();
        byRef.set('P%', 'y%');
        context.pushStackFrame(0, byRef);

        expect(context.getVariable('p%')).toEqual({ type: EduBasicType.Integer, value: 2 });
        expect(context.hasVariable('p%')).toBe(true);

        context.setVariable('p%', { type: EduBasicType.Integer, value: 9 }, false);
        expect(context.getVariable('p%')).toEqual({ type: EduBasicType.Integer, value: 9 });

        expect(context.getCanonicalName('p%')).toBe('y%');

        context.popStackFrame();
        expect(context.getVariable('y%')).toEqual({ type: EduBasicType.Integer, value: 9 });
    });

    it('resolves and assigns BYREF variables through outer scopes (global)', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('g%', { type: EduBasicType.Integer, value: 3 }, false);

        context.pushStackFrame(0);
        const byRef = new Map<string, string>();
        byRef.set('P%', 'g%');
        context.pushStackFrame(0, byRef);

        expect(context.getVariable('p%')).toEqual({ type: EduBasicType.Integer, value: 3 });
        context.setVariable('p%', { type: EduBasicType.Integer, value: 4 }, false);
        expect(context.getVariable('g%')).toEqual({ type: EduBasicType.Integer, value: 4 });
    });

    it('handles stack frames and return addresses', () =>
    {
        const context = new ExecutionContext();

        expect(context.getCurrentReturnAddress()).toBeUndefined();
        expect(context.hasStackFrames()).toBe(false);
        expect(context.getStackDepth()).toBe(0);

        context.pushStackFrame(123);
        expect(context.hasStackFrames()).toBe(true);
        expect(context.getStackDepth()).toBe(1);
        expect(context.getCurrentReturnAddress()).toBe(123);

        expect(context.popStackFrame()).toBe(123);
        expect(context.getCurrentReturnAddress()).toBeUndefined();

        context.pushStackFrame(1);
        context.pushStackFrame(2);
        context.clearStackFrames();
        expect(context.getStackDepth()).toBe(0);
    });

    it('tracks key state and returns INKEY correctly', () =>
    {
        const context = new ExecutionContext();

        context.setKeyDown('');
        expect(context.getInkey()).toBe('');

        context.setKeyDown('A');
        expect(context.getInkey()).toBe('A');

        context.setKeyDown('B');
        expect(context.getInkey()).toBe('B');

        context.setKeyUp('B');
        expect(context.getInkey()).toBe('A');

        context.setKeyUp('A');
        expect(context.getInkey()).toBe('');

        context.setKeyUp('');
        expect(context.getInkey()).toBe('');

        context.setKeyDown('X');
        context.clearKeys();
        expect(context.getInkey()).toBe('');
    });

    it('clears variables and stack frames', () =>
    {
        const context = new ExecutionContext();

        context.setVariable('x%', { type: EduBasicType.Integer, value: 1 }, false);
        context.pushStackFrame(10);
        expect(context.hasStackFrames()).toBe(true);

        context.clearVariables();
        expect(context.hasStackFrames()).toBe(false);
        expect(context.hasVariable('x%')).toBe(false);
        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 0 });
    });
});

