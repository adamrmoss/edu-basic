import { Expression } from '../expression';

export enum Constant
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

export class ConstantExpression extends Expression
{
    public constructor(
        public readonly constant: Constant
    )
    {
        super();
    }
}

