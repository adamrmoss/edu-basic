import { NullaryExpression as ConstantExpressionNullaryExpression } from '../../src/lang/expressions/constant-expression';
import { Constant } from '../../src/lang/expressions/helpers/constant-evaluator';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

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

