import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class VariableExpression extends Expression
{
    public constructor(
        public readonly name: string
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        return context.getVariable(this.name);
    }

    public toString(): string
    {
        return this.name;
    }
}

