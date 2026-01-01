import { Expression } from './expression';

export enum StringOperator
{
    Left = 'LEFT',
    Right = 'RIGHT',
    Instr = 'INSTR',
    Replace = 'REPLACE',
    Startswith = 'STARTSWITH',
    Endswith = 'ENDSWITH',
}

export class StringOperatorExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly operator: StringOperator,
        public readonly argument: Expression
    )
    {
        super();
    }
}
