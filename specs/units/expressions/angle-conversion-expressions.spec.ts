import { ExpressionParser } from '@/lang/parsing/expression-parser';
import { ExecutionContext } from '@/lang/execution-context';

describe('Angle conversion postfix operators', () =>
{
    let parser: ExpressionParser;
    let context: ExecutionContext;

    beforeEach(() =>
    {
        parser = new ExpressionParser();
        context = new ExecutionContext();
    });

    it('should reject DEG for non-numeric operands at runtime', () =>
    {
        const exprResult = parser.parseExpression('"hello" DEG');
        expect(exprResult.success).toBe(true);
        if (!exprResult.success)
        {
            return;
        }

        expect(() => exprResult.value.evaluate(context)).toThrow(/DEG operator requires numeric operand/i);
    });

    it('should reject RAD for non-numeric operands at runtime', () =>
    {
        const exprResult = parser.parseExpression('{ } RAD');
        expect(exprResult.success).toBe(true);
        if (!exprResult.success)
        {
            return;
        }

        expect(() => exprResult.value.evaluate(context)).toThrow(/RAD operator requires numeric operand/i);
    });
});
