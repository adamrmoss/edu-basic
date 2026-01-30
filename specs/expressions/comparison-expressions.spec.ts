import { BinaryExpression, BinaryOperator, BinaryOperatorCategory } from '@/lang/expressions/binary-expression';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('Comparison Expressions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('Numeric Comparisons', () =>
    {
        it('should return -1 for true and 0 for false', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const equal = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = equal.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should compare integers with Equal', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });

        it('should compare integers with NotEqual', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new BinaryExpression(left, BinaryOperator.NotEqual, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare integers with LessThan', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new BinaryExpression(left, BinaryOperator.LessThan, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare integers with GreaterThan', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new BinaryExpression(left, BinaryOperator.GreaterThan, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare integers with LessThanOrEqual', () =>
        {
            const left1 = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right1 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr1 = new BinaryExpression(left1, BinaryOperator.LessThanOrEqual, right1, BinaryOperatorCategory.Comparison);

            expect(expr1.evaluate(context).value).toBe(-1);

            const left2 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right2 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr2 = new BinaryExpression(left2, BinaryOperator.LessThanOrEqual, right2, BinaryOperatorCategory.Comparison);

            expect(expr2.evaluate(context).value).toBe(-1);
        });

        it('should compare integers with GreaterThanOrEqual', () =>
        {
            const left1 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right1 = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr1 = new BinaryExpression(left1, BinaryOperator.GreaterThanOrEqual, right1, BinaryOperatorCategory.Comparison);

            expect(expr1.evaluate(context).value).toBe(-1);

            const left2 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right2 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr2 = new BinaryExpression(left2, BinaryOperator.GreaterThanOrEqual, right2, BinaryOperatorCategory.Comparison);

            expect(expr2.evaluate(context).value).toBe(-1);
        });

        it('should compare reals correctly', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare mixed integer and real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new BinaryExpression(left, BinaryOperator.LessThan, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });
    });

    describe('String Comparisons', () =>
    {
        it('should compare strings for equality', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare strings for inequality', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'world' });
            const expr = new BinaryExpression(left, BinaryOperator.NotEqual, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare strings lexicographically with LessThan', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'apple' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'banana' });
            const expr = new BinaryExpression(left, BinaryOperator.LessThan, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare strings lexicographically with GreaterThan', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'zebra' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'apple' });
            const expr = new BinaryExpression(left, BinaryOperator.GreaterThan, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should handle case-sensitive string comparison', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });
    });

    describe('Edge Cases', () =>
    {
        it('should handle zero comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should handle negative number comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: -5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: -3 });
            const expr = new BinaryExpression(left, BinaryOperator.LessThan, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should handle empty string comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });
    });

    describe('Edge Cases', () =>
    {
        it('should handle NaN in comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: NaN });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 5 });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle Infinity in comparisons', () =>
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

        it('should handle floating point precision issues', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 0.1 + 0.2 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 0.3 });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle very long strings', () =>
        {
            const longStr = 'a'.repeat(1000);
            const left = new LiteralExpression({ type: EduBasicType.String, value: longStr });
            const right = new LiteralExpression({ type: EduBasicType.String, value: longStr });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should handle unicode string comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: '世界' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: '世界' });
            const expr = new BinaryExpression(left, BinaryOperator.Equal, right, BinaryOperatorCategory.Comparison);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });
    });
});

