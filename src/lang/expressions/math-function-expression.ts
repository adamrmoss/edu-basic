import { Expression } from './expression';

export enum MathFunction
{
    Sin = 'SIN',
    Cos = 'COS',
    Tan = 'TAN',
    Asin = 'ASIN',
    Acos = 'ACOS',
    Atan = 'ATAN',
    Sinh = 'SINH',
    Cosh = 'COSH',
    Tanh = 'TANH',
    Asinh = 'ASINH',
    Acosh = 'ACOSH',
    Atanh = 'ATANH',
    Exp = 'EXP',
    Log = 'LOG',
    Log10 = 'LOG10',
    Log2 = 'LOG2',
    Sqrt = 'SQRT',
    Cbrt = 'CBRT',
    Round = 'ROUND',
    Floor = 'FLOOR',
    Ceil = 'CEIL',
    Trunc = 'TRUNC',
    Expand = 'EXPAND',
    Sgn = 'SGN',
}

export class MathFunctionExpression extends Expression
{
    public constructor(
        public readonly functionName: MathFunction,
        public readonly argument: Expression
    )
    {
        super();
    }
}
