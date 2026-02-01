import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { StructureMemberExpression } from '@/lang/expressions/special/structure-member-expression';

describe('StructureMemberExpression', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    it('should throw when base expression is not a structure', () =>
    {
        const base = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
        const expr = new StructureMemberExpression(base, 'x%');

        expect(() =>
        {
            expr.evaluate(context);
        }).toThrow('StructureMemberExpression: base expression is not a structure');
    });

    it('should return direct member when present', () =>
    {
        const map = new Map<string, any>();
        map.set('x%', { type: EduBasicType.Integer, value: 123 });

        const base = new LiteralExpression({ type: EduBasicType.Structure, value: map });
        const expr = new StructureMemberExpression(base, 'x%');

        const value = expr.evaluate(context);
        expect(value.type).toBe(EduBasicType.Integer);
        expect(value.value).toBe(123);
    });

    it('should return case-insensitive member match', () =>
    {
        const map = new Map<string, any>();
        map.set('Foo$', { type: EduBasicType.String, value: 'ok' });

        const base = new LiteralExpression({ type: EduBasicType.Structure, value: map });
        const expr = new StructureMemberExpression(base, 'foo$');

        const value = expr.evaluate(context);
        expect(value.type).toBe(EduBasicType.String);
        expect(value.value).toBe('ok');
    });

    it('should return default values based on member name sigils', () =>
    {
        const map = new Map<string, any>();
        const base = new LiteralExpression({ type: EduBasicType.Structure, value: map });

        const intValue = new StructureMemberExpression(base, 'a%').evaluate(context);
        expect(intValue).toEqual({ type: EduBasicType.Integer, value: 0 });

        const realValue = new StructureMemberExpression(base, 'a#').evaluate(context);
        expect(realValue.type).toBe(EduBasicType.Real);
        expect(realValue.value).toBe(0.0);

        const stringValue = new StructureMemberExpression(base, 'a$').evaluate(context);
        expect(stringValue).toEqual({ type: EduBasicType.String, value: '' });

        const complexValue = new StructureMemberExpression(base, 'a&').evaluate(context);
        expect(complexValue).toEqual({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });

        const structValue = new StructureMemberExpression(base, 'a').evaluate(context);
        expect(structValue.type).toBe(EduBasicType.Structure);

        const intArray = new StructureMemberExpression(base, 'arr%[]').evaluate(context);
        expect(intArray.type).toBe(EduBasicType.Array);
        expect(intArray.elementType).toBe(EduBasicType.Integer);
        expect(intArray.value).toEqual([]);

        const realArray = new StructureMemberExpression(base, 'arr#[]').evaluate(context);
        expect(realArray.type).toBe(EduBasicType.Array);
        expect(realArray.elementType).toBe(EduBasicType.Real);
        expect(realArray.value).toEqual([]);

        const stringArray = new StructureMemberExpression(base, 'arr$[]').evaluate(context);
        expect(stringArray.type).toBe(EduBasicType.Array);
        expect(stringArray.elementType).toBe(EduBasicType.String);
        expect(stringArray.value).toEqual([]);

        const complexArray = new StructureMemberExpression(base, 'arr&[]').evaluate(context);
        expect(complexArray.type).toBe(EduBasicType.Array);
        expect(complexArray.elementType).toBe(EduBasicType.Complex);
        expect(complexArray.value).toEqual([]);

        const structArray = new StructureMemberExpression(base, 'arr[]').evaluate(context);
        expect(structArray.type).toBe(EduBasicType.Array);
        expect(structArray.elementType).toBe(EduBasicType.Structure);
        expect(structArray.value).toEqual([]);
    });

    it('should format toString', () =>
    {
        const base = new LiteralExpression({ type: EduBasicType.Structure, value: new Map<string, any>() });
        const expr = new StructureMemberExpression(base, 'x%');
        expect(expr.toString()).toBe('{ }.x%');
    });
});

