import { Expression } from './expression';

export enum ComplexFunction
{
    Real = 'REAL',
    Imag = 'IMAG',
    Conj = 'CONJ',
    Cabs = 'CABS',
    Carg = 'CARG',
    Csqrt = 'CSQRT',
}

export class ComplexFunctionExpression extends Expression
{
    public constructor(
        public readonly functionName: ComplexFunction,
        public readonly argument: Expression
    )
    {
        super();
    }
}
