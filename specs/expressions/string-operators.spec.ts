import {
    BarsExpression,
    EndsWithOperatorExpression,
    InstrOperatorExpression,
    LeftOperatorExpression,
    MidOperatorExpression,
    ReplaceOperatorExpression,
    RightOperatorExpression,
    StartsWithOperatorExpression,
} from '../../src/lang/expressions/operators';
import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

describe('String operators', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    it('LEFT should return left portion', () =>
    {
        const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
        const n = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });

        const expr = new LeftOperatorExpression(str, n);
        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'Hello' });
    });

    it('RIGHT should return right portion', () =>
    {
        const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
        const n = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });

        const expr = new RightOperatorExpression(str, n);
        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'World' });
    });

    it('MID should return substring using 1-based inclusive positions', () =>
    {
        const str = new LiteralExpression({ type: EduBasicType.String, value: 'Hello World' });
        const start = new LiteralExpression({ type: EduBasicType.Integer, value: 7 });
        const end = new LiteralExpression({ type: EduBasicType.Integer, value: 11 });

        const expr = new MidOperatorExpression(str, start, end);
        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'World' });
    });

    it('INSTR should return 1-based position (or 0 if not found), with optional FROM', () =>
    {
        const haystack = new LiteralExpression({ type: EduBasicType.String, value: 'Hello world' });
        const needle = new LiteralExpression({ type: EduBasicType.String, value: 'world' });

        const found = new InstrOperatorExpression(haystack, needle, null);
        expect(found.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 7 });

        const notFound = new InstrOperatorExpression(haystack, new LiteralExpression({ type: EduBasicType.String, value: 'zzz' }), null);
        expect(notFound.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });

        const from = new InstrOperatorExpression(
            haystack,
            new LiteralExpression({ type: EduBasicType.String, value: 'o' }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 })
        );
        expect(from.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 5 });
    });

    it('REPLACE should replace all occurrences', () =>
    {
        const str = new LiteralExpression({ type: EduBasicType.String, value: 'a.a.a' });
        const oldValue = new LiteralExpression({ type: EduBasicType.String, value: '.' });
        const newValue = new LiteralExpression({ type: EduBasicType.String, value: '!' });

        const expr = new ReplaceOperatorExpression(str, oldValue, newValue);
        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'a!a!a' });
    });

    it('STARTSWITH and ENDSWITH should return TRUE% (-1) or FALSE% (0)', () =>
    {
        const str = new LiteralExpression({ type: EduBasicType.String, value: 'abc' });

        expect(new StartsWithOperatorExpression(str, new LiteralExpression({ type: EduBasicType.String, value: 'a' })).evaluate(context))
            .toEqual({ type: EduBasicType.Integer, value: -1 });
        expect(new StartsWithOperatorExpression(str, new LiteralExpression({ type: EduBasicType.String, value: 'z' })).evaluate(context))
            .toEqual({ type: EduBasicType.Integer, value: 0 });

        expect(new EndsWithOperatorExpression(str, new LiteralExpression({ type: EduBasicType.String, value: 'c' })).evaluate(context))
            .toEqual({ type: EduBasicType.Integer, value: -1 });
        expect(new EndsWithOperatorExpression(str, new LiteralExpression({ type: EduBasicType.String, value: 'z' })).evaluate(context))
            .toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('| | should return string length', () =>
    {
        const expr = new BarsExpression(new LiteralExpression({ type: EduBasicType.String, value: 'Hello' }));
        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 5 });
    });
});

