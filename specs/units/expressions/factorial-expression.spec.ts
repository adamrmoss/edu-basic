import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { FactorialExpression } from '@/lang/expressions/special';

describe('FactorialExpression', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    it('evaluates factorial for integer operands', () =>
    {
        const expr = new FactorialExpression(
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 })
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 120 });
    });

    it('accepts real operands that are exactly integers', () =>
    {
        const expr = new FactorialExpression(
            new LiteralExpression({ type: EduBasicType.Real, value: 5.0 })
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 120 });
    });

    it('throws when a real operand is not an integer', () =>
    {
        const expr = new FactorialExpression(
            new LiteralExpression({ type: EduBasicType.Real, value: 2.5 })
        );

        expect(() => expr.evaluate(context)).toThrow('Factorial operand must be an integer');
    });

    it('throws when operand is not numeric', () =>
    {
        const expr = new FactorialExpression(
            new LiteralExpression({ type: EduBasicType.String, value: 'nope' })
        );

        expect(() => expr.evaluate(context)).toThrow('Factorial operand must be numeric');
    });

    it('throws for negative operands', () =>
    {
        const expr = new FactorialExpression(
            new LiteralExpression({ type: EduBasicType.Integer, value: -1 })
        );

        expect(() => expr.evaluate(context)).toThrow('Factorial operand must be non-negative');
    });

    it('throws when the factorial overflows', () =>
    {
        const expr = new FactorialExpression(
            new LiteralExpression({ type: EduBasicType.Integer, value: 171 })
        );

        expect(() => expr.evaluate(context)).toThrow('Factorial overflow');
    });

    it('formats toString', () =>
    {
        const expr = new FactorialExpression(
            new LiteralExpression({ type: EduBasicType.Integer, value: 3 })
        );

        expect(expr.toString()).toBe('3!');
    });
});

