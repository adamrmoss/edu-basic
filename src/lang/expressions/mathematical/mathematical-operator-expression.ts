import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export enum MathematicalOperator
{
    // Trigonometric operators
    Sin = 'SIN',
    Cos = 'COS',
    Tan = 'TAN',
    Asin = 'ASIN',
    Acos = 'ACOS',
    Atan = 'ATAN',
    
    // Hyperbolic operators
    Sinh = 'SINH',
    Cosh = 'COSH',
    Tanh = 'TANH',
    Asinh = 'ASINH',
    Acosh = 'ACOSH',
    Atanh = 'ATANH',
    
    // Exponential and logarithmic operators
    Exp = 'EXP',
    Log = 'LOG',
    Log10 = 'LOG10',
    Log2 = 'LOG2',
    
    // Root operators
    Sqrt = 'SQRT',
    Cbrt = 'CBRT',
    
    // Rounding and truncation operators
    Round = 'ROUND',
    Floor = 'FLOOR',
    Ceil = 'CEIL',
    Trunc = 'TRUNC',
    
    // Other mathematical operators
    Expand = 'EXPAND',
    Sgn = 'SGN',
}

export class MathematicalOperatorExpression extends Expression
{
    public constructor(
        public readonly operator: MathematicalOperator,
        public readonly argument: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('MathematicalOperatorExpression.evaluate() not yet implemented');
    }
}

