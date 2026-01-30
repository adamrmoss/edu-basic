import { BinaryExpression, BinaryOperator, BinaryOperatorCategory } from '@/lang/expressions/binary-expression';
import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '@/lang/expressions/unary-expression';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('Expression Edge Cases', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('Arithmetic Edge Cases', () =>
    {
        it('should handle very large integers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: Number.MAX_SAFE_INTEGER });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(Number.MAX_SAFE_INTEGER + 1);
        });

        it('should handle very small integers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: Number.MIN_SAFE_INTEGER });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(Number.MIN_SAFE_INTEGER + 1);
        });

        it('should handle zero multiplication', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 100 });
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle very small real numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 1e-10 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 1e-10 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(2e-10);
        });

        it('should handle power of zero', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0);
        });

        it('should handle zero to power of zero', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(1);
        });

        it('should handle negative power', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: -2 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(0.25);
        });

        it('should handle modulo with negative divisor', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: -3 });
            const expr = new BinaryExpression(left, BinaryOperator.Modulo, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1);
        });

        it('should throw error for string and number addition (not concatenation)', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            expect(() => expr.evaluate(context)).toThrow('Cannot convert STRING to number');
        });
    });

    describe('Comparison Edge Cases', () =>
    {
        it('should handle NaN comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: NaN });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 5 });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle Infinity comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: Infinity });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 5 });
            const expr = new BinaryExpression(left, BinaryOperator.GreaterThan, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should handle negative Infinity', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: -Infinity });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 5 });
            const expr = new BinaryExpression(left, BinaryOperator.LessThan, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should handle very close floating point numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 0.1 + 0.2 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 0.3 });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle empty string comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should handle empty string vs non-empty', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'a' });
            const expr = new BinaryExpression(left, BinaryOperator.LessThan, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });
    });

    describe('Logical Edge Cases', () =>
    {
        it('should handle very large integers in bitwise operations', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 0xFFFFFFFF });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0x0000FFFF });
            const expr = new BinaryExpression(left, BinaryOperator.And, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0x0000FFFF);
        });

        it('should handle zero in all logical operations', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const andExpr = new BinaryExpression(left, BinaryOperator.And, right, BinaryOperatorCategory.Logical);
            const orExpr = new BinaryExpression(left, BinaryOperator.Or, right, BinaryOperatorCategory.Logical);
            const xorExpr = new BinaryExpression(left, BinaryOperator.Xor, right, BinaryOperatorCategory.Logical);

            expect(andExpr.evaluate(context).value).toBe(0);
            expect(orExpr.evaluate(context).value).toBe(0);
            expect(xorExpr.evaluate(context).value).toBe(0);
        });

        it('should handle NOT with zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Not, value, UnaryOperatorCategory.Prefix);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should handle NOT with -1', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new UnaryExpression(UnaryOperator.Not, value, UnaryOperatorCategory.Prefix);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });

    describe('Mathematical Edge Cases', () =>
    {
        it('should handle SIN of zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Sin, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(0);
        });

        it('should handle COS of zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Cos, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1);
        });

        it('should handle SQRT of zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Sqrt, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(0);
        });

        it('should upcast to complex for SQRT of negative number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: -4 });
            const expr = new UnaryExpression(UnaryOperator.Sqrt, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0);
                expect(Math.abs(result.value.imaginary)).toBeCloseTo(2);
            }
        });

        it('should handle LOG of 1', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 1 });
            const expr = new UnaryExpression(UnaryOperator.Log, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(0);
        });

        it('should handle LOG of zero (returns -Infinity as real)', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Log, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(-Infinity);
        });

        it('should upcast to complex for LOG of negative number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: -1 });
            const expr = new UnaryExpression(UnaryOperator.Log, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0);
                expect(result.value.imaginary).toBeCloseTo(Math.PI);
            }
        });

        it('should handle EXP of zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Exp, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1);
        });

        it('should handle EXP of very large numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 100 });
            const expr = new UnaryExpression(UnaryOperator.Exp, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeGreaterThan(1e40);
        });

        it('should handle ABS of negative number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: -42 });
            const expr = new UnaryExpression(UnaryOperator.Abs, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(42);
        });

        it('should handle ABS of zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Abs, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0);
        });

        it('should handle FLOOR of negative number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: -3.7 });
            const expr = new UnaryExpression(UnaryOperator.Floor, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(-4);
        });

        it('should handle CEIL of negative number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: -3.7 });
            const expr = new UnaryExpression(UnaryOperator.Ceil, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(-3);
        });
    });

    describe('Type Coercion Edge Cases', () =>
    {
        it('should handle integer overflow in addition', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: Number.MAX_SAFE_INTEGER });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(Number.MAX_SAFE_INTEGER + 1);
        });

        it('should coerce integer to real when needed', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(8.5);
        });

        it('should coerce real to complex when needed', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 5 });
            const right = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: 4 }
            });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(8);
                expect(result.value.imaginary).toBe(4);
            }
        });
    });
});
