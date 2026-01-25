import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '../../src/lang/expressions/unary-expression';
import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

describe('Type Conversion Functions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('INT function', () =>
    {
        it('should convert real to integer by truncation', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 3.7 });
            const expr = new UnaryExpression(UnaryOperator.Int, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(3);
        });

        it('should handle negative reals', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: -3.7 });
            const expr = new UnaryExpression(UnaryOperator.Int, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-3);
        });

        it('should handle integer input', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new UnaryExpression(UnaryOperator.Int, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(42);
        });

        it('should convert string to integer', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '42' });
            const expr = new UnaryExpression(UnaryOperator.Int, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(42);
        });

        it('should handle negative string numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '-42' });
            const expr = new UnaryExpression(UnaryOperator.Int, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-42);
        });

        it('should truncate string with decimal', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '3.7' });
            const expr = new UnaryExpression(UnaryOperator.Int, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(3);
        });

        it('should throw error for invalid string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'abc' });
            const expr = new UnaryExpression(UnaryOperator.Int, value, UnaryOperatorCategory.TypeConversion);

            expect(() => expr.evaluate(context)).toThrow();
        });

        it('should handle zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 0.0 });
            const expr = new UnaryExpression(UnaryOperator.Int, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle very large numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 1e10 });
            const expr = new UnaryExpression(UnaryOperator.Int, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(10000000000);
        });
    });

    describe('STR function', () =>
    {
        it('should convert integer to string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new UnaryExpression(UnaryOperator.Str, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('42');
        });

        it('should convert real to string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 3.14 });
            const expr = new UnaryExpression(UnaryOperator.Str, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('3.14');
        });

        it('should handle negative numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: -42 });
            const expr = new UnaryExpression(UnaryOperator.Str, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('-42');
        });

        it('should handle zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Str, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('0');
        });

        it('should handle string input', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new UnaryExpression(UnaryOperator.Str, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });

        it('should handle complex numbers', () =>
        {
            const value = new LiteralExpression({
                type: EduBasicType.Complex,
                value: { real: 3, imaginary: 4 }
            });
            const expr = new UnaryExpression(UnaryOperator.Str, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('3+4i');
        });
    });

    describe('VAL function', () =>
    {
        it('should convert string to real', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '3.14' });
            const expr = new UnaryExpression(UnaryOperator.Val, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(3.14);
        });

        it('should convert integer string to real', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '42' });
            const expr = new UnaryExpression(UnaryOperator.Val, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(42.0);
        });

        it('should handle negative strings', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '-3.14' });
            const expr = new UnaryExpression(UnaryOperator.Val, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(-3.14);
        });

        it('should handle scientific notation', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '1e5' });
            const expr = new UnaryExpression(UnaryOperator.Val, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(100000);
        });

        it('should return 0 for invalid string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'abc' });
            const expr = new UnaryExpression(UnaryOperator.Val, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0);
        });

        it('should throw error for non-string types', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new UnaryExpression(UnaryOperator.Val, value, UnaryOperatorCategory.TypeConversion);

            expect(() => expr.evaluate(context)).toThrow('VAL requires string operand');
        });
    });

    describe('HEX function', () =>
    {
        it('should convert integer to hex string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 255 });
            const expr = new UnaryExpression(UnaryOperator.Hex, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            if (result.type === EduBasicType.String)
            {
                expect(result.value.toUpperCase()).toBe('FF');
            }
        });

        it('should handle zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Hex, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('0');
        });

        it('should throw error for negative numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new UnaryExpression(UnaryOperator.Hex, value, UnaryOperatorCategory.TypeConversion);

            expect(() => expr.evaluate(context)).toThrow('HEX argument must be non-negative');
        });

        it('should convert real by truncating', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 255.7 });
            const expr = new UnaryExpression(UnaryOperator.Hex, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            if (result.type === EduBasicType.String)
            {
                expect(result.value.toUpperCase()).toBe('FF');
            }
        });

        it('should throw error for string input', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '255' });
            const expr = new UnaryExpression(UnaryOperator.Hex, value, UnaryOperatorCategory.TypeConversion);

            expect(() => expr.evaluate(context)).toThrow('Cannot convert STRING to integer');
        });
    });

    describe('BIN function', () =>
    {
        it('should convert integer to binary string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new UnaryExpression(UnaryOperator.Bin, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('101');
        });

        it('should handle zero', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new UnaryExpression(UnaryOperator.Bin, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('0');
        });

        it('should handle one', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const expr = new UnaryExpression(UnaryOperator.Bin, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('1');
        });

        it('should handle larger numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 15 });
            const expr = new UnaryExpression(UnaryOperator.Bin, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('1111');
        });

        it('should convert real by truncating', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 5.7 });
            const expr = new UnaryExpression(UnaryOperator.Bin, value, UnaryOperatorCategory.TypeConversion);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('101');
        });

        it('should throw error for string input', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '5' });
            const expr = new UnaryExpression(UnaryOperator.Bin, value, UnaryOperatorCategory.TypeConversion);

            expect(() => expr.evaluate(context)).toThrow('Cannot convert STRING to integer');
        });
    });
});
