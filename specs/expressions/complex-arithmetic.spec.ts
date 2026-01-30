import { BinaryExpression, BinaryOperator, BinaryOperatorCategory } from '@/lang/expressions/binary-expression';
import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '@/lang/expressions/unary-expression';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('Complex Number Arithmetic', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('Complex Addition', () =>
    {
        it('should add two complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(4);
                expect(result.value.imaginary).toBe(6);
            }
        });

        it('should add integer to complex number', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(8);
                expect(result.value.imaginary).toBe(4);
            }
        });

        it('should add complex to integer', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(8);
                expect(result.value.imaginary).toBe(4);
            }
        });

        it('should add real to complex number', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 2.5 });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1.5, imaginary: 3 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(4.0);
                expect(result.value.imaginary).toBe(3);
            }
        });

        it('should handle negative complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: -3, imaginary: -4 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(-2);
                expect(result.value.imaginary).toBe(-2);
            }
        });

        it('should handle zero complex number', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(4);
            }
        });
    });

    describe('Complex Subtraction', () =>
    {
        it('should subtract two complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 6 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 2, imaginary: 3 } });
            const expr = new BinaryExpression(left, BinaryOperator.Subtract, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(3);
            }
        });

        it('should subtract integer from complex', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 4 } });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.Subtract, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(4);
            }
        });

        it('should subtract complex from integer', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 2, imaginary: 3 } });
            const expr = new BinaryExpression(left, BinaryOperator.Subtract, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(-3);
            }
        });
    });

    describe('Complex Multiplication', () =>
    {
        it('should multiply two complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(-5);
                expect(result.value.imaginary).toBe(10);
            }
        });

        it('should multiply integer by complex', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(6);
                expect(result.value.imaginary).toBe(8);
            }
        });

        it('should verify i * i = -1', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 1 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 1 } });
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(-1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should handle multiplication by zero', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(0);
                expect(result.value.imaginary).toBe(0);
            }
        });
    });

    describe('Complex Division', () =>
    {
        it('should divide two complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 1 } });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1.5);
                expect(result.value.imaginary).toBeCloseTo(0.5);
            }
        });

        it('should divide complex by integer', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 6, imaginary: 8 } });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(4);
            }
        });

        it('should divide integer by complex', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 2, imaginary: 0 } });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(5);
                expect(result.value.imaginary).toBe(0);
            }
        });

        it('should throw error on division by zero complex', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 3 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            expect(() => expr.evaluate(context)).toThrow('Division by zero');
        });
    });

    describe('Complex Power', () =>
    {
        it('should compute i^2 = -1', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 1 } });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(-1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should compute complex to integer power', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 1 } });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0);
                expect(result.value.imaginary).toBeCloseTo(2);
            }
        });

        it('should compute complex to real power', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 0 } });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 0.5 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should compute complex to complex power', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 2, imaginary: 0 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 1 } });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(Math.cos(Math.log(2)));
                expect(result.value.imaginary).toBeCloseTo(Math.sin(Math.log(2)));
            }
        });

        it('should handle power of zero (returns NaN due to log(0))', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(isNaN(result.value.real)).toBe(true);
                expect(isNaN(result.value.imaginary)).toBe(true);
            }
        });

        it('should compute to power of zero', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 3 } });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });
    });

    describe('Complex Mathematical Functions', () =>
    {
        it('should compute SIN of complex number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: Math.PI / 2, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Sin, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should compute COS of complex number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Cos, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should compute EXP of complex number (Euler formula)', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: Math.PI } });
            const expr = new UnaryExpression(UnaryOperator.Exp, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(-1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should compute LOG of complex number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Log, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should upcast to complex for SQRT of negative real', () =>
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

        it('should compute SQRT of complex number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: -1, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Sqrt, value, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0);
                expect(Math.abs(result.value.imaginary)).toBeCloseTo(1);
            }
        });

        it('should compute all trigonometric functions for complex', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 1 } });
            
            const sinExpr = new UnaryExpression(UnaryOperator.Sin, z, UnaryOperatorCategory.Mathematical);
            const cosExpr = new UnaryExpression(UnaryOperator.Cos, z, UnaryOperatorCategory.Mathematical);
            const tanExpr = new UnaryExpression(UnaryOperator.Tan, z, UnaryOperatorCategory.Mathematical);

            const sinResult = sinExpr.evaluate(context);
            const cosResult = cosExpr.evaluate(context);
            const tanResult = tanExpr.evaluate(context);

            expect(sinResult.type).toBe(EduBasicType.Complex);
            expect(cosResult.type).toBe(EduBasicType.Complex);
            expect(tanResult.type).toBe(EduBasicType.Complex);
        });

        it('should compute all inverse trigonometric functions for complex', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0.5, imaginary: 0.5 } });
            
            const asinExpr = new UnaryExpression(UnaryOperator.Asin, z, UnaryOperatorCategory.Mathematical);
            const acosExpr = new UnaryExpression(UnaryOperator.Acos, z, UnaryOperatorCategory.Mathematical);
            const atanExpr = new UnaryExpression(UnaryOperator.Atan, z, UnaryOperatorCategory.Mathematical);

            const asinResult = asinExpr.evaluate(context);
            const acosResult = acosExpr.evaluate(context);
            const atanResult = atanExpr.evaluate(context);

            expect(asinResult.type).toBe(EduBasicType.Complex);
            expect(acosResult.type).toBe(EduBasicType.Complex);
            expect(atanResult.type).toBe(EduBasicType.Complex);
        });

        it('should compute all hyperbolic functions for complex', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 1 } });
            
            const sinhExpr = new UnaryExpression(UnaryOperator.Sinh, z, UnaryOperatorCategory.Mathematical);
            const coshExpr = new UnaryExpression(UnaryOperator.Cosh, z, UnaryOperatorCategory.Mathematical);
            const tanhExpr = new UnaryExpression(UnaryOperator.Tanh, z, UnaryOperatorCategory.Mathematical);

            const sinhResult = sinhExpr.evaluate(context);
            const coshResult = coshExpr.evaluate(context);
            const tanhResult = tanhExpr.evaluate(context);

            expect(sinhResult.type).toBe(EduBasicType.Complex);
            expect(coshResult.type).toBe(EduBasicType.Complex);
            expect(tanhResult.type).toBe(EduBasicType.Complex);
        });

        it('should compute all inverse hyperbolic functions for complex', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0.5, imaginary: 0.5 } });
            
            const asinhExpr = new UnaryExpression(UnaryOperator.Asinh, z, UnaryOperatorCategory.Mathematical);
            const acoshExpr = new UnaryExpression(UnaryOperator.Acosh, z, UnaryOperatorCategory.Mathematical);
            const atanhExpr = new UnaryExpression(UnaryOperator.Atanh, z, UnaryOperatorCategory.Mathematical);

            const asinhResult = asinhExpr.evaluate(context);
            const acoshResult = acoshExpr.evaluate(context);
            const atanhResult = atanhExpr.evaluate(context);

            expect(asinhResult.type).toBe(EduBasicType.Complex);
            expect(acoshResult.type).toBe(EduBasicType.Complex);
            expect(atanhResult.type).toBe(EduBasicType.Complex);
        });

        it('should compute LOG10 and LOG2 for complex', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 10, imaginary: 0 } });
            
            const log10Expr = new UnaryExpression(UnaryOperator.Log10, z, UnaryOperatorCategory.Mathematical);
            const log2Expr = new UnaryExpression(UnaryOperator.Log2, z, UnaryOperatorCategory.Mathematical);

            const log10Result = log10Expr.evaluate(context);
            const log2Result = log2Expr.evaluate(context);

            expect(log10Result.type).toBe(EduBasicType.Complex);
            if (log10Result.type === EduBasicType.Complex)
            {
                expect(log10Result.value.real).toBeCloseTo(1);
                expect(log10Result.value.imaginary).toBeCloseTo(0);
            }

            expect(log2Result.type).toBe(EduBasicType.Complex);
        });

        it('should compute CBRT for complex', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 8, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Cbrt, z, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(2);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should compute ABS of complex (returns real)', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new UnaryExpression(UnaryOperator.Abs, z, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(5);
        });

        it('should throw error for functions not applicable to complex', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            
            const roundExpr = new UnaryExpression(UnaryOperator.Round, z, UnaryOperatorCategory.Mathematical);
            const floorExpr = new UnaryExpression(UnaryOperator.Floor, z, UnaryOperatorCategory.Mathematical);
            const sgnExpr = new UnaryExpression(UnaryOperator.Sgn, z, UnaryOperatorCategory.Mathematical);

            expect(() => roundExpr.evaluate(context)).toThrow('not applicable to complex numbers');
            expect(() => floorExpr.evaluate(context)).toThrow('not applicable to complex numbers');
            expect(() => sgnExpr.evaluate(context)).toThrow('not applicable to complex numbers');
        });
    });

    describe('Complex Edge Cases', () =>
    {
        it('should handle very small complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1e-10, imaginary: 1e-10 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1e-10, imaginary: 1e-10 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(2e-10);
                expect(result.value.imaginary).toBeCloseTo(2e-10);
            }
        });

        it('should handle very large complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1e10, imaginary: 1e10 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1e10, imaginary: 1e10 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(2e10);
                expect(result.value.imaginary).toBeCloseTo(2e10);
            }
        });

        it('should handle pure imaginary numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 3 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 4 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(0);
                expect(result.value.imaginary).toBe(7);
            }
        });

        it('should handle pure real complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 0 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 4, imaginary: 0 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(7);
                expect(result.value.imaginary).toBe(0);
            }
        });
    });
});
