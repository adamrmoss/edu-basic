import { EduBasicType } from '../src/lang/edu-basic-value';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { InputStatement } from '../src/lang/statements/io';
import { LocalStatement } from '../src/lang/statements/variables';

import { createRuntimeFixture } from './statement-runtime-test-helpers';

describe('INPUT statement', () =>
{
    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    it('LOCAL should set local variable when stack frame exists', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.pushStackFrame(0);

        const local = new LocalStatement('temp%', new LiteralExpression({ type: EduBasicType.Integer, value: 7 }));
        local.execute(context, graphics, audio, program, runtime);

        expect(context.getVariable('temp%')).toEqual({ type: EduBasicType.Integer, value: 7 });

        context.popStackFrame();
        expect(context.getVariable('temp%')).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('should parse integers and arrays', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        jest.spyOn(window, 'prompt').mockReturnValueOnce('42');
        new InputStatement('x%').execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 42 });

        jest.spyOn(window, 'prompt').mockReturnValueOnce('1,2,3');
        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [{ type: EduBasicType.Integer, value: 0 }],
        } as any, false);
        new InputStatement('a%[]').execute(context, graphics, audio, program, runtime);
        const arr = context.getVariable('a%[]');
        expect(arr.type).toBe(EduBasicType.Array);
    });

    it('should parse complex values and validate failures', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        jest.spyOn(window, 'prompt').mockReturnValueOnce('3+4i');
        new InputStatement('z&').execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('z&')).toEqual({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });

        jest.spyOn(window, 'prompt').mockReturnValueOnce('not a number');
        expect(() =>
        {
            new InputStatement('x%').execute(context, graphics, audio, program, runtime);
        }).toThrow('INPUT: invalid integer');

        jest.spyOn(window, 'prompt').mockReturnValueOnce('x');
        expect(() =>
        {
            new InputStatement('obj').execute(context, graphics, audio, program, runtime);
        }).toThrow('INPUT: cannot read STRUCTURE values');
    });
});

