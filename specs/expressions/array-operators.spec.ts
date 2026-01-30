import {
    ArraySearchExpression,
    ArraySearchOperator,
    BarsExpression,
    JoinOperatorExpression,
} from '@/lang/expressions/operators';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType, EduBasicValue } from '@/lang/edu-basic-value';

describe('Array operators', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    it('FIND should return matching element (or default if not found)', () =>
    {
        const arr = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 2 },
                { type: EduBasicType.Integer, value: 3 },
            ] as EduBasicValue[]
        });

        const found = new ArraySearchExpression(
            arr,
            ArraySearchOperator.Find,
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 })
        );
        expect(found.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 2 });

        const missing = new ArraySearchExpression(
            arr,
            ArraySearchOperator.Find,
            new LiteralExpression({ type: EduBasicType.Integer, value: 9 })
        );
        expect(missing.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('INDEXOF should return 1-based index (or 0 if not found)', () =>
    {
        const arr = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 2 },
            ] as EduBasicValue[]
        });

        const indexOf = new ArraySearchExpression(
            arr,
            ArraySearchOperator.IndexOf,
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 })
        );
        expect(indexOf.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 2 });

        const missing = new ArraySearchExpression(
            arr,
            ArraySearchOperator.IndexOf,
            new LiteralExpression({ type: EduBasicType.Integer, value: 9 })
        );
        expect(missing.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('INCLUDES should return TRUE% (-1) if found, else FALSE% (0)', () =>
    {
        const arr = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 2 },
            ] as EduBasicValue[]
        });

        const yes = new ArraySearchExpression(
            arr,
            ArraySearchOperator.Includes,
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 })
        );
        expect(yes.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: -1 });

        const no = new ArraySearchExpression(
            arr,
            ArraySearchOperator.Includes,
            new LiteralExpression({ type: EduBasicType.Integer, value: 9 })
        );
        expect(no.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('JOIN should join string arrays with a separator', () =>
    {
        const arr = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.String,
            value: [
                { type: EduBasicType.String, value: 'Alice' },
                { type: EduBasicType.String, value: 'Bob' },
            ] as EduBasicValue[]
        });

        const sep = new LiteralExpression({ type: EduBasicType.String, value: ', ' });
        const join = new JoinOperatorExpression(arr, sep);
        expect(join.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'Alice, Bob' });
    });

    it('| | should return array length', () =>
    {
        const arr = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 2 },
                { type: EduBasicType.Integer, value: 3 },
            ] as EduBasicValue[]
        });

        const len = new BarsExpression(arr);
        expect(len.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 3 });
    });
});

