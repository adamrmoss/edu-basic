import { FunctionCallExpression, FunctionName } from '../../src/lang/expressions/function-call-expression';
import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

describe('String Functions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('LEFT function', () =>
    {
        it('should extract left substring', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Left, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hello');
        });

        it('should handle zero length', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new FunctionCallExpression(FunctionName.Left, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should handle length greater than string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hi' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new FunctionCallExpression(FunctionName.Left, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hi');
        });

        it('should handle empty string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Left, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should handle negative length by returning empty string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const expr = new FunctionCallExpression(FunctionName.Left, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should accept real number for length', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const n = new LiteralExpression({ type: EduBasicType.Real, value: 5.7 });
            const expr = new FunctionCallExpression(FunctionName.Left, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hello');
        });
    });

    describe('RIGHT function', () =>
    {
        it('should extract right substring', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Right, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('World');
        });

        it('should handle zero length', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new FunctionCallExpression(FunctionName.Right, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should handle length greater than string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hi' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new FunctionCallExpression(FunctionName.Right, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hi');
        });

        it('should handle empty string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Right, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });
    });

    describe('MID function', () =>
    {
        it('should extract middle substring', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const start = new LiteralExpression({ type: EduBasicType.Integer, value: 7 });
            const length = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Mid, [str, start, length]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('World');
        });

        it('should handle start at beginning', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const start = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const length = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new FunctionCallExpression(FunctionName.Mid, [str, start, length]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hel');
        });

        it('should handle length extending beyond string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const start = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const length = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new FunctionCallExpression(FunctionName.Mid, [str, start, length]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('llo');
        });

        it('should handle zero length', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const start = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const length = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new FunctionCallExpression(FunctionName.Mid, [str, start, length]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should handle start beyond string length', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const start = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const length = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Mid, [str, start, length]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should handle negative start by clamping to 1', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const start = new LiteralExpression({ type: EduBasicType.Integer, value: -1 });
            const length = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Mid, [str, start, length]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hello');
        });

        it('should handle zero start by clamping to 1', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const start = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const length = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Mid, [str, start, length]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hello');
        });
    });

    describe('INSTR function', () =>
    {
        it('should find substring at start', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const search = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const expr = new FunctionCallExpression(FunctionName.Instr, [str, search]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1);
        });

        it('should find substring in middle', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const search = new LiteralExpression({ type: EduBasicType.String, value: 'World' });
            const expr = new FunctionCallExpression(FunctionName.Instr, [str, search]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(7);
        });

        it('should return 0 when not found', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const search = new LiteralExpression({ type: EduBasicType.String, value: 'xyz' });
            const expr = new FunctionCallExpression(FunctionName.Instr, [str, search]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle empty search string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const search = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new FunctionCallExpression(FunctionName.Instr, [str, search]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1);
        });

        it('should handle empty string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const search = new LiteralExpression({ type: EduBasicType.String, value: 'x' });
            const expr = new FunctionCallExpression(FunctionName.Instr, [str, search]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should be case-sensitive', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const search = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new FunctionCallExpression(FunctionName.Instr, [str, search]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });

    describe('REPLACE function', () =>
    {
        it('should replace first occurrence', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const oldStr = new LiteralExpression({ type: EduBasicType.String, value: 'World' });
            const newStr = new LiteralExpression({ type: EduBasicType.String, value: 'Universe' });
            const expr = new FunctionCallExpression(FunctionName.Replace, [str, oldStr, newStr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hello Universe');
        });

        it('should replace all occurrences', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'foo bar foo' });
            const oldStr = new LiteralExpression({ type: EduBasicType.String, value: 'foo' });
            const newStr = new LiteralExpression({ type: EduBasicType.String, value: 'baz' });
            const expr = new FunctionCallExpression(FunctionName.Replace, [str, oldStr, newStr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('baz bar baz');
        });

        it('should return original when not found', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const oldStr = new LiteralExpression({ type: EduBasicType.String, value: 'xyz' });
            const newStr = new LiteralExpression({ type: EduBasicType.String, value: 'abc' });
            const expr = new FunctionCallExpression(FunctionName.Replace, [str, oldStr, newStr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hello');
        });

        it('should handle empty old string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const oldStr = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const newStr = new LiteralExpression({ type: EduBasicType.String, value: 'x' });
            const expr = new FunctionCallExpression(FunctionName.Replace, [str, oldStr, newStr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('xHxexlxlxox');
        });

        it('should handle empty new string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const oldStr = new LiteralExpression({ type: EduBasicType.String, value: 'l' });
            const newStr = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new FunctionCallExpression(FunctionName.Replace, [str, oldStr, newStr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Heo');
        });
    });

    describe('STARTSWITH function', () =>
    {
        it('should return true when string starts with prefix', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const prefix = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const expr = new FunctionCallExpression(FunctionName.Startswith, [str, prefix]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should return false when string does not start with prefix', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const prefix = new LiteralExpression({ type: EduBasicType.String, value: 'World' });
            const expr = new FunctionCallExpression(FunctionName.Startswith, [str, prefix]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should return true for empty prefix', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const prefix = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new FunctionCallExpression(FunctionName.Startswith, [str, prefix]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should be case-sensitive', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const prefix = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });
            const expr = new FunctionCallExpression(FunctionName.Startswith, [str, prefix]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });

    describe('ENDSWITH function', () =>
    {
        it('should return true when string ends with suffix', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const suffix = new LiteralExpression({ type: EduBasicType.String, value: 'World' });
            const expr = new FunctionCallExpression(FunctionName.Endswith, [str, suffix]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should return false when string does not end with suffix', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
            const suffix = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const expr = new FunctionCallExpression(FunctionName.Endswith, [str, suffix]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should return true for empty suffix', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const suffix = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new FunctionCallExpression(FunctionName.Endswith, [str, suffix]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should be case-sensitive', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const suffix = new LiteralExpression({ type: EduBasicType.String, value: 'HELLO' });
            const expr = new FunctionCallExpression(FunctionName.Endswith, [str, suffix]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });

    describe('Edge Cases', () =>
    {
        it('should handle unicode characters', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello 世界' });
            const n = new LiteralExpression({ type: EduBasicType.Integer, value: 7 });
            const expr = new FunctionCallExpression(FunctionName.Left, [str, n]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hello 世');
        });

        it('should handle special characters', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello\nWorld\tTest' });
            const search = new LiteralExpression({ type: EduBasicType.String, value: '\n' });
            const expr = new FunctionCallExpression(FunctionName.Instr, [str, search]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(6);
        });
    });
});
