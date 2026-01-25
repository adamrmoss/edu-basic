import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { VariableExpression } from '../../src/lang/expressions/special/variable-expression';
import { ParenthesizedExpression } from '../../src/lang/expressions/special/parenthesized-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType, coerceArrayElements } from '../../src/lang/edu-basic-value';

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
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(4);
            }
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

    describe('Complex Literals', () =>
    {
        it('should create complex value', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(4);
            }
        });

        it('should handle negative imaginary part', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: -2 } });

            const result = expr.evaluate(context);

            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(5);
                expect(result.value.imaginary).toBe(-2);
            }
        });

        it('should handle zero parts', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });

            const result = expr.evaluate(context);

            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(0);
                expect(result.value.imaginary).toBe(0);
            }
        });
    });

    describe('Array Literals', () =>
    {
        it('should create empty array', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer });

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Array);
            if (result.type === EduBasicType.Array)
            {
                expect(result.value).toEqual([]);
                expect(result.elementType).toBe(EduBasicType.Integer);
            }
        });

        it('should create array from literals', () =>
        {
            const arrayValue = coerceArrayElements([
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 2 },
                { type: EduBasicType.Integer, value: 3 }
            ]);
            const expr = new LiteralExpression(arrayValue);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Array);
            if (result.type === EduBasicType.Array)
            {
                expect(result.value).toHaveLength(3);
                expect(result.value[0].value).toBe(1);
                expect(result.value[1].value).toBe(2);
                expect(result.value[2].value).toBe(3);
                expect(result.elementType).toBe(EduBasicType.Integer);
            }
        });
        
        it('should coerce Integer and Real to Real', () =>
        {
            const arrayValue = coerceArrayElements([
                { type: EduBasicType.Integer, value: 0 },
                { type: EduBasicType.Real, value: 3.14 }
            ]);
            const expr = new LiteralExpression(arrayValue);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Array);
            if (result.type === EduBasicType.Array)
            {
                expect(result.elementType).toBe(EduBasicType.Real);
                expect(result.value[0].type).toBe(EduBasicType.Real);
                expect(result.value[0].value).toBe(0);
                expect(result.value[1].type).toBe(EduBasicType.Real);
                expect(result.value[1].value).toBe(3.14);
            }
        });
        
        it('should coerce Integer, Real, and Complex to Complex', () =>
        {
            const arrayValue = coerceArrayElements([
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Real, value: 3.14 },
                { type: EduBasicType.Complex, value: { real: 2, imaginary: 5 } }
            ]);
            const expr = new LiteralExpression(arrayValue);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Array);
            if (result.type === EduBasicType.Array)
            {
                expect(result.elementType).toBe(EduBasicType.Complex);
                expect(result.value[0].type).toBe(EduBasicType.Complex);
                if (result.value[0].type === EduBasicType.Complex)
                {
                    expect(result.value[0].value.real).toBe(1);
                    expect(result.value[0].value.imaginary).toBe(0);
                }
                expect(result.value[1].type).toBe(EduBasicType.Complex);
                if (result.value[1].type === EduBasicType.Complex)
                {
                    expect(result.value[1].value.real).toBe(3.14);
                    expect(result.value[1].value.imaginary).toBe(0);
                }
                expect(result.value[2].type).toBe(EduBasicType.Complex);
                if (result.value[2].type === EduBasicType.Complex)
                {
                    expect(result.value[2].value.real).toBe(2);
                    expect(result.value[2].value.imaginary).toBe(5);
                }
            }
        });
        
        it('should throw error for incompatible types (String)', () =>
        {
            expect(() => coerceArrayElements([
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.String, value: 'hello' }
            ])).toThrow('Array literal cannot mix strings with other types');
        });
        
        it('should allow string-only arrays', () =>
        {
            const arrayValue = coerceArrayElements([
                { type: EduBasicType.String, value: 'hello' },
                { type: EduBasicType.String, value: 'world' }
            ]);
            const expr = new LiteralExpression(arrayValue);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Array);
            if (result.type === EduBasicType.Array)
            {
                expect(result.elementType).toBe(EduBasicType.String);
                expect(result.value[0].type).toBe(EduBasicType.String);
                expect(result.value[0].value).toBe('hello');
                expect(result.value[1].type).toBe(EduBasicType.String);
                expect(result.value[1].value).toBe('world');
            }
        });
    });

    describe('Structure Literals', () =>
    {
        it('should create empty structure', () =>
        {
            const expr = new LiteralExpression({ type: EduBasicType.Structure, value: new Map() });

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Structure);
            if (result.type === EduBasicType.Structure)
            {
                expect(result.value.size).toBe(0);
            }
        });

        it('should create structure with members', () =>
        {
            const structureMembers = new Map();
            structureMembers.set('name$', { type: EduBasicType.String, value: 'Alice' });
            structureMembers.set('age%', { type: EduBasicType.Integer, value: 25 });
            
            const expr = new LiteralExpression({ type: EduBasicType.Structure, value: structureMembers });

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Structure);
            if (result.type === EduBasicType.Structure)
            {
                expect(result.value.size).toBe(2);
                expect(result.value.get('name$')?.value).toBe('Alice');
                expect(result.value.get('age%')?.value).toBe(25);
            }
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
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(0);
                expect(result.value.imaginary).toBe(0);
            }
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

