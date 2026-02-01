import { EduBasicType } from '@/lang/edu-basic-value';
import { ExecutionContext } from '@/lang/execution-context';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ArrayAccessExpression } from '@/lang/expressions/special/array-access-expression';
import { VariableExpression } from '@/lang/expressions/special/variable-expression';

describe('ArrayAccessExpression', () =>
{
    it('uses baseName[] lookup when base is a variable without []', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 10 }
            ]
        } as any, false);

        const expr = new ArrayAccessExpression(
            new VariableExpression('a%'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 10 });
    });

    it('throws when the index cannot be parsed', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 10 }
            ]
        } as any, false);

        const expr = new ArrayAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.String, value: 'x' })
        );

        expect(() => expr.evaluate(context)).toThrow('Array index is out of bounds');
    });

    it('supports real and complex indices (truncated) and throws when out of range', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 10 },
                { type: EduBasicType.Integer, value: 20 }
            ]
        } as any, false);

        const realIndex = new ArrayAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Real, value: 1.9 })
        );
        expect(realIndex.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 10 });

        const complexIndex = new ArrayAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Complex, value: { real: 2.1, imaginary: 0 } })
        );
        expect(complexIndex.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 20 });

        const outOfRange = new ArrayAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 99 })
        );
        expect(() => outOfRange.evaluate(context)).toThrow('Array index is out of bounds');
    });

    it('returns a default when the array slot is nullish', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [undefined as any]
        } as any, false);

        const expr = new ArrayAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('throws when out-of-bounds even if element type is STRUCTURE', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('s[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Structure,
            value: []
        } as any, false);

        const expr = new ArrayAccessExpression(
            new VariableExpression('s[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );

        expect(() => expr.evaluate(context)).toThrow('Array index is out of bounds');
    });

    it('throws when base expression is not an array', () =>
    {
        const context = new ExecutionContext();
        const expr = new ArrayAccessExpression(
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );

        expect(() => expr.evaluate(context)).toThrow('ArrayAccessExpression: base expression is not an array');
    });
});

