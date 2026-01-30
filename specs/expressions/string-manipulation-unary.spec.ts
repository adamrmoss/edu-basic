import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '@/lang/expressions/unary-expression';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('String Manipulation Unary Functions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('ASC function', () =>
    {
        it('should return ASCII code of first character', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'A' });
            const expr = new UnaryExpression(UnaryOperator.Asc, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(65);
        });

        it('should return ASCII code of first character in string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const expr = new UnaryExpression(UnaryOperator.Asc, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(72);
        });

        it('should return 0 for empty string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new UnaryExpression(UnaryOperator.Asc, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle unicode characters', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '世界' });
            const expr = new UnaryExpression(UnaryOperator.Asc, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBeGreaterThan(0);
        });

        it('should throw error for non-string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 65 });
            const expr = new UnaryExpression(UnaryOperator.Asc, value, UnaryOperatorCategory.StringManipulation);

            expect(() => expr.evaluate(context)).toThrow();
        });
    });

    describe('CHR function', () =>
    {
        it('should convert ASCII code to character', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 65 });
            const expr = new UnaryExpression(UnaryOperator.Chr, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('A');
        });

        it('should handle lowercase letters', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 97 });
            const expr = new UnaryExpression(UnaryOperator.Chr, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('a');
        });

        it('should handle numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 48 });
            const expr = new UnaryExpression(UnaryOperator.Chr, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('0');
        });

        it('should handle special characters', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 32 });
            const expr = new UnaryExpression(UnaryOperator.Chr, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe(' ');
        });

        it('should throw error for out of range values', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new UnaryExpression(UnaryOperator.Chr, value, UnaryOperatorCategory.StringManipulation);

            expect(() => expr.evaluate(context)).toThrow();
        });

        it('should throw error for values above 0xFFFF', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 0x10000 });
            const expr = new UnaryExpression(UnaryOperator.Chr, value, UnaryOperatorCategory.StringManipulation);

            expect(() => expr.evaluate(context)).toThrow();
        });

        it('should accept real numbers', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Real, value: 65.7 });
            const expr = new UnaryExpression(UnaryOperator.Chr, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('A');
        });
    });

    describe('UCASE function', () =>
    {
        it('should convert string to uppercase', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new UnaryExpression(UnaryOperator.Ucase, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('HELLO');
        });

        it('should handle already uppercase', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'HELLO' });
            const expr = new UnaryExpression(UnaryOperator.Ucase, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('HELLO');
        });

        it('should handle mixed case', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const expr = new UnaryExpression(UnaryOperator.Ucase, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('HELLO WORLD');
        });

        it('should handle empty string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new UnaryExpression(UnaryOperator.Ucase, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should throw error for non-string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new UnaryExpression(UnaryOperator.Ucase, value, UnaryOperatorCategory.StringManipulation);

            expect(() => expr.evaluate(context)).toThrow();
        });
    });

    describe('LCASE function', () =>
    {
        it('should convert string to lowercase', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'HELLO' });
            const expr = new UnaryExpression(UnaryOperator.Lcase, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });

        it('should handle already lowercase', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new UnaryExpression(UnaryOperator.Lcase, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });

        it('should handle mixed case', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const expr = new UnaryExpression(UnaryOperator.Lcase, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello world');
        });

        it('should handle empty string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new UnaryExpression(UnaryOperator.Lcase, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });
    });

    describe('LTRIM function', () =>
    {
        it('should remove leading whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '  hello' });
            const expr = new UnaryExpression(UnaryOperator.Ltrim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });

        it('should handle tabs and newlines', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '\t\nhello' });
            const expr = new UnaryExpression(UnaryOperator.Ltrim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });

        it('should not remove trailing whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '  hello  ' });
            const expr = new UnaryExpression(UnaryOperator.Ltrim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello  ');
        });

        it('should handle string with no leading whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new UnaryExpression(UnaryOperator.Ltrim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });

        it('should handle all whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '   ' });
            const expr = new UnaryExpression(UnaryOperator.Ltrim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });
    });

    describe('RTRIM function', () =>
    {
        it('should remove trailing whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'hello  ' });
            const expr = new UnaryExpression(UnaryOperator.Rtrim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });

        it('should not remove leading whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '  hello  ' });
            const expr = new UnaryExpression(UnaryOperator.Rtrim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('  hello');
        });

        it('should handle string with no trailing whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new UnaryExpression(UnaryOperator.Rtrim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });
    });

    describe('TRIM function', () =>
    {
        it('should remove leading and trailing whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '  hello  ' });
            const expr = new UnaryExpression(UnaryOperator.Trim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });

        it('should not remove internal whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '  hello world  ' });
            const expr = new UnaryExpression(UnaryOperator.Trim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello world');
        });

        it('should handle string with no whitespace', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new UnaryExpression(UnaryOperator.Trim, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });
    });

    describe('REVERSE function', () =>
    {
        it('should reverse string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new UnaryExpression(UnaryOperator.Reverse, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('olleh');
        });

        it('should handle empty string', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new UnaryExpression(UnaryOperator.Reverse, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should handle single character', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'a' });
            const expr = new UnaryExpression(UnaryOperator.Reverse, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('a');
        });

        it('should handle palindrome', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'racecar' });
            const expr = new UnaryExpression(UnaryOperator.Reverse, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('racecar');
        });

        it('should handle unicode characters', () =>
        {
            const value = new LiteralExpression({ type: EduBasicType.String, value: '世界' });
            const expr = new UnaryExpression(UnaryOperator.Reverse, value, UnaryOperatorCategory.StringManipulation);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('界世');
        });
    });
});
