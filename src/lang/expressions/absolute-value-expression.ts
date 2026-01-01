import { Expression } from './expression';

export class AbsoluteValueExpression extends Expression
{
    public constructor(
        public readonly operand: Expression
    )
    {
        super();
    }
}
