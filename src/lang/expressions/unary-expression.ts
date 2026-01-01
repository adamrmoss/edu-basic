import { Expression } from './expression';

export class UnaryExpression extends Expression
{
    public constructor(
        public readonly operator: string,
        public readonly operand: Expression
    )
    {
        super();
    }
}
