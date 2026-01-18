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

import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class ConstantExpression extends Expression
{
    public constructor(
        public readonly constant: Constant
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('ConstantExpression.evaluate() not yet implemented');
    }

    public toString(): string
    {
        return this.constant;
    }
}

