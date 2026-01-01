import { Expression } from './expression';

export enum ArithmeticOperator
{
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    Divide = '/',
    Modulo = 'MOD',
    Power = '^',
    PowerAlt = '**',
}

export class ArithmeticExpression extends Expression
{
    public constructor(
        public readonly left: Expression,
        public readonly operator: ArithmeticOperator,
        public readonly right: Expression
    )
    {
        super();
    }
}
