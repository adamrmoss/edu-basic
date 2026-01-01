import { Expression } from './expression';

export enum NullaryOperator
{
    Rnd = 'RND#',
    Inkey = 'INKEY$',
    Pi = 'PI#',
    E = 'E#',
    Date = 'DATE$',
    Time = 'TIME$',
    Now = 'NOW%',
    True = 'TRUE%',
    False = 'FALSE%',
}

export class NullaryOperatorExpression extends Expression
{
    public constructor(
        public readonly operator: NullaryOperator
    )
    {
        super();
    }
}
