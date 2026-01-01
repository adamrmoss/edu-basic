import { Expression } from './expression';

export class StructureMemberExpression extends Expression
{
    public constructor(
        public readonly structureExpr: Expression,
        public readonly memberName: string
    )
    {
        super();
    }
}
