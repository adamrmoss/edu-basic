import { LiteralExpression } from '../../src/lang/expressions/literals/literal-expression';
import { ComplexLiteralExpression } from '../../src/lang/expressions/literals/complex-literal-expression';
import { ArrayLiteralExpression } from '../../src/lang/expressions/literals/array-literal-expression';
import { StructureLiteralExpression } from '../../src/lang/expressions/literals/structure-literal-expression';
import { VariableExpression } from '../../src/lang/expressions/special/variable-expression';
import { ParenthesizedExpression } from '../../src/lang/expressions/special/parenthesized-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

describe('Literal and Special Expressions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('LiteralExpression', () =>
    {
        it('should return integer literal', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(42);
        });

        it('should return real literal', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.Real, value: 3.14 });

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(3.14);
        });

        it('should return string literal', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('hello');
        });

        it('should return complex literal', () =>
        {
            const expr = new LiteralExpression({ 
                type: EduBasicType.Complex, 
                value: { real: 3, imaginary: 4 } 
            });

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            expect(result.value.real).toBe(3);
            expect(result.value.imaginary).toBe(4);
        });

        it('should format integer toString correctly', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });

            expect(expr.toString()).toBe('42');
        });

        it('should format real toString correctly', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.Real, value: 3.14 });

            expect(expr.toString()).toBe('3.14');
        });

        it('should format string toString with quotes', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.String, value: 'hello' });

            expect(expr.toString()).toBe('"hello"');
        });

        it('should format complex toString correctly', () =>
        {
            const expr = new LiteralExpression({ 
                type: EduBasicType.Complex, 
                value: { real: 3, imaginary: 4 } 
            });

            expect(expr.toString()).toBe('3+4i');
        });

        it('should format complex with negative imaginary correctly', () =>
        {
            const expr = new LiteralExpression({ 
                type: EduBasicType.Complex, 
                value: { real: 3, imaginary: -4 } 
            });

            expect(expr.toString()).toBe('3-4i');
        });
    });

    describe('ComplexLiteralExpression', () =>
    {
        it('should create complex value', () =>
        {
            const expr = new ComplexLiteralExpression(3, 4);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            expect(result.value.real).toBe(3);
            expect(result.value.imaginary).toBe(4);
        });

        it('should handle negative imaginary part', () =>
        {
            const expr = new ComplexLiteralExpression(5, -2);

            const result = expr.evaluate(context);

            expect(result.value.real).toBe(5);
            expect(result.value.imaginary).toBe(-2);
        });

        it('should handle zero parts', () =>
        {
            const expr = new ComplexLiteralExpression(0, 0);

            const result = expr.evaluate(context);

            expect(result.value.real).toBe(0);
            expect(result.value.imaginary).toBe(0);
        });
    });

    describe('ArrayLiteralExpression', () =>
    {
        it('should create empty array', () =>
        {
            const expr = new ArrayLiteralExpression([]);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Array);
            expect(result.value).toEqual([]);
            expect(result.elementType).toBe(EduBasicType.Integer);
        });

        it('should create array from literals', () =>
        {
            const elements = [
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 3 })
            ];
            const expr = new ArrayLiteralExpression(elements);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Array);
            expect(result.value).toHaveLength(3);
            expect(result.value[0].value).toBe(1);
            expect(result.value[1].value).toBe(2);
            expect(result.value[2].value).toBe(3);
            expect(result.elementType).toBe(EduBasicType.Integer);
        });

        it('should evaluate expressions in array', () =>
        {
            context.setVariable('x%', { type: EduBasicType.Integer, value: 10 });
            
            const elements = [
                new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
                new VariableExpression('x%')
            ];
            const expr = new ArrayLiteralExpression(elements);

            const result = expr.evaluate(context);

            expect(result.value[0].value).toBe(5);
            expect(result.value[1].value).toBe(10);
        });

        it('should format toString for empty array', () =>
        {
            const expr = new ArrayLiteralExpression([]);

            expect(expr.toString()).toBe('[ ]');
        });

        it('should format toString for array with elements', () =>
        {
            const elements = [
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 3 })
            ];
            const expr = new ArrayLiteralExpression(elements);

            expect(expr.toString()).toBe('[1, 2, 3]');
        });
    });

    describe('StructureLiteralExpression', () =>
    {
        it('should create empty structure', () =>
        {
            const expr = new StructureLiteralExpression(new Map());

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Structure);
            expect(result.value.size).toBe(0);
        });

        it('should create structure with members', () =>
        {
            const members = new Map();
            members.set('name$', new LiteralExpression({ type: EduBasicType.String, value: 'Alice' }));
            members.set('age%', new LiteralExpression({ type: EduBasicType.Integer, value: 25 }));
            
            const expr = new StructureLiteralExpression(members);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Structure);
            expect(result.value.size).toBe(2);
            expect(result.value.get('name$')?.value).toBe('Alice');
            expect(result.value.get('age%')?.value).toBe(25);
        });

        it('should evaluate expressions in structure members', () =>
        {
            context.setVariable('x%', { type: EduBasicType.Integer, value: 100 });
            
            const members = new Map();
            members.set('literal%', new LiteralExpression({ type: EduBasicType.Integer, value: 50 }));
            members.set('variable%', new VariableExpression('x%'));
            
            const expr = new StructureLiteralExpression(members);

            const result = expr.evaluate(context);

            expect(result.value.get('literal%')?.value).toBe(50);
            expect(result.value.get('variable%')?.value).toBe(100);
        });

        it('should format toString for empty structure', () =>
        {
            const expr = new StructureLiteralExpression(new Map());

            expect(expr.toString()).toBe('{ }');
        });

        it('should format toString for structure with members', () =>
        {
            const members = new Map();
            members.set('x%', new LiteralExpression({ type: EduBasicType.Integer, value: 10 }));
            members.set('y%', new LiteralExpression({ type: EduBasicType.Integer, value: 20 }));
            
            const expr = new StructureLiteralExpression(members);

            const result = expr.toString();
            expect(result).toContain('x%: 10');
            expect(result).toContain('y%: 20');
        });
    });

    describe('VariableExpression', () =>
    {
        it('should get variable from context', () =>
        {
            context.setVariable('x%', { type: EduBasicType.Integer, value: 42 });
            
            const expr = new VariableExpression('x%');

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(42);
        });

        it('should get default value for uninitialized integer variable', () =>
        {
            const expr = new VariableExpression('y%');

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should get default value for uninitialized real variable', () =>
        {
            const expr = new VariableExpression('y#');

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0.0);
        });

        it('should get default value for uninitialized string variable', () =>
        {
            const expr = new VariableExpression('y$');

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should get default value for uninitialized complex variable', () =>
        {
            const expr = new VariableExpression('y&');

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            expect(result.value.real).toBe(0);
            expect(result.value.imaginary).toBe(0);
        });

        it('should format toString correctly', () =>
        {
            const expr = new VariableExpression('myVar%');

            expect(expr.toString()).toBe('myVar%');
        });
    });

    describe('ParenthesizedExpression', () =>
    {
        it('should evaluate inner expression', () =>
        {
            const inner = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new ParenthesizedExpression(inner);

            const result = expr.evaluate(context);

            expect(result.value).toBe(42);
        });

        it('should format toString with parentheses', () =>
        {
            const inner = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new ParenthesizedExpression(inner);

            expect(expr.toString()).toBe('(42)');
        });

        it('should preserve evaluation semantics', () =>
        {
            const inner = new VariableExpression('x%');
            context.setVariable('x%', { type: EduBasicType.Integer, value: 100 });
            
            const expr = new ParenthesizedExpression(inner);

            const result = expr.evaluate(context);

            expect(result.value).toBe(100);
        });
    });
});

