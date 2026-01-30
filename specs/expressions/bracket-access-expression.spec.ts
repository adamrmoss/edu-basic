import { EduBasicType, EduBasicValue } from '../../src/lang/edu-basic-value';
import { ExecutionContext } from '../../src/lang/execution-context';
import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { BracketAccessExpression } from '../../src/lang/expressions/special/bracket-access-expression';
import { VariableExpression } from '../../src/lang/expressions/special/variable-expression';

describe('BracketAccessExpression', () =>
{
    it('reads array elements using one-based indexing and returns defaults for out-of-range', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('a%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 10 },
                { type: EduBasicType.Integer, value: 20 }
            ]
        }, false);

        const index1 = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        );
        expect(index1.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 10 });

        const index2 = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.String, value: '2' }),
            null
        );
        expect(index2.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 20 });

        const index0 = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            null
        );
        expect(index0.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const outOfRange = new BracketAccessExpression(
            new VariableExpression('a%[]'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 99 }),
            null
        );
        expect(outOfRange.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('treats typed bases as arrays when not declared', () =>
    {
        const context = new ExecutionContext();

        const expr = new BracketAccessExpression(
            new VariableExpression('b%'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('reads structure members case-insensitively and returns defaults when missing', () =>
    {
        const context = new ExecutionContext();
        const map = new Map<string, EduBasicValue>();
        map.set('Foo$', { type: EduBasicType.String, value: 'bar' });
        context.setVariable('s', { type: EduBasicType.Structure, value: map }, false);

        const existing = new BracketAccessExpression(
            new VariableExpression('s'),
            null,
            'foo$'
        );
        expect(existing.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'bar' });

        const missingTyped = new BracketAccessExpression(
            new VariableExpression('s'),
            null,
            'missing%'
        );
        expect(missingTyped.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const missingUntyped = new BracketAccessExpression(
            new VariableExpression('s'),
            null,
            'missing'
        );
        expect(missingUntyped.evaluate(context).type).toBe(EduBasicType.Structure);
    });

    it('uses bracketIdentifier to read the index from a variable', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('i%', { type: EduBasicType.Integer, value: 2 }, false);
        context.setVariable('c$[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.String,
            value: [
                { type: EduBasicType.String, value: 'a' },
                { type: EduBasicType.String, value: 'b' }
            ]
        }, false);

        const expr = new BracketAccessExpression(
            new VariableExpression('c$[]'),
            null,
            'i%'
        );
        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'b' });
    });

    it('throws when applying brackets to a non-array, non-structure value', () =>
    {
        const context = new ExecutionContext();
        const expr = new BracketAccessExpression(
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null
        );

        expect(() => expr.evaluate(context)).toThrow('Cannot apply [ ] to INTEGER');
    });
});

