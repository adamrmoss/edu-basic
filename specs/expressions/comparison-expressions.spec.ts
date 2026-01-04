import { ComparisonExpression, ComparisonOperator } from '../../src/lang/expressions/comparison/comparison-expression';
import { LiteralExpression } from '../../src/lang/expressions/literals/literal-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

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
            const equal = new ComparisonExpression(left, ComparisonOperator.Equal, right);

            const result = equal.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should compare integers with Equal', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new ComparisonExpression(left, ComparisonOperator.Equal, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });

        it('should compare integers with NotEqual', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new ComparisonExpression(left, ComparisonOperator.NotEqual, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare integers with LessThan', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new ComparisonExpression(left, ComparisonOperator.LessThan, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare integers with GreaterThan', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new ComparisonExpression(left, ComparisonOperator.GreaterThan, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare integers with LessThanOrEqual', () =>
        {
            const left1 = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right1 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr1 = new ComparisonExpression(left1, ComparisonOperator.LessThanOrEqual, right1);

            expect(expr1.evaluate(context).value).toBe(-1);

            const left2 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right2 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr2 = new ComparisonExpression(left2, ComparisonOperator.LessThanOrEqual, right2);

            expect(expr2.evaluate(context).value).toBe(-1);
        });

        it('should compare integers with GreaterThanOrEqual', () =>
        {
            const left1 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right1 = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr1 = new ComparisonExpression(left1, ComparisonOperator.GreaterThanOrEqual, right1);

            expect(expr1.evaluate(context).value).toBe(-1);

            const left2 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right2 = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr2 = new ComparisonExpression(left2, ComparisonOperator.GreaterThanOrEqual, right2);

            expect(expr2.evaluate(context).value).toBe(-1);
        });

        it('should compare reals correctly', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new ComparisonExpression(left, ComparisonOperator.Equal, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare mixed integer and real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new ComparisonExpression(left, ComparisonOperator.LessThan, right);

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
            const expr = new ComparisonExpression(left, ComparisonOperator.Equal, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare strings for inequality', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'world' });
            const expr = new ComparisonExpression(left, ComparisonOperator.NotEqual, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare strings lexicographically with LessThan', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'apple' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'banana' });
            const expr = new ComparisonExpression(left, ComparisonOperator.LessThan, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should compare strings lexicographically with GreaterThan', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'zebra' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'apple' });
            const expr = new ComparisonExpression(left, ComparisonOperator.GreaterThan, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should handle case-sensitive string comparison', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new ComparisonExpression(left, ComparisonOperator.Equal, right);

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
            const expr = new ComparisonExpression(left, ComparisonOperator.Equal, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should handle negative number comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: -5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: -3 });
            const expr = new ComparisonExpression(left, ComparisonOperator.LessThan, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should handle empty string comparisons', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new ComparisonExpression(left, ComparisonOperator.Equal, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });
    });
});

