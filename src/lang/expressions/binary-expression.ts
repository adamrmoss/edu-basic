import { Expression } from './expression';

export class BinaryExpression extends Expression
{
    public constructor(
        public readonly left: Expression,
        public readonly operator: string,
        public readonly right: Expression
    )
    {
        super();
    }
}
