import { LogicalExpression, LogicalOperator } from '../../src/lang/expressions/logical/logical-expression';
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
            const expr = new LogicalExpression(left, LogicalOperator.And, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(8);
        });

        it('should work with TRUE and FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new LogicalExpression(trueVal, LogicalOperator.And, falseVal);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });

        it('should work with TRUE and TRUE', () =>
        {
            const trueVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const trueVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new LogicalExpression(trueVal1, LogicalOperator.And, trueVal2);

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
            const expr = new LogicalExpression(left, LogicalOperator.Or, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(14);
        });

        it('should work with TRUE and FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new LogicalExpression(trueVal, LogicalOperator.Or, falseVal);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });
    });

    describe('NOT operator', () =>
    {
        it('should perform bitwise NOT', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new LogicalExpression(null, LogicalOperator.Not, operand);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(~5);
        });

        it('should NOT TRUE to give FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new LogicalExpression(null, LogicalOperator.Not, trueVal);

            const result = expr.evaluate(context);

            expect(result.value).toBe(0);
        });

        it('should NOT FALSE to give TRUE', () =>
        {
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new LogicalExpression(null, LogicalOperator.Not, falseVal);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should require only right operand', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new LogicalExpression(null, LogicalOperator.Not, operand);

            expect(() => expr.evaluate(context)).not.toThrow();
        });

        it('should throw error if used with left operand on other operators', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new LogicalExpression(null, LogicalOperator.And, operand);

            expect(() => expr.evaluate(context)).toThrow('requires left operand');
        });
    });

    describe('XOR operator', () =>
    {
        it('should perform bitwise XOR', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 12 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new LogicalExpression(left, LogicalOperator.Xor, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(6);
        });

        it('should work with TRUE and FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new LogicalExpression(trueVal, LogicalOperator.Xor, falseVal);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should return FALSE for TRUE XOR TRUE', () =>
        {
            const trueVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const trueVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new LogicalExpression(trueVal1, LogicalOperator.Xor, trueVal2);

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
            const expr = new LogicalExpression(left, LogicalOperator.Nand, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(~(12 & 10));
        });

        it('should return TRUE for TRUE NAND FALSE', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new LogicalExpression(trueVal, LogicalOperator.Nand, falseVal);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should return FALSE for TRUE NAND TRUE', () =>
        {
            const trueVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const trueVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new LogicalExpression(trueVal1, LogicalOperator.Nand, trueVal2);

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
            const expr = new LogicalExpression(left, LogicalOperator.Nor, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(~(12 | 10));
        });

        it('should return TRUE for FALSE NOR FALSE', () =>
        {
            const falseVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const falseVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new LogicalExpression(falseVal1, LogicalOperator.Nor, falseVal2);

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
            const expr = new LogicalExpression(left, LogicalOperator.Xnor, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(~(12 ^ 10));
        });

        it('should return TRUE for TRUE XNOR TRUE', () =>
        {
            const trueVal1 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const trueVal2 = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new LogicalExpression(trueVal1, LogicalOperator.Xnor, trueVal2);

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
            const expr = new LogicalExpression(left, LogicalOperator.Imp, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(~5 | 3);
        });

        it('should return TRUE for FALSE IMP anything', () =>
        {
            const falseVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const anyVal = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new LogicalExpression(falseVal, LogicalOperator.Imp, anyVal);

            const result = expr.evaluate(context);

            expect(result.value).toBe(-1);
        });

        it('should return right for TRUE IMP right', () =>
        {
            const trueVal = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const rightVal = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new LogicalExpression(trueVal, LogicalOperator.Imp, rightVal);

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
            const expr = new LogicalExpression(left, LogicalOperator.And, right);

            const result = expr.evaluate(context);

            expect(result.value).toBe(12 & 10);
        });
    });
});

