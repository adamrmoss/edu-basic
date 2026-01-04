import { ArithmeticExpression, ArithmeticOperator } from '../../src/lang/expressions/arithmetic/arithmetic-expression';
import { UnaryOperatorExpression, UnaryOperator } from '../../src/lang/expressions/arithmetic/unary-operator-expression';
import { LiteralExpression } from '../../src/lang/expressions/literals/literal-expression';
import { VariableExpression } from '../../src/lang/expressions/special/variable-expression';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

describe('Arithmetic Expressions', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('Addition', () =>
    {
        it('should add two integers and return integer', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Add, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(8);
        });

        it('should add integer and real and return real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Add, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(8.5);
        });

        it('should add two reals and return real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 2.5 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Add, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(6.0);
        });
    });

    describe('Subtraction', () =>
    {
        it('should subtract two integers and return integer', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Subtract, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(7);
        });

        it('should handle negative results', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Subtract, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-7);
        });
    });

    describe('Multiplication', () =>
    {
        it('should multiply two integers and return integer', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Multiply, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(15);
        });

        it('should multiply integer and real and return real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 2.5 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Multiply, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(12.5);
        });
    });

    describe('Division', () =>
    {
        it('should divide and always return real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Divide, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(5.0);
        });

        it('should handle non-integer division', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 7 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Divide, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(3.5);
        });

        it('should throw error on division by zero', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Divide, right);

            expect(() => expr.evaluate(context)).toThrow('Division by zero');
        });
    });

    describe('Modulo', () =>
    {
        it('should return remainder as integer', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Modulo, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1);
        });

        it('should handle negative numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: -10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Modulo, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should throw error on modulo by zero', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Modulo, right);

            expect(() => expr.evaluate(context)).toThrow('Modulo by zero');
        });
    });

    describe('Power', () =>
    {
        it('should compute power and return real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Power, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(8.0);
        });

        it('should handle fractional exponents', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 4 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 0.5 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.Power, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(2.0);
        });

        it('should work with ** operator', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new ArithmeticExpression(left, ArithmeticOperator.PowerAlt, right);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(9.0);
        });
    });

    describe('Unary Operators', () =>
    {
        it('should apply unary plus (no change)', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new UnaryOperatorExpression(UnaryOperator.Plus, operand);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(5);
        });

        it('should negate integer', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new UnaryOperatorExpression(UnaryOperator.Minus, operand);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-5);
        });

        it('should negate real', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new UnaryOperatorExpression(UnaryOperator.Minus, operand);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(-3.5);
        });

        it('should negate complex number', () =>
        {
            const operand = new LiteralExpression({ 
                type: EduBasicType.Complex, 
                value: { real: 3, imaginary: 4 } 
            });
            const expr = new UnaryOperatorExpression(UnaryOperator.Minus, operand);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            expect(result.value.real).toBe(-3);
            expect(result.value.imaginary).toBe(-4);
        });
    });

    describe('Complex Expressions', () =>
    {
        it('should evaluate nested arithmetic expressions', () =>
        {
            const five = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const three = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const two = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });

            const multiply = new ArithmeticExpression(three, ArithmeticOperator.Multiply, two);
            const add = new ArithmeticExpression(five, ArithmeticOperator.Add, multiply);

            const result = add.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(11);
        });

        it('should work with variables', () =>
        {
            context.setVariable('x%', { type: EduBasicType.Integer, value: 10 });

            const variable = new VariableExpression('x%');
            const literal = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new ArithmeticExpression(variable, ArithmeticOperator.Add, literal);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(15);
        });
    });
});

