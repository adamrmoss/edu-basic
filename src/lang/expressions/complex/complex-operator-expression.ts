import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export enum ComplexOperator
{
    Real = 'REAL',
    Imag = 'IMAG',
    Conj = 'CONJ',
    Cabs = 'CABS',
    Carg = 'CARG',
    Csqrt = 'CSQRT',
}

export class ComplexOperatorExpression extends Expression
{
    public constructor(
        public readonly operator: ComplexOperator,
        public readonly argument: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('ComplexOperatorExpression.evaluate() not yet implemented');
    }
}

