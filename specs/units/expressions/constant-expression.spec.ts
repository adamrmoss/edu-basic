import { NullaryExpression as ConstantExpressionNullaryExpression } from '@/lang/expressions/constant-expression';
import { Constant } from '@/lang/expressions/helpers/constant-evaluator';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('constant-expression.ts', () => {
    it('should evaluate PI# to Math.PI', () => {
        const expr = new ConstantExpressionNullaryExpression(Constant.Pi);
        const result = expr.evaluate(new ExecutionContext());

        expect(result.type).toBe(EduBasicType.Real);
        expect(result.value).toBe(Math.PI);
    });

    it('should return constant name from toString', () => {
        const expr = new ConstantExpressionNullaryExpression(Constant.Pi);
        expect(expr.toString()).toBe('PI#');
    });
});

