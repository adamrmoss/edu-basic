import { FunctionCallExpression, FunctionName } from '../../src/lang/expressions/function-call-expression';
import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType, EduBasicValue } from '../../src/lang/edu-basic-value';

describe('Array Functions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('SIZE function', () =>
    {
        it('should return array size', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 3 }
                ],
                elementType: EduBasicType.Integer
            });
            const expr = new FunctionCallExpression(FunctionName.Size, [arr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(3);
        });

        it('should return 0 for empty array', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [],
                elementType: EduBasicType.Integer
            });
            const expr = new FunctionCallExpression(FunctionName.Size, [arr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle large arrays', () =>
        {
            const elements = Array.from({ length: 1000 }, (_, i) => ({
                type: EduBasicType.Integer,
                value: i
            }));
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: elements as EduBasicValue[],
                elementType: EduBasicType.Integer
            });
            const expr = new FunctionCallExpression(FunctionName.Size, [arr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1000);
        });
    });

    describe('EMPTY function', () =>
    {
        it('should return true for empty array', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [],
                elementType: EduBasicType.Integer
            });
            const expr = new FunctionCallExpression(FunctionName.Empty, [arr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should return false for non-empty array', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 }
                ],
                elementType: EduBasicType.Integer
            });
            const expr = new FunctionCallExpression(FunctionName.Empty, [arr]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });

    describe('LEN function', () =>
    {
        it('should return string length', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const expr = new FunctionCallExpression(FunctionName.Len, [str]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(5);
        });

        it('should return 0 for empty string', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new FunctionCallExpression(FunctionName.Len, [str]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle unicode characters', () =>
        {
            const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello 世界' });
            const expr = new FunctionCallExpression(FunctionName.Len, [str]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(8);
        });
    });

    describe('FIND function', () =>
    {
        it('should find element in array', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 3 }
                ],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new FunctionCallExpression(FunctionName.Find, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(2);
        });

        it('should return 0 when not found', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 }
                ],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Find, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should find first occurrence', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 2 }
                ],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new FunctionCallExpression(FunctionName.Find, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(2);
        });

        it('should handle empty array', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const expr = new FunctionCallExpression(FunctionName.Find, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle string arrays', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.String, value: 'apple' },
                    { type: EduBasicType.String, value: 'banana' },
                    { type: EduBasicType.String, value: 'cherry' }
                ],
                elementType: EduBasicType.String
            });
            const value = new LiteralExpression({ type: EduBasicType.String, value: 'banana' });
            const expr = new FunctionCallExpression(FunctionName.Find, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(2);
        });
    });

    describe('INDEXOF function', () =>
    {
        it('should return index of element', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 3 }
                ],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new FunctionCallExpression(FunctionName.IndexOf, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1);
        });

        it('should return -1 when not found', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 }
                ],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.IndexOf, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should return first index for duplicates', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 2 }
                ],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new FunctionCallExpression(FunctionName.IndexOf, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1);
        });
    });

    describe('INCLUDES function', () =>
    {
        it('should return true when element exists', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 3 }
                ],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new FunctionCallExpression(FunctionName.Includes, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should return false when element does not exist', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 }
                ],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new FunctionCallExpression(FunctionName.Includes, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle empty array', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [],
                elementType: EduBasicType.Integer
            });
            const value = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const expr = new FunctionCallExpression(FunctionName.Includes, [arr, value]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });

    describe('JOIN function', () =>
    {
        it('should join array elements with separator', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.String, value: 'a' },
                    { type: EduBasicType.String, value: 'b' },
                    { type: EduBasicType.String, value: 'c' }
                ],
                elementType: EduBasicType.String
            });
            const separator = new LiteralExpression({ type: EduBasicType.String, value: ',' });
            const expr = new FunctionCallExpression(FunctionName.Join, [arr, separator]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('a,b,c');
        });

        it('should handle empty separator', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.String, value: 'a' },
                    { type: EduBasicType.String, value: 'b' }
                ],
                elementType: EduBasicType.String
            });
            const separator = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const expr = new FunctionCallExpression(FunctionName.Join, [arr, separator]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('ab');
        });

        it('should handle empty array', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [],
                elementType: EduBasicType.String
            });
            const separator = new LiteralExpression({ type: EduBasicType.String, value: ',' });
            const expr = new FunctionCallExpression(FunctionName.Join, [arr, separator]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should handle single element', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.String, value: 'a' }
                ],
                elementType: EduBasicType.String
            });
            const separator = new LiteralExpression({ type: EduBasicType.String, value: ',' });
            const expr = new FunctionCallExpression(FunctionName.Join, [arr, separator]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('a');
        });

        it('should throw error for non-string array elements', () =>
        {
            const arr = new LiteralExpression({
                type: EduBasicType.Array,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 3 }
                ],
                elementType: EduBasicType.Integer
            });
            const separator = new LiteralExpression({ type: EduBasicType.String, value: '-' });
            const expr = new FunctionCallExpression(FunctionName.Join, [arr, separator]);

            expect(() => expr.evaluate(context)).toThrow();
        });
    });
});
