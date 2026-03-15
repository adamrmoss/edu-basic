import { EduBasicType } from '@/lang/edu-basic-value';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { InputStatement } from '@/lang/statements/io';

import { createRuntimeFixture } from './program-execution-test-fixtures';

describe('INPUT statement', () =>
{
    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    it('should parse integers and arrays', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        runtime.setPendingInput('42');
        new InputStatement('x%').execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 42 });

        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [{ type: EduBasicType.Integer, value: 0 }],
        } as any, false);
        runtime.setPendingInput('1,2,3');
        new InputStatement('a%[]').execute(context, graphics, audio, program, runtime);
        const arr = context.getVariable('a%[]');
        expect(arr.type).toBe(EduBasicType.Array);
    });

    it('should parse complex values and validate failures', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        runtime.setPendingInput('3+4i');
        new InputStatement('z&').execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('z&')).toEqual({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });

        runtime.setPendingInput('not a number');
        expect(() =>
        {
            new InputStatement('x%').execute(context, graphics, audio, program, runtime);
        }).toThrow('INPUT: invalid integer');

        runtime.setPendingInput('x');
        expect(() =>
        {
            new InputStatement('obj').execute(context, graphics, audio, program, runtime);
        }).toThrow('INPUT: cannot read STRUCTURE values');
    });

    it('should parse reals and strings (including quoted strings)', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        runtime.setPendingInput('3.5');
        new InputStatement('x#').execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('x#')).toEqual({ type: EduBasicType.Real, value: 3.5 });

        runtime.setPendingInput('"hello"');
        new InputStatement('s$').execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('s$')).toEqual({ type: EduBasicType.String, value: 'hello' });

        runtime.setPendingInput('not a number');
        expect(() =>
        {
            new InputStatement('bad#').execute(context, graphics, audio, program, runtime);
        }).toThrow('INPUT: invalid real');
    });

    it('should allocate array values when existing array is empty or has wrong element type', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('a%[]', { type: EduBasicType.Array, elementType: EduBasicType.Integer, value: [] } as any, false);
        runtime.setPendingInput('1,2,3');
        new InputStatement('a%[]').execute(context, graphics, audio, program, runtime);
        const arr1 = context.getVariable('a%[]');
        expect(arr1.type).toBe(EduBasicType.Array);
        if (arr1.type !== EduBasicType.Array) { return; }
        expect(arr1.elementType).toBe(EduBasicType.Integer);
        expect(arr1.value.length).toBe(3);

        context.setVariable('a%[]', { type: EduBasicType.Array, elementType: EduBasicType.Real, value: [] } as any, false);
        runtime.setPendingInput('4,5');
        new InputStatement('a%[]').execute(context, graphics, audio, program, runtime);
        const arr2 = context.getVariable('a%[]');
        expect(arr2.type).toBe(EduBasicType.Array);
        if (arr2.type !== EduBasicType.Array) { return; }
        expect(arr2.elementType).toBe(EduBasicType.Integer);
        expect(arr2.value.length).toBe(2);
    });

    it('should keep existing array length and only overwrite provided elements', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 10 },
                { type: EduBasicType.Integer, value: 20 },
                { type: EduBasicType.Integer, value: 30 }
            ]
        } as any, false);

        runtime.setPendingInput('1');
        new InputStatement('a%[]').execute(context, graphics, audio, program, runtime);

        const arr = context.getVariable('a%[]');
        expect(arr.type).toBe(EduBasicType.Array);
        if (arr.type !== EduBasicType.Array) { return; }

        expect(arr.value.length).toBe(3);
        expect(arr.value[0]).toEqual({ type: EduBasicType.Integer, value: 1 });
        expect(arr.value[1]).toEqual({ type: EduBasicType.Integer, value: 20 });
        expect(arr.value[2]).toEqual({ type: EduBasicType.Integer, value: 30 });
    });
});

