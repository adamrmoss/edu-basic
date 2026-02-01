import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '@/lang/expressions/unary-expression';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('REALPART and IMAGPART Operators', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('REALPART function', () =>
    {
        it('should extract real part from complex number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new UnaryExpression(UnaryOperator.Realpart, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(3);
        });

        it('should return value for integer', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new UnaryExpression(UnaryOperator.Realpart, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(42);
        });

        it('should return value for real number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 3.14 });
            const expr = new UnaryExpression(UnaryOperator.Realpart, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(3.14);
        });

        it('should handle negative complex numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: -5, imaginary: -3 } });
            const expr = new UnaryExpression(UnaryOperator.Realpart, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(-5);
        });
    });

    describe('IMAGPART function', () =>
    {
        it('should extract imaginary part from complex number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new UnaryExpression(UnaryOperator.Imagpart, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(4);
        });

        it('should return 0 for integer', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new UnaryExpression(UnaryOperator.Imagpart, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0);
        });

        it('should return 0 for real number', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 3.14 });
            const expr = new UnaryExpression(UnaryOperator.Imagpart, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0);
        });

        it('should handle negative imaginary parts', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: -3 } });
            const expr = new UnaryExpression(UnaryOperator.Imagpart, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(-3);
        });

        it('should return 0 for pure real complex numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 0 } });
            const expr = new UnaryExpression(UnaryOperator.Imagpart, value, UnaryOperatorCategory.Complex);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0);
        });
    });
});
