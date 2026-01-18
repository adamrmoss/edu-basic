import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

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

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('ArrayOperatorExpression.evaluate() not yet implemented');
    }

    public toString(): string
    {
        return `${this.operator}(${this.arrayExpr.toString()}, ${this.searchValue.toString()})`;
    }
}

export class JoinExpression extends Expression
{
    public constructor(
        public readonly arrayExpr: Expression,
        public readonly delimiter: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('JoinExpression.evaluate() not yet implemented');
    }

    public toString(): string
    {
        return `JOIN(${this.arrayExpr.toString()}, ${this.delimiter.toString()})`;
    }
}
