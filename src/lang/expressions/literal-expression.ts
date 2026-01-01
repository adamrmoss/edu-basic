import { Expression } from './expression';
import { EduBasicValue } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

export class LiteralExpression extends Expression
{
    public constructor(
        public readonly value: EduBasicValue
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return this.value;
    }
}
