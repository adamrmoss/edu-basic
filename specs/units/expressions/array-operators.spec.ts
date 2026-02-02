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

    it('ArraySearchExpression covers errors, toString, defaults, and deep equality', () =>
    {
        const notArray = new ArraySearchExpression(
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            ArraySearchOperator.Find,
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );
        expect(() => notArray.evaluate(context)).toThrow('requires array as left operand');

        const multiDimArr = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [{ type: EduBasicType.Integer, value: 1 }] as EduBasicValue[],
            dimensions: [
                { lower: 1, length: 1, stride: 1 },
                { lower: 1, length: 1, stride: 1 }
            ]
        });
        const multiDim = new ArraySearchExpression(
            multiDimArr,
            ArraySearchOperator.Find,
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );
        expect(() => multiDim.evaluate(context)).toThrow('only supported for 1D arrays');

        const ts = new ArraySearchExpression(
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            ArraySearchOperator.Find,
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 })
        );
        expect(ts.toString()).toBe('1 FIND 2');

        const realArray = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.Real,
            value: [{ type: EduBasicType.Real, value: 1.5 }] as EduBasicValue[]
        });
        const realMissing = new ArraySearchExpression(
            realArray,
            ArraySearchOperator.Find,
            new LiteralExpression({ type: EduBasicType.Real, value: 99 })
        );
        expect(realMissing.evaluate(context)).toEqual({ type: EduBasicType.Real, value: 0.0 });

        const stringArray = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.String,
            value: [] as EduBasicValue[]
        });
        const stringMissing = new ArraySearchExpression(
            stringArray,
            ArraySearchOperator.Find,
            new LiteralExpression({ type: EduBasicType.String, value: 'x' })
        );
        expect(stringMissing.evaluate(context)).toEqual({ type: EduBasicType.String, value: '' });

        const complexArray = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.Complex,
            value: [
                { type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } }
            ] as EduBasicValue[]
        });
        const complexYes = new ArraySearchExpression(
            complexArray,
            ArraySearchOperator.Includes,
            new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } })
        );
        expect(complexYes.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: -1 });

        const complexMissing = new ArraySearchExpression(
            complexArray,
            ArraySearchOperator.Find,
            new LiteralExpression({ type: EduBasicType.Complex, value: { real: 9, imaginary: 9 } })
        );
        expect(complexMissing.evaluate(context)).toEqual({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });

        const inner1: EduBasicValue = {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 2 }
            ]
        };
        const inner2: EduBasicValue = {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 3 }
            ]
        };
        const arrayOfArrays = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.Array,
            value: [inner1, inner2] as EduBasicValue[]
        });
        const arrayYes = new ArraySearchExpression(
            arrayOfArrays,
            ArraySearchOperator.Includes,
            new LiteralExpression(inner1)
        );
        expect(arrayYes.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: -1 });

        const arrayNo = new ArraySearchExpression(
            arrayOfArrays,
            ArraySearchOperator.Includes,
            new LiteralExpression({
                type: EduBasicType.Array,
                elementType: EduBasicType.Integer,
                value: [{ type: EduBasicType.Integer, value: 1 }]
            })
        );
        expect(arrayNo.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const typeMismatch = new ArraySearchExpression(
            arrayOfArrays,
            ArraySearchOperator.Includes,
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );
        expect(typeMismatch.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const mapA = new Map<string, EduBasicValue>([
            ['x%', { type: EduBasicType.Integer, value: 1 }]
        ]);
        const mapB = new Map<string, EduBasicValue>([
            ['x%', { type: EduBasicType.Integer, value: 1 }]
        ]);
        const structArray = new LiteralExpression({
            type: EduBasicType.Array,
            elementType: EduBasicType.Structure,
            value: [{ type: EduBasicType.Structure, value: mapA }] as EduBasicValue[]
        });
        const structYes = new ArraySearchExpression(
            structArray,
            ArraySearchOperator.Includes,
            new LiteralExpression({ type: EduBasicType.Structure, value: mapB })
        );
        expect(structYes.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: -1 });

        const structNo = new ArraySearchExpression(
            structArray,
            ArraySearchOperator.Includes,
            new LiteralExpression({ type: EduBasicType.Structure, value: new Map([['y%', { type: EduBasicType.Integer, value: 1 }]]) })
        );
        expect(structNo.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const structMissing = new ArraySearchExpression(
            structArray,
            ArraySearchOperator.Find,
            new LiteralExpression({ type: EduBasicType.Structure, value: new Map() })
        );
        const structMissingValue = structMissing.evaluate(context);
        expect(structMissingValue.type).toBe(EduBasicType.Structure);
        if (structMissingValue.type === EduBasicType.Structure)
        {
            expect(structMissingValue.value.size).toBe(0);
        }

        const arrayMissing = new ArraySearchExpression(
            arrayOfArrays,
            ArraySearchOperator.Find,
            new LiteralExpression({
                type: EduBasicType.Array,
                elementType: EduBasicType.Integer,
                value: [] as EduBasicValue[]
            })
        );
        const arrayMissingValue = arrayMissing.evaluate(context);
        expect(arrayMissingValue.type).toBe(EduBasicType.Array);
        if (arrayMissingValue.type === EduBasicType.Array)
        {
            expect(arrayMissingValue.value).toEqual([]);
        }
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

    it('| | should throw for structures', () =>
    {
        const s = new LiteralExpression({
            type: EduBasicType.Structure,
            value: new Map()
        });

        const len = new BarsExpression(s);
        expect(() => len.evaluate(context)).toThrow('Cannot apply | | operator to a structure');
    });
});