import { Expression } from './expression';

export enum UnaryOperator
{
    Plus = '+',
    Minus = '-',
    Factorial = '!',
}

export class UnaryOperatorExpression extends Expression
{
    public constructor(
        public readonly operator: UnaryOperator,
        public readonly operand: Expression,
        public readonly isPostfix: boolean = false
    )
    {
        super();
    }
}
