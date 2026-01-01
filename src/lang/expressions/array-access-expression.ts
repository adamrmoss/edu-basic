import { Expression } from './expression';

export class ArrayAccessExpression extends Expression
{
    public constructor(
        public readonly arrayExpr: Expression,
        public readonly index: Expression
    )
    {
        super();
    }
}
