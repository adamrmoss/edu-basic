import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '@/lang/expressions/unary-expression';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('Complex Number Functions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('REAL function', () =>
    {
        it('should extract real part of complex number', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: 4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Real, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(3);
        });

        it('should handle negative real part', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: -3, imaginary: 4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Real, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(-3);
        });

        it('should throw error for non-complex types', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new UnaryExpression(UnaryOperator.Real, value, UnaryOperatorCategory.Complex);

            expect(() => expr.evaluate(context)).toThrow('Complex operator REAL requires complex number operand');
        });

        it('should throw error for real number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 3.14 });
            const expr = new UnaryExpression(UnaryOperator.Real, value, UnaryOperatorCategory.Complex);

            expect(() => expr.evaluate(context)).toThrow('Complex operator REAL requires complex number operand');
        });

        it('should handle zero imaginary part', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 5, imaginary: 0 }
            });
            const expr = new UnaryExpression(UnaryOperator.Real, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(5);
        });
    });

    describe('IMAG function', () =>
    {
        it('should extract imaginary part of complex number', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: 4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Imag, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(4);
        });

        it('should handle negative imaginary part', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: -4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Imag, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(-4);
        });

        it('should throw error for non-complex numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new UnaryExpression(UnaryOperator.Imag, value, UnaryOperatorCategory.Complex);

            expect(() => expr.evaluate(context)).toThrow('Complex operator IMAG requires complex number operand');
        });

        it('should handle zero imaginary part', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 5, imaginary: 0 }
            });
            const expr = new UnaryExpression(UnaryOperator.Imag, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0);
        });
    });

    describe('CONJ function', () =>
    {
        it('should compute complex conjugate', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: 4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Conj, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(-4);
            }
        });

        it('should handle negative imaginary part', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: -4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Conj, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(4);
            }
        });

        it('should throw error for real numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 5 });
            const expr = new UnaryExpression(UnaryOperator.Conj, value, UnaryOperatorCategory.Complex);

            expect(() => expr.evaluate(context)).toThrow('Complex operator CONJ requires complex number operand');
        });

        it('should handle zero imaginary part', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 5, imaginary: 0 }
            });
            const expr = new UnaryExpression(UnaryOperator.Conj, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(5);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });
    });

    describe('CABS function', () =>
    {
        it('should compute magnitude of complex number', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: 4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Cabs, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(5);
        });

        it('should handle negative real part', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: -3, imaginary: 4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Cabs, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(5);
        });

        it('should handle negative imaginary part', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: -4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Cabs, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(5);
        });

        it('should throw error for real numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: -5 });
            const expr = new UnaryExpression(UnaryOperator.Cabs, value, UnaryOperatorCategory.Complex);

            expect(() => expr.evaluate(context)).toThrow('Complex operator CABS requires complex number operand');
        });

        it('should handle zero', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 0, imaginary: 0 }
            });
            const expr = new UnaryExpression(UnaryOperator.Cabs, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0);
        });
    });

    describe('CARG function', () =>
    {
        it('should compute argument of complex number', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 1, imaginary: 1 }
            });
            const expr = new UnaryExpression(UnaryOperator.Carg, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(Math.PI / 4);
        });

        it('should handle negative real part', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: -1, imaginary: 1 }
            });
            const expr = new UnaryExpression(UnaryOperator.Carg, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(3 * Math.PI / 4);
        });

        it('should throw error for real numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 5 });
            const expr = new UnaryExpression(UnaryOperator.Carg, value, UnaryOperatorCategory.Complex);

            expect(() => expr.evaluate(context)).toThrow('Complex operator CARG requires complex number operand');
        });

        it('should throw error for negative real numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: -5 });
            const expr = new UnaryExpression(UnaryOperator.Carg, value, UnaryOperatorCategory.Complex);

            expect(() => expr.evaluate(context)).toThrow('Complex operator CARG requires complex number operand');
        });

        it('should handle zero', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 0, imaginary: 0 }
            });
            const expr = new UnaryExpression(UnaryOperator.Carg, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0);
        });
    });

    describe('CSQRT function', () =>
    {
        it('should compute square root of complex number', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: 4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Csqrt, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                const magnitude = Math.sqrt(result.value.real ** 2 + result.value.imaginary ** 2);
                expect(magnitude).toBeCloseTo(Math.sqrt(5));
            }
        });

        it('should throw error for real numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 4 });
            const expr = new UnaryExpression(UnaryOperator.Csqrt, value, UnaryOperatorCategory.Complex);

            expect(() => expr.evaluate(context)).toThrow('Complex operator CSQRT requires complex number operand');
        });

        it('should throw error for negative real numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: -4 });
            const expr = new UnaryExpression(UnaryOperator.Csqrt, value, UnaryOperatorCategory.Complex);

            expect(() => expr.evaluate(context)).toThrow('Complex operator CSQRT requires complex number operand');
        });

        it('should handle zero', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 0, imaginary: 0 }
            });
            const expr = new UnaryExpression(UnaryOperator.Csqrt, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });
    });
});
