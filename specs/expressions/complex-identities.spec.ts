import { BinaryExpression, BinaryOperator, BinaryOperatorCategory } from '../../src/lang/expressions/binary-expression';
import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '../../src/lang/expressions/unary-expression';
import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

describe('Complex Number Mathematical Identities', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('Euler\'s Formula', () =>
    {
        it('should verify e^(iπ) = -1', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: Math.PI } });
            const expr = new UnaryExpression(UnaryOperator.Exp, z, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(-1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should verify e^(iπ/2) = i', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: Math.PI / 2 } });
            const expr = new UnaryExpression(UnaryOperator.Exp, z, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0);
                expect(result.value.imaginary).toBeCloseTo(1);
            }
        });

        it('should verify e^(i2π) = 1', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 2 * Math.PI } });
            const expr = new UnaryExpression(UnaryOperator.Exp, z, UnaryOperatorCategory.Mathematical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });
    });

    describe('Complex Conjugate Properties', () =>
    {
        it('should verify z * conj(z) = |z|^2', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const conjZ = new UnaryExpression(UnaryOperator.Conj, z, UnaryOperatorCategory.Complex);
            const zValue = z.evaluate(context);
            const conjZValue = conjZ.evaluate(context);
            
            const multiply = new BinaryExpression(
                new LiteralExpression(zValue),
                BinaryOperator.Multiply,
                new LiteralExpression(conjZValue),
                BinaryOperatorCategory.Arithmetic
            );

            const result = multiply.evaluate(context);
            const absZ = new UnaryExpression(UnaryOperator.Cabs, z, UnaryOperatorCategory.Complex);
            const absZValue = absZ.evaluate(context);
            const absSquared = new BinaryExpression(
                new LiteralExpression(absZValue),
                BinaryOperator.Power,
                new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                BinaryOperatorCategory.Arithmetic
            );
            const absSquaredValue = absSquared.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex && absSquaredValue.type === EduBasicType.Real)
            {
                expect(result.value.real).toBeCloseTo(absSquaredValue.value);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should verify conj(conj(z)) = z', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const conjZ = new UnaryExpression(UnaryOperator.Conj, z, UnaryOperatorCategory.Complex);
            const conjConjZ = new UnaryExpression(UnaryOperator.Conj, conjZ, UnaryOperatorCategory.Complex);

            const result = conjConjZ.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(4);
            }
        });
    });

    describe('Modulus and Argument', () =>
    {
        it('should verify |z| = sqrt(real^2 + imag^2)', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const absZ = new UnaryExpression(UnaryOperator.Cabs, z, UnaryOperatorCategory.Complex);

            const result = absZ.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(5);
        });

        it('should verify arg(i) = π/2', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 1 } });
            const argZ = new UnaryExpression(UnaryOperator.Carg, z, UnaryOperatorCategory.Complex);

            const result = argZ.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(Math.PI / 2);
        });

        it('should verify arg(-1) = π', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: -1, imaginary: 0 } });
            const argZ = new UnaryExpression(UnaryOperator.Carg, z, UnaryOperatorCategory.Complex);

            const result = argZ.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(Math.PI);
        });

        it('should verify arg(1) = 0', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 0 } });
            const argZ = new UnaryExpression(UnaryOperator.Carg, z, UnaryOperatorCategory.Complex);

            const result = argZ.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(0);
        });
    });

    describe('Square Root Properties', () =>
    {
        it('should verify sqrt(-1) = i', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: -1, imaginary: 0 } });
            const sqrtZ = new UnaryExpression(UnaryOperator.Csqrt, z, UnaryOperatorCategory.Complex);

            const result = sqrtZ.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0);
                expect(Math.abs(result.value.imaginary)).toBeCloseTo(1);
            }
        });

        it('should verify sqrt(z)^2 = z', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const sqrtZ = new UnaryExpression(UnaryOperator.Csqrt, z, UnaryOperatorCategory.Complex);
            const sqrtZValue = sqrtZ.evaluate(context);
            
            const squared = new BinaryExpression(
                new LiteralExpression(sqrtZValue),
                BinaryOperator.Power,
                new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                BinaryOperatorCategory.Arithmetic
            );

            const result = squared.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(3);
                expect(result.value.imaginary).toBeCloseTo(4);
            }
        });
    });

    describe('Logarithmic Properties', () =>
    {
        it('should verify log(e^z) = z', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 1 } });
            const expZ = new UnaryExpression(UnaryOperator.Exp, z, UnaryOperatorCategory.Mathematical);
            const expZValue = expZ.evaluate(context);
            
            const logExpZ = new UnaryExpression(UnaryOperator.Log, new LiteralExpression(expZValue), UnaryOperatorCategory.Mathematical);

            const result = logExpZ.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1);
                expect(result.value.imaginary).toBeCloseTo(1);
            }
        });

        it('should verify log(1) = 0', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 0 } });
            const logZ = new UnaryExpression(UnaryOperator.Log, z, UnaryOperatorCategory.Mathematical);

            const result = logZ.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(0);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });
    });

    describe('Trigonometric Identities', () =>
    {
        it('should verify sin^2(z) + cos^2(z) = 1 for real z', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: Math.PI / 4, imaginary: 0 } });
            const sinZ = new UnaryExpression(UnaryOperator.Sin, z, UnaryOperatorCategory.Mathematical);
            const cosZ = new UnaryExpression(UnaryOperator.Cos, z, UnaryOperatorCategory.Mathematical);
            
            const sinZValue = sinZ.evaluate(context);
            const cosZValue = cosZ.evaluate(context);
            
            const sinSquared = new BinaryExpression(
                new LiteralExpression(sinZValue),
                BinaryOperator.Power,
                new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                BinaryOperatorCategory.Arithmetic
            );
            const cosSquared = new BinaryExpression(
                new LiteralExpression(cosZValue),
                BinaryOperator.Power,
                new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                BinaryOperatorCategory.Arithmetic
            );
            
            const sum = new BinaryExpression(
                new LiteralExpression(sinSquared.evaluate(context)),
                BinaryOperator.Add,
                new LiteralExpression(cosSquared.evaluate(context)),
                BinaryOperatorCategory.Arithmetic
            );

            const result = sum.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1);
                expect(result.value.imaginary).toBeCloseTo(0);
            }
        });

        it('should verify tan(z) = sin(z) / cos(z)', () =>
        {
            const z = new LiteralExpression({ type: EduBasicType.Complex, value: { real: Math.PI / 6, imaginary: 0 } });
            const sinZ = new UnaryExpression(UnaryOperator.Sin, z, UnaryOperatorCategory.Mathematical);
            const cosZ = new UnaryExpression(UnaryOperator.Cos, z, UnaryOperatorCategory.Mathematical);
            const tanZ = new UnaryExpression(UnaryOperator.Tan, z, UnaryOperatorCategory.Mathematical);
            
            const sinZValue = sinZ.evaluate(context);
            const cosZValue = cosZ.evaluate(context);
            const tanZValue = tanZ.evaluate(context);
            
            const quotient = new BinaryExpression(
                new LiteralExpression(sinZValue),
                BinaryOperator.Divide,
                new LiteralExpression(cosZValue),
                BinaryOperatorCategory.Arithmetic
            );

            const result = quotient.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex && tanZValue.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(tanZValue.value.real);
                expect(result.value.imaginary).toBeCloseTo(tanZValue.value.imaginary);
            }
        });
    });

    describe('Comparison Operator Restrictions', () =>
    {
        it('should throw error when comparing complex numbers with =', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            expect(() => expr.evaluate(context)).toThrow('Comparison operators are not applicable to complex numbers');
        });

        it('should throw error when comparing complex with real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 0 } });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3 });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            expect(() => expr.evaluate(context)).toThrow('Comparison operators are not applicable to complex numbers');
        });

        it('should throw error for all comparison operators with complex', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } });
            
            const operators = [
                BinaryOperator.Equal,
                BinaryOperator.NotEqual,
                BinaryOperator.LessThan,
                BinaryOperator.GreaterThan,
                BinaryOperator.LessThanOrEqual,
                BinaryOperator.GreaterThanOrEqual
            ];

            operators.forEach(op =>
            {
                const expr = new BinaryExpression(left, op, right, BinaryOperatorCategory.Comparison);
                expect(() => expr.evaluate(context)).toThrow('Comparison operators are not applicable to complex numbers');
            });
        });
    });

    describe('Type Coercion with Complex', () =>
    {
        it('should coerce integer to complex in arithmetic', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(15);
                expect(result.value.imaginary).toBe(20);
            }
        });

        it('should coerce real to complex in arithmetic', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 2.5 });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 1 } });
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(2.5);
                expect(result.value.imaginary).toBeCloseTo(2.5);
            }
        });
    });
});
