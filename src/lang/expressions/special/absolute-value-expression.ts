import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class AbsoluteValueExpression extends Expression
{
    public constructor(
        public readonly operand: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('AbsoluteValueExpression.evaluate() not yet implemented');
    }
}

