import { Expression } from './expression';
import { EduBasicValue } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';
import { Constant, ConstantEvaluator } from './helpers/constant-evaluator';

export class NullaryExpression extends Expression
{
    private readonly constantEvaluator = new ConstantEvaluator();

    public constructor(
        public readonly constant: Constant
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return this.constantEvaluator.evaluate(this.constant);
    }

    public toString(omitOuterParens?: boolean): string
    {
        return this.constant;
    }
}
