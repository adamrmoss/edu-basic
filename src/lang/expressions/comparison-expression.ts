import { Expression } from './expression';

export enum ComparisonOperator
{
    Equal = '=',
    NotEqual = '<>',
    LessThan = '<',
    GreaterThan = '>',
    LessThanOrEqual = '<=',
    GreaterThanOrEqual = '>=',
}

export class ComparisonExpression extends Expression
{
    public constructor(
        public readonly left: Expression,
        public readonly operator: ComparisonOperator,
        public readonly right: Expression
    )
    {
        super();
    }
}
