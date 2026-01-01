import { Expression } from './expression';

export enum ArrayOperator
{
    Find = 'FIND',
    IndexOf = 'INDEXOF',
    Includes = 'INCLUDES',
}

export class ArrayOperatorExpression extends Expression
{
    public constructor(
        public readonly arrayExpr: Expression,
        public readonly operator: ArrayOperator,
        public readonly searchValue: Expression
    )
    {
        super();
    }
}
