import { Expression } from './expression';

export class MidExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly startPos: Expression,
        public readonly endPos: Expression
    )
    {
        super();
    }
}
