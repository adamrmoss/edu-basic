import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '@/lang/expressions/unary-expression';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('Mathematical Operator Expressions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('Real number operations', () =>
    {
        it('should compute SIN of real number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Real, value: Math.PI / 2 });
            const expr = new UnaryExpression(UnaryOperator.Sin, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1.0);
        });

        it('should compute COS of real number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Real, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Cos, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1.0);
        });

        it('should compute EXP of real number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Real, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Exp, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1.0);
        });

        it('should compute LOG of real number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Real, value: Math.E });
            const expr = new UnaryExpression(UnaryOperator.Log, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1.0);
        });

        it('should compute SQRT of real number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Real, value: 4 });
            const expr = new UnaryExpression(UnaryOperator.Sqrt, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(2.0);
        });
    });

    describe('Complex number operations', () =>
    {
        it('should compute SIN of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: Math.PI / 2, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Sin, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute COS of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Cos, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute TAN of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Tan, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute EXP of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Exp, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute EXP of i*pi (Euler identity)', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: Math.PI } });
            const expr = new UnaryExpression(UnaryOperator.Exp, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(-1.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute LOG of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: Math.E, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Log, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute LOG10 of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 10, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Log10, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute LOG2 of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 2, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Log2, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute SQRT of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 4, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Sqrt, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(2.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute SQRT of -1 (imaginary unit)', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: -1, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Sqrt, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(1.0);
            }
        });

        it('should compute CBRT of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 8, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Cbrt, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(2.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute SINH of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Sinh, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute COSH of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Cosh, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute TANH of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Tanh, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute ASIN of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Asin, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute ACOS of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Acos, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute ATAN of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Atan, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute ASINH of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Asinh, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute ACOSH of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Acosh, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should compute ATANH of complex number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Atanh, arg, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });
    });

    describe('Error handling', () =>
    {
        it('should throw error for rounding operators with complex numbers', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3.5, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Round, arg, UnaryOperatorCategory.Mathematical);

            expect(() => expr.evaluate(context)).toThrow('Operator ROUND is not applicable to complex numbers');
        });

        it('should throw error for SGN operator with complex numbers', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Sgn, arg, UnaryOperatorCategory.Mathematical);

            expect(() => expr.evaluate(context)).toThrow('Operator SGN is not applicable to complex numbers');
        });

        it('should throw error for non-numeric operand', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.String, value: 'test' });
            const expr = new UnaryExpression(UnaryOperator.Sin, arg, UnaryOperatorCategory.Mathematical);

            expect(() => expr.evaluate(context)).toThrow('Mathematical operator SIN requires numeric operand');
        });
    });

    describe('Edge Cases', () =>
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

        it('should handle TAN of PI/2', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: Math.PI / 2 });
            const expr = new UnaryExpression(UnaryOperator.Tan, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            if (result.type === EduBasicType.Real)
            {
                expect(Math.abs(result.value)).toBeGreaterThan(1e10);
            }
        });
    });
});

