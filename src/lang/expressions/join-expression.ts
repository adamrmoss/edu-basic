import { Expression } from './expression';

export class JoinExpression extends Expression
{
    public constructor(
        public readonly arrayExpr: Expression,
        public readonly delimiter: Expression
    )
    {
        super();
    }
}
