import { MathematicalOperatorExpression, MathematicalOperator } from '../../src/lang/expressions/mathematical/mathematical-operator-expression';
import { LiteralExpression } from '../../src/lang/expressions/literals/literal-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Sin, arg);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1.0);
        });

        it('should compute COS of real number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Real, value: 0 });
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Cos, arg);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1.0);
        });

        it('should compute EXP of real number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Real, value: 0 });
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Exp, arg);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1.0);
        });

        it('should compute LOG of real number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Real, value: Math.E });
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Log, arg);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1.0);
        });

        it('should compute SQRT of real number', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Real, value: 4 });
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Sqrt, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Sin, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Cos, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Tan, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Exp, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Exp, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Log, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Log10, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Log2, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Sqrt, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Sqrt, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Cbrt, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Sinh, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Cosh, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Tanh, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Asin, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Acos, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Atan, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Asinh, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Acosh, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Atanh, arg);

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
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Round, arg);

            expect(() => expr.evaluate(context)).toThrow('Operator ROUND is not applicable to complex numbers');
        });

        it('should throw error for SGN operator with complex numbers', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 0 } });
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Sgn, arg);

            expect(() => expr.evaluate(context)).toThrow('Operator SGN is not applicable to complex numbers');
        });

        it('should throw error for non-numeric operand', () =>
        {
            const arg = new LiteralExpression({ type: EduBasicType.String, value: 'test' });
            const expr = new MathematicalOperatorExpression(MathematicalOperator.Sin, arg);

            expect(() => expr.evaluate(context)).toThrow('Mathematical operator SIN requires numeric operand');
        });
    });
});

