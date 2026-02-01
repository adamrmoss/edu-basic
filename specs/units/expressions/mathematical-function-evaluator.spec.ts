import { EduBasicType } from '@/lang/edu-basic-value';
import { MathematicalFunctionEvaluator } from '@/lang/expressions/helpers/mathematical-function-evaluator';
import { UnaryOperator } from '@/lang/expressions/unary-expression';

describe('MathematicalFunctionEvaluator', () =>
{
    it('rejects non-numeric operands', () =>
    {
        const evalr = new MathematicalFunctionEvaluator();
        expect(() =>
        {
            evalr.evaluate(UnaryOperator.Sin, { type: EduBasicType.String, value: 'x' });
        }).toThrow('requires numeric operand');
    });

    it('handles real-only operators and branching cases', () =>
    {
        const evalr = new MathematicalFunctionEvaluator();

        expect(evalr.evaluate(UnaryOperator.Expand, { type: EduBasicType.Real, value: 1.2 }))
            .toEqual({ type: EduBasicType.Real, value: 2 });

        expect(evalr.evaluate(UnaryOperator.Expand, { type: EduBasicType.Real, value: -1.2 }))
            .toEqual({ type: EduBasicType.Real, value: -2 });

        expect(evalr.evaluate(UnaryOperator.Sgn, { type: EduBasicType.Real, value: 5 }))
            .toEqual({ type: EduBasicType.Integer, value: 1 });

        expect(evalr.evaluate(UnaryOperator.Sgn, { type: EduBasicType.Real, value: -5 }))
            .toEqual({ type: EduBasicType.Integer, value: -1 });

        expect(evalr.evaluate(UnaryOperator.Sgn, { type: EduBasicType.Real, value: 0 }))
            .toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('upcasts to complex when required', () =>
    {
        const evalr = new MathematicalFunctionEvaluator();
        const result = evalr.evaluate(UnaryOperator.Sqrt, { type: EduBasicType.Real, value: -1 });
        expect(result.type).toBe(EduBasicType.Complex);
    });

    it('supports complex operands (e.g., TAN) and errors on unknown operators', () =>
    {
        const evalr = new MathematicalFunctionEvaluator();

        const tan = evalr.evaluate(UnaryOperator.Tan, { type: EduBasicType.Complex, value: { real: 1, imaginary: 2 } });
        expect(tan.type).toBe(EduBasicType.Complex);

        expect(() =>
        {
            evalr.evaluate(999 as any, { type: EduBasicType.Real, value: 1 });
        }).toThrow('Unknown mathematical operator');
    });
});

