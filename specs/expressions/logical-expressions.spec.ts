import { BinaryExpression, BinaryOperator, BinaryOperatorCategory } from '../../src/lang/expressions/binary-expression';
import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '../../src/lang/expressions/unary-expression';
import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

describe('Logical Expressions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('AND operator', () =>
    {
        it('should perform bitwise AND', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 12 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new BinaryExpression(left, BinaryOperator.And, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(8);
        });

        it('should work with TRUE and FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(trueVal, BinaryOperator.And, falseVal, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });

        it('should work with TRUE and TRUE', () =>
        {
            const trueVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const trueVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new BinaryExpression(trueVal1, BinaryOperator.And, trueVal2, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });
    });

    describe('OR operator', () =>
    {
        it('should perform bitwise OR', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 12 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new BinaryExpression(left, BinaryOperator.Or, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(14);
        });

        it('should work with TRUE and FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(trueVal, BinaryOperator.Or, falseVal, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });
    });

    describe('NOT operator', () =>
    {
        it('should perform bitwise NOT', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new UnaryExpression(UnaryOperator.Not, operand, UnaryOperatorCategory.Prefix);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(~5);
        });

        it('should NOT TRUE to give FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new UnaryExpression(UnaryOperator.Not, trueVal, UnaryOperatorCategory.Prefix);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });

        it('should NOT FALSE to give TRUE', () =>
        {
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Not, falseVal, UnaryOperatorCategory.Prefix);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should require only right operand', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new UnaryExpression(UnaryOperator.Not, operand, UnaryOperatorCategory.Prefix);

            expect(() => expr.evaluate(context)).not.toThrow();
        });

        it('should work correctly as unary operator', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new UnaryExpression(UnaryOperator.Not, operand, UnaryOperatorCategory.Prefix);

            const result = expr.evaluate(context);
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(~10);
        });
    });

    describe('XOR operator', () =>
    {
        it('should perform bitwise XOR', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 12 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new BinaryExpression(left, BinaryOperator.Xor, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(6);
        });

        it('should work with TRUE and FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(trueVal, BinaryOperator.Xor, falseVal, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should return FALSE for TRUE XOR TRUE', () =>
        {
            const trueVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const trueVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new BinaryExpression(trueVal1, BinaryOperator.Xor, trueVal2, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });
    });

    describe('NAND operator', () =>
    {
        it('should perform bitwise NAND', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 12 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new BinaryExpression(left, BinaryOperator.Nand, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(~(12 & 10));
        });

        it('should return TRUE for TRUE NAND FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(trueVal, BinaryOperator.Nand, falseVal, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should return FALSE for TRUE NAND TRUE', () =>
        {
            const trueVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const trueVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new BinaryExpression(trueVal1, BinaryOperator.Nand, trueVal2, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });
    });

    describe('NOR operator', () =>
    {
        it('should perform bitwise NOR', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 12 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new BinaryExpression(left, BinaryOperator.Nor, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(~(12 | 10));
        });

        it('should return TRUE for FALSE NOR FALSE', () =>
        {
            const falseVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const falseVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(falseVal1, BinaryOperator.Nor, falseVal2, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });
    });

    describe('XNOR operator', () =>
    {
        it('should perform bitwise XNOR', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 12 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new BinaryExpression(left, BinaryOperator.Xnor, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(~(12 ^ 10));
        });

        it('should return TRUE for TRUE XNOR TRUE', () =>
        {
            const trueVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const trueVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new BinaryExpression(trueVal1, BinaryOperator.Xnor, trueVal2, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });
    });

    describe('IMP operator', () =>
    {
        it('should perform logical implication', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new BinaryExpression(left, BinaryOperator.Imp, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(~5 | 3);
        });

        it('should return TRUE for FALSE IMP anything', () =>
        {
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const anyVal = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new BinaryExpression(falseVal, BinaryOperator.Imp, anyVal, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should return right for TRUE IMP right', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const rightVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(trueVal, BinaryOperator.Imp, rightVal, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });
    });

    describe('Real number handling', () =>
    {
        it('should floor real numbers before bitwise operations', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 12.7 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 10.3 });
            const expr = new BinaryExpression(left, BinaryOperator.And, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.value).toBe(12 & 10);
        });
    });

    describe('Edge Cases', () =>
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

        it('should handle all zeros', () =>
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

        it('should handle all ones (-1)', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const andExpr = new BinaryExpression(left, BinaryOperator.And, right, BinaryOperatorCategory.Logical);
            const orExpr = new BinaryExpression(left, BinaryOperator.Or, right, BinaryOperatorCategory.Logical);
            const xorExpr = new BinaryExpression(left, BinaryOperator.Xor, right, BinaryOperatorCategory.Logical);

            expect(andExpr.evaluate(context).value).toBe(-1);
            expect(orExpr.evaluate(context).value).toBe(-1);
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

        it('should handle IMP with false premise', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new BinaryExpression(left, BinaryOperator.Imp, right, BinaryOperatorCategory.Logical);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });
    });
});

