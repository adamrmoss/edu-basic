import { EduBasicType, EduBasicValue } from '@/lang/edu-basic-value';
import { ExecutionContext } from '@/lang/execution-context';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { MultiIndexBracketAccessExpression, StructureMemberExpression, VariableExpression } from '@/lang/expressions/special';

describe('MultiIndexBracketAccessExpression', () =>
{
    it('reads from a typed variable base by inferring the rank suffix', () =>
    {
        const context = new ExecutionContext();

        context.setVariable('a%[,]'
            , {
                type: EduBasicType.Array,
                elementType: EduBasicType.Integer,
                dimensions: [
                    { lower: 1, length: 2, stride: 3 },
                    { lower: 1, length: 3, stride: 1 }
                ],
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 3 },
                    { type: EduBasicType.Integer, value: 4 },
                    { type: EduBasicType.Integer, value: 5 },
                    { type: EduBasicType.Integer, value: 6 }
                ]
            } as any
            , false
        );

        const expr = new MultiIndexBracketAccessExpression(
            new VariableExpression('a%'),
            [
                new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                new LiteralExpression({ type: EduBasicType.String, value: '3' })
            ]
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 6 });
        expect(expr.toString()).toBe('a%[2, "3"]');
    });

    it('supports real and complex indices (truncated)', () =>
    {
        const context = new ExecutionContext();

        context.setVariable('a%[,]'
            , {
                type: EduBasicType.Array,
                elementType: EduBasicType.Integer,
                dimensions: [
                    { lower: 1, length: 1, stride: 1 },
                    { lower: 1, length: 1, stride: 1 }
                ],
                value: [
                    { type: EduBasicType.Integer, value: 123 }
                ]
            } as any
            , false
        );

        const expr = new MultiIndexBracketAccessExpression(
            new VariableExpression('a%[,]'),
            [
                new LiteralExpression({ type: EduBasicType.Real, value: 1.9 }),
                new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1.1, imaginary: 999 } })
            ]
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 123 });
    });

    it('throws when an index cannot be converted to a one-based integer', () =>
    {
        const context = new ExecutionContext();

        context.setVariable('a%[,]'
            , {
                type: EduBasicType.Array,
                elementType: EduBasicType.Integer,
                dimensions: [
                    { lower: 1, length: 1, stride: 1 },
                    { lower: 1, length: 1, stride: 1 }
                ],
                value: [
                    { type: EduBasicType.Integer, value: 123 }
                ]
            } as any
            , false
        );

        const badStringIndex = new MultiIndexBracketAccessExpression(
            new VariableExpression('a%[,]'),
            [
                new LiteralExpression({ type: EduBasicType.String, value: 'x' }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
            ]
        );
        expect(() => badStringIndex.evaluate(context)).toThrow('Array index is out of bounds');

        const badTypeIndex = new MultiIndexBracketAccessExpression(
            new VariableExpression('a%[,]'),
            [
                new LiteralExpression({ type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
            ]
        );
        expect(() => badTypeIndex.evaluate(context)).toThrow('Array index is out of bounds');
    });

    it('throws when the number of indices does not match the dimension count', () =>
    {
        const context = new ExecutionContext();

        context.setVariable('a%[,]'
            , {
                type: EduBasicType.Array,
                elementType: EduBasicType.Integer,
                dimensions: [
                    { lower: 1, length: 2, stride: 2 },
                    { lower: 1, length: 2, stride: 1 }
                ],
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 },
                    { type: EduBasicType.Integer, value: 3 },
                    { type: EduBasicType.Integer, value: 4 }
                ]
            } as any
            , false
        );

        const expr = new MultiIndexBracketAccessExpression(
            new VariableExpression('a%[,]'),
            [
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
            ]
        );

        expect(() => expr.evaluate(context))
            .toThrow('MultiIndexBracketAccessExpression: expected 2 indices, got 1');
    });

    it('returns a default when the target slot is nullish', () =>
    {
        const context = new ExecutionContext();

        context.setVariable('r#[,]'
            , {
                type: EduBasicType.Array,
                elementType: EduBasicType.Real,
                dimensions: [
                    { lower: 1, length: 1, stride: 1 },
                    { lower: 1, length: 1, stride: 1 }
                ],
                value: [undefined as any]
            } as any
            , false
        );

        const expr = new MultiIndexBracketAccessExpression(
            new VariableExpression('r#[,]'),
            [
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
            ]
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Real, value: 0.0 });
    });

    it('infers structure member arrays using rank suffix and case-insensitive member lookup', () =>
    {
        const context = new ExecutionContext();

        const map = new Map<string, EduBasicValue>();
        map.set('M%[,]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            dimensions: [
                { lower: 1, length: 2, stride: 2 },
                { lower: 1, length: 2, stride: 1 }
            ],
            value: [
                { type: EduBasicType.Integer, value: 10 },
                { type: EduBasicType.Integer, value: 20 },
                { type: EduBasicType.Integer, value: 30 },
                { type: EduBasicType.Integer, value: 40 }
            ]
        } as any);

        context.setVariable('s', { type: EduBasicType.Structure, value: map }, false);

        const expr = new MultiIndexBracketAccessExpression(
            new StructureMemberExpression(new VariableExpression('s'), 'm%'),
            [
                new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
            ]
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 30 });
    });

    it('throws when the inferred array member exists only as an undimensioned default', () =>
    {
        const context = new ExecutionContext();
        context.setVariable('s', { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() }, false);

        const expr = new MultiIndexBracketAccessExpression(
            new StructureMemberExpression(new VariableExpression('s'), 'missing%'),
            [
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
            ]
        );

        expect(() => expr.evaluate(context))
            .toThrow('MultiIndexBracketAccessExpression: array is not dimensioned');
    });
});

