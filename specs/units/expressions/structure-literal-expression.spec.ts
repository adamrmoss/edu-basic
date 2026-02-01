import { StructureLiteralExpression } from '@/lang/expressions/special/structure-literal-expression';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('StructureLiteralExpression', () =>
{
    it('should evaluate to an empty structure', () =>
    {
        const context = new ExecutionContext();
        const expr = new StructureLiteralExpression([]);

        const result = expr.evaluate(context);

        expect(result.type).toBe(EduBasicType.Structure);
        if (result.type !== EduBasicType.Structure)
        {
            return;
        }

        expect(result.value.size).toBe(0);
        expect(expr.toString()).toBe('{ }');
    });

    it('should evaluate members and preserve insertion order', () =>
    {
        const context = new ExecutionContext();
        const expr = new StructureLiteralExpression([
            { name: 'a%', value: new LiteralExpression({ type: EduBasicType.Integer, value: 1 }) },
            { name: 'b$', value: new LiteralExpression({ type: EduBasicType.String, value: 'x' }) },
            { name: 'c#', value: new LiteralExpression({ type: EduBasicType.Real, value: 2.5 }) },
        ]);

        const result = expr.evaluate(context);

        expect(result.type).toBe(EduBasicType.Structure);
        if (result.type !== EduBasicType.Structure)
        {
            return;
        }

        expect(result.value.size).toBe(3);
        expect(result.value.get('a%')).toEqual({ type: EduBasicType.Integer, value: 1 });
        expect(result.value.get('b$')).toEqual({ type: EduBasicType.String, value: 'x' });
        expect(result.value.get('c#')).toEqual({ type: EduBasicType.Real, value: 2.5 });
        expect(Array.from(result.value.keys())).toEqual(['a%', 'b$', 'c#']);
        expect(expr.toString()).toBe('{ a%: 1, b$: "x", c#: 2.5 }');
    });
});