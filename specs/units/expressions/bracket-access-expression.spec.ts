import { EduBasicType, EduBasicValue } from '@/lang/edu-basic-value';
import { ExecutionContext } from '@/lang/execution-context';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { BracketAccessExpression } from '@/lang/expressions/special/bracket-access-expression';
import { VariableExpression } from '@/lang/expressions/special/variable-expression';

describe('BracketAccessExpression', () =>
{
    it('reads array elements using one-based indexing and returns defaults for out-of-range', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 10 },
                { type: EduBasicType.Integer, value: 20 }
            ]
        }, false);

        const index1 = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        );
        expect(index1.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 10 });

        const index2 = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.String, value: '2' }),
            null
        );
        expect(index2.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 20 });

        const index0 = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            null
        );
        expect(index0.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const outOfRange = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 99 }),
            null
        );
        expect(outOfRange.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('treats typed bases as arrays when not declared', () =>
    {
        const context = new ExecutionContext();

        const expr = new BracketAccessExpression(
            new VariableExpression('b%'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('reads structure members case-insensitively and returns defaults when missing', () =>
    {
        const context = new ExecutionContext();
        const map = new Map<string, EduBasicValue>();
        map.set('Foo$', { type: EduBasicType.String, value: 'bar' });
        context.setVariable('s', { type: EduBasicType.Structure, value: map }, false);

        const existing = new BracketAccessExpression(
            new VariableExpression('s'),
            null,
            'foo$'
        );
        expect(existing.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'bar' });

        const missingTyped = new BracketAccessExpression(
            new VariableExpression('s'),
            null,
            'missing%'
        );
        expect(missingTyped.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const missingUntyped = new BracketAccessExpression(
            new VariableExpression('s'),
            null,
            'missing'
        );
        expect(missingUntyped.evaluate(context).type).toBe(EduBasicType.Structure);
    });

    it('uses bracketIdentifier to read the index from a variable', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('i%', { type: EduBasicType.Integer, value: 2 }, false);
        context.setVariable('c$[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.String,
            value: [
                { type: EduBasicType.String, value: 'a' },
                { type: EduBasicType.String, value: 'b' }
            ]
        }, false);

        const expr = new BracketAccessExpression(
            new VariableExpression('c$[]'),
            null,
            'i%'
        );
        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'b' });
    });

    it('throws when applying brackets to a non-array, non-structure value', () =>
    {
        const context = new ExecutionContext();
        const expr = new BracketAccessExpression(
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        );

        expect(() => expr.evaluate(context)).toThrow('Cannot apply [ ] to INTEGER');
    });

    it('treats untyped bases as arrays when name[] exists', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('u[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.String,
            value: [
                { type: EduBasicType.String, value: 'x' }
            ]
        } as any, false);

        const expr = new BracketAccessExpression(
            new VariableExpression('u'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'x' });
    });

    it('returns defaults when bracket expression and identifier are missing', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 10 }
            ]
        }, false);

        const arrayExpr = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            null,
            null
        );
        expect(arrayExpr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const structExpr = new BracketAccessExpression(
            new VariableExpression('s'),
            null,
            null
        );
        expect(structExpr.evaluate(context).type).toBe(EduBasicType.Structure);
    });

    it('handles non-numeric string and complex indices for arrays', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 10 }
            ]
        }, false);

        const badStringIndex = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.String, value: 'x' }),
            null
        );
        expect(badStringIndex.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const complexIndex = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1.9, imaginary: 0 } }),
            null
        );
        expect(complexIndex.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 10 });
    });

    it('returns direct structure members when key matches exactly', () =>
    {
        const context = new ExecutionContext();
        const map = new Map<string, EduBasicValue>();
        map.set('Foo$', { type: EduBasicType.String, value: 'bar' });
        context.setVariable('s', { type: EduBasicType.Structure, value: map }, false);

        const existing = new BracketAccessExpression(
            new VariableExpression('s'),
            null,
            'Foo$'
        );
        expect(existing.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'bar' });
    });

    it('returns array defaults for missing structure members ending in []', () =>
    {
        const context = new ExecutionContext();
        const map = new Map<string, EduBasicValue>();
        context.setVariable('s', { type: EduBasicType.Structure, value: map }, false);

        const missing = new BracketAccessExpression(
            new VariableExpression('s'),
            null,
            'missing%[]'
        );
        const result = missing.evaluate(context);
        expect(result.type).toBe(EduBasicType.Array);
        if (result.type !== EduBasicType.Array)
        {
            return;
        }
        expect(result.elementType).toBe(EduBasicType.Integer);
        expect(result.value).toEqual([]);
    });

    it('formats toString with empty inside', () =>
    {
        const expr = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            null,
            null
        );
        expect(expr.toString()).toBe('a%[][]');
    });

    it('uses bracketExpr values to form structure keys (string/number/complex/type)', () =>
    {
        const context = new ExecutionContext();

        const map = new Map<string, EduBasicValue>();
        map.set('2', { type: EduBasicType.Integer, value: 22 });
        map.set('3.5', { type: EduBasicType.Integer, value: 35 });
        map.set('1+2i', { type: EduBasicType.Integer, value: 12 });
        map.set('STRUCTURE', { type: EduBasicType.Integer, value: 99 });
        context.setVariable('s', { type: EduBasicType.Structure, value: map }, false);

        const intKey = new BracketAccessExpression(
            new VariableExpression('s'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            null
        );
        expect(intKey.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 22 });

        const realKey = new BracketAccessExpression(
            new VariableExpression('s'),
            new LiteralExpression({ type: EduBasicType.Real, value: 3.5 }),
            null
        );
        expect(realKey.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 35 });

        const complexKey = new BracketAccessExpression(
            new VariableExpression('s'),
            new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } }),
            null
        );
        expect(complexKey.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 12 });

        const typeKey = new BracketAccessExpression(
            new VariableExpression('s'),
            new LiteralExpression({ type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() }),
            null
        );
        expect(typeKey.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 99 });
    });

    it('returns default values for array element types ARRAY and STRUCTURE', () =>
    {
        const context = new ExecutionContext();

        context.setVariable('aa%[]', { type: EduBasicType.Array, elementType: EduBasicType.Array, value: [] } as any, false);
        const arrayOfArrays = new BracketAccessExpression(
            new VariableExpression('aa%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        );
        const a = arrayOfArrays.evaluate(context);
        expect(a.type).toBe(EduBasicType.Array);

        context.setVariable('ss%[]', { type: EduBasicType.Array, elementType: EduBasicType.Structure, value: [] } as any, false);
        const arrayOfStructs = new BracketAccessExpression(
            new VariableExpression('ss%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        );
        const s = arrayOfStructs.evaluate(context);
        expect(s.type).toBe(EduBasicType.Structure);
    });
});

