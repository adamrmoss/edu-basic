import { BinaryExpression, BinaryOperator, BinaryOperatorCategory } from '../../../src/lang/expressions/binary-expression';
import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '../../../src/lang/expressions/unary-expression';
import { LiteralExpression } from '../../../src/lang/expressions/literal-expression';
import { VariableExpression } from '../../../src/lang/expressions/special/variable-expression';
import { ExecutionContext } from '../../../src/lang/execution-context';
import { EduBasicType } from '../../../src/lang/edu-basic-value';

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
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(8);
        });

        it('should add integer and real and return real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(8.5);
        });

        it('should add two reals and return real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 2.5 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

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
            const expr = new BinaryExpression(left, BinaryOperator.Subtract, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(7);
        });

        it('should handle negative results', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new BinaryExpression(left, BinaryOperator.Subtract, right, BinaryOperatorCategory.Arithmetic);

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
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(15);
        });

        it('should multiply integer and real and return real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 2.5 });
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(12.5);
        });
    });

    describe('Division', () =>
    {
        it('should return integer when integer division results in whole number', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(5);
        });

        it('should handle non-integer division', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 7 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(3.5);
        });

        it('should return real for non-whole number division', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(0.5);
        });

        it('should return real when at least one operand is real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(5.0);
        });

        it('should throw error on division by zero', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            expect(() => expr.evaluate(context)).toThrow('Division by zero');
        });
    });

    describe('Modulo', () =>
    {
        it('should return remainder as integer', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new BinaryExpression(left, BinaryOperator.Modulo, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(1);
        });

        it('should handle negative numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: -10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new BinaryExpression(left, BinaryOperator.Modulo, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should throw error on modulo by zero', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(left, BinaryOperator.Modulo, right, BinaryOperatorCategory.Arithmetic);

            expect(() => expr.evaluate(context)).toThrow('Modulo by zero');
        });
    });

    describe('Power', () =>
    {
        it('should compute power and return real', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(8.0);
        });

        it('should handle fractional exponents', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 4 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 0.5 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(2.0);
        });

        it('should work with ** operator', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.PowerAlt, right, BinaryOperatorCategory.Arithmetic);

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
            const expr = new UnaryExpression(UnaryOperator.Plus, operand, UnaryOperatorCategory.Prefix);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(5);
        });

        it('should negate integer', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new UnaryExpression(UnaryOperator.Minus, operand, UnaryOperatorCategory.Prefix);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-5);
        });

        it('should negate real', () =>
        {
            const operand = new LiteralExpression({ type: EduBasicType.Real, value: 3.5 });
            const expr = new UnaryExpression(UnaryOperator.Minus, operand, UnaryOperatorCategory.Prefix);

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
            const expr = new UnaryExpression(UnaryOperator.Minus, operand, UnaryOperatorCategory.Prefix);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(-3);
                expect(result.value.imaginary).toBe(-4);
            }
        });
    });

    describe('Complex number operations', () =>
    {
        it('should add two complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(4);
                expect(result.value.imaginary).toBe(6);
            }
        });

        it('should subtract complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 6 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 2, imaginary: 3 } });
            const expr = new BinaryExpression(left, BinaryOperator.Subtract, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(3);
                expect(result.value.imaginary).toBe(3);
            }
        });

        it('should multiply complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new BinaryExpression(left, BinaryOperator.Multiply, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(-5);
                expect(result.value.imaginary).toBe(10);
            }
        });

        it('should divide complex numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: 1 } });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(1.5);
                expect(result.value.imaginary).toBeCloseTo(0.5);
            }
        });

        it('should add integer and complex number', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBe(8);
                expect(result.value.imaginary).toBe(4);
            }
        });

        it('should add real and complex number', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 2.5 });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1.5, imaginary: 3 } });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(4.0);
                expect(result.value.imaginary).toBe(3);
            }
        });

        it('should compute complex power', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 1 } });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Complex);
            if (result.type === EduBasicType.Complex)
            {
                expect(result.value.real).toBeCloseTo(-1.0);
                expect(result.value.imaginary).toBeCloseTo(0.0);
            }
        });

        it('should throw error on complex modulo', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 3 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 2, imaginary: 1 } });
            const expr = new BinaryExpression(left, BinaryOperator.Modulo, right, BinaryOperatorCategory.Arithmetic);

            expect(() => expr.evaluate(context)).toThrow('Modulo operator is not applicable to complex numbers');
        });

        it('should throw error on division by zero complex number', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 5, imaginary: 3 } });
            const right = new LiteralExpression({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            expect(() => expr.evaluate(context)).toThrow('Division by zero');
        });
    });

    describe('Complex Expressions', () =>
    {
        it('should evaluate nested arithmetic expressions', () =>
        {
            const five = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const three = new LiteralExpression({ type: EduBasicType.Integer, value: 3 });
            const two = new LiteralExpression({ type: EduBasicType.Integer, value: 2 });

            const multiply = new BinaryExpression(three, BinaryOperator.Multiply, two, BinaryOperatorCategory.Arithmetic);
            const add = new BinaryExpression(five, BinaryOperator.Add, multiply, BinaryOperatorCategory.Arithmetic);

            const result = add.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(11);
        });

        it('should work with variables', () =>
        {
            context.setVariable('x%', { type: EduBasicType.Integer, value: 10 });

            const variable = new VariableExpression('x%');
            const literal = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const expr = new BinaryExpression(variable, BinaryOperator.Add, literal, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(15);
        });
    });

    describe('Edge Cases', () =>
    {
        it('should handle string concatenation with addition', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'Hello' });
            const right = new LiteralExpression({ type: EduBasicType.String, value: 'World' });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('HelloWorld');
        });

        it('should throw error when adding string and number (not concatenation)', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.String, value: 'Value: ' });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            expect(() => expr.evaluate(context)).toThrow('Cannot convert STRING to number');
        });

        it('should handle very large real numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 1e308 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 1e308 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Infinity);
        });

        it('should handle very small real numbers', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 1e-308 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 1e-308 });
            const expr = new BinaryExpression(left, BinaryOperator.Add, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(2e-308);
        });

        it('should handle real division by very small number', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Real, value: 1 });
            const right = new LiteralExpression({ type: EduBasicType.Real, value: 1e-10 });
            const expr = new BinaryExpression(left, BinaryOperator.Divide, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(1e10);
        });

        it('should handle modulo with equal operands', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 10 });
            const expr = new BinaryExpression(left, BinaryOperator.Modulo, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should handle power of 1', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(5);
        });

        it('should handle power of 0', () =>
        {
            const left = new LiteralExpression({ type: EduBasicType.Integer, value: 5 });
            const right = new LiteralExpression({ type: EduBasicType.Integer, value: 0 });
            const expr = new BinaryExpression(left, BinaryOperator.Power, right, BinaryOperatorCategory.Arithmetic);

            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(1);
        });
    });
});

