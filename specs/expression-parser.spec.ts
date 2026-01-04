import { ExpressionParserService } from '../src/app/interpreter/expression-parser.service';
import { ExecutionContext } from '../src/lang/execution-context';
import { EduBasicType } from '../src/lang/edu-basic-value';

describe('ExpressionParser', () =>
{
    let parser: ExpressionParserService;
    let context: ExecutionContext;

    beforeEach(() =>
    {
        parser = new ExpressionParserService();
        context = new ExecutionContext();
    });

    describe('Literals', () =>
    {
        it('should parse integer literals', () =>
        {
            const expr = parser.parseExpression('42');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(42);
        });

        it('should parse real literals', () =>
        {
            const expr = parser.parseExpression('3.14');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(3.14);
        });

        it('should parse complex literals', () =>
        {
            const expr = parser.parseExpression('3+4i');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Complex);
            expect((result.value as any).real).toBe(3);
            expect((result.value as any).imaginary).toBe(4);
        });

        it('should parse string literals', () =>
        {
            const expr = parser.parseExpression('"Hello"');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('Hello');
        });
    });

    describe('Arithmetic Operations', () =>
    {
        it('should parse addition', () =>
        {
            const expr = parser.parseExpression('5 + 3');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(8);
        });

        it('should parse subtraction', () =>
        {
            const expr = parser.parseExpression('10 - 4');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(6);
        });

        it('should parse multiplication', () =>
        {
            const expr = parser.parseExpression('6 * 7');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(42);
        });

        it('should parse division', () =>
        {
            const expr = parser.parseExpression('15 / 3');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(5);
        });

        it('should parse exponentiation', () =>
        {
            const expr = parser.parseExpression('2 ^ 3');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(8);
        });
    });

    describe('Operator Precedence', () =>
    {
        it('should respect multiplication over addition', () =>
        {
            const expr = parser.parseExpression('2 + 3 * 4');
            const result = expr.evaluate(context);
            
            expect(result.value).toBe(14);
        });

        it('should respect exponentiation over multiplication', () =>
        {
            const expr = parser.parseExpression('2 * 3 ^ 2');
            const result = expr.evaluate(context);
            
            expect(result.value).toBeCloseTo(18);
        });

        it('should handle parentheses', () =>
        {
            const expr = parser.parseExpression('(2 + 3) * 4');
            const result = expr.evaluate(context);
            
            expect(result.value).toBe(20);
        });

        it('should handle nested parentheses', () =>
        {
            const expr = parser.parseExpression('((2 + 3) * 4) - 5');
            const result = expr.evaluate(context);
            
            expect(result.value).toBe(15);
        });
    });

    describe('Unary Operators', () =>
    {
        it('should parse unary plus', () =>
        {
            const expr = parser.parseExpression('+42');
            const result = expr.evaluate(context);
            
            expect(result.value).toBe(42);
        });

        it('should parse unary minus', () =>
        {
            const expr = parser.parseExpression('-42');
            const result = expr.evaluate(context);
            
            expect(result.value).toBe(-42);
        });

        it('should parse double negation', () =>
        {
            const expr = parser.parseExpression('--42');
            const result = expr.evaluate(context);
            
            expect(result.value).toBe(42);
        });
    });

    describe('Comparison Operators', () =>
    {
        it('should parse equality', () =>
        {
            const expr = parser.parseExpression('5 = 5');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should parse inequality', () =>
        {
            const expr = parser.parseExpression('5 <> 3');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should parse less than', () =>
        {
            const expr = parser.parseExpression('3 < 5');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });
    });

    describe('Logical Operators', () =>
    {
        it('should parse AND', () =>
        {
            const expr = parser.parseExpression('1 AND 1');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1);
        });

        it('should parse OR', () =>
        {
            const expr = parser.parseExpression('0 OR 1');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1);
        });

        it('should parse NOT', () =>
        {
            const expr = parser.parseExpression('NOT 0');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });
    });

    describe('Variables', () =>
    {
        it('should parse variable references', () =>
        {
            context.setVariable('x%', { type: EduBasicType.Integer, value: 42 });
            const expr = parser.parseExpression('x%');
            const result = expr.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(42);
        });

        it('should parse variables in expressions', () =>
        {
            context.setVariable('x%', { type: EduBasicType.Integer, value: 10 });
            context.setVariable('y%', { type: EduBasicType.Integer, value: 5 });
            const expr = parser.parseExpression('x% + y%');
            const result = expr.evaluate(context);
            
            expect(result.value).toBe(15);
        });
    });

    describe('Complex Expressions', () =>
    {
        it('should parse complex arithmetic expression', () =>
        {
            const expr = parser.parseExpression('2 + 3 * 4 - 5 / 2');
            const result = expr.evaluate(context);
            
            expect(result.value).toBeCloseTo(11.5);
        });

        it('should parse expression with variables and operations', () =>
        {
            context.setVariable('a%', { type: EduBasicType.Integer, value: 5 });
            context.setVariable('b%', { type: EduBasicType.Integer, value: 3 });
            const expr = parser.parseExpression('(a% + b%) * 2');
            const result = expr.evaluate(context);
            
            expect(result.value).toBe(16);
        });
    });
});

