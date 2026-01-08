import { Expression } from '../expression';
import { EduBasicValue, EduBasicType, ComplexValue } from '../../edu-basic-value';
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
        const argValue = this.argument.evaluate(context);

        // Convert argument to appropriate type
        if (argValue.type === EduBasicType.Complex)
        {
            return this.evaluateComplex(argValue.value);
        }
        else if (argValue.type === EduBasicType.Integer || argValue.type === EduBasicType.Real)
        {
            const numValue = argValue.type === EduBasicType.Integer ? argValue.value : argValue.value;
            return this.evaluateReal(numValue);
        }
        else
        {
            throw new Error(`Mathematical operator ${this.operator} requires numeric operand, got ${argValue.type}`);
        }
    }

    private evaluateReal(value: number): EduBasicValue
    {
        switch (this.operator)
        {
            // Trigonometric operators
            case MathematicalOperator.Sin:
                return { type: EduBasicType.Real, value: Math.sin(value) };
            case MathematicalOperator.Cos:
                return { type: EduBasicType.Real, value: Math.cos(value) };
            case MathematicalOperator.Tan:
                return { type: EduBasicType.Real, value: Math.tan(value) };
            case MathematicalOperator.Asin:
                return { type: EduBasicType.Real, value: Math.asin(value) };
            case MathematicalOperator.Acos:
                return { type: EduBasicType.Real, value: Math.acos(value) };
            case MathematicalOperator.Atan:
                return { type: EduBasicType.Real, value: Math.atan(value) };

            // Hyperbolic operators
            case MathematicalOperator.Sinh:
                return { type: EduBasicType.Real, value: Math.sinh(value) };
            case MathematicalOperator.Cosh:
                return { type: EduBasicType.Real, value: Math.cosh(value) };
            case MathematicalOperator.Tanh:
                return { type: EduBasicType.Real, value: Math.tanh(value) };
            case MathematicalOperator.Asinh:
                return { type: EduBasicType.Real, value: Math.asinh(value) };
            case MathematicalOperator.Acosh:
                return { type: EduBasicType.Real, value: Math.acosh(value) };
            case MathematicalOperator.Atanh:
                return { type: EduBasicType.Real, value: Math.atanh(value) };

            // Exponential and logarithmic operators
            case MathematicalOperator.Exp:
                return { type: EduBasicType.Real, value: Math.exp(value) };
            case MathematicalOperator.Log:
                return { type: EduBasicType.Real, value: Math.log(value) };
            case MathematicalOperator.Log10:
                return { type: EduBasicType.Real, value: Math.log10(value) };
            case MathematicalOperator.Log2:
                return { type: EduBasicType.Real, value: Math.log2(value) };

            // Root operators
            case MathematicalOperator.Sqrt:
                return { type: EduBasicType.Real, value: Math.sqrt(value) };
            case MathematicalOperator.Cbrt:
                return { type: EduBasicType.Real, value: Math.cbrt(value) };

            // Rounding and truncation operators
            case MathematicalOperator.Round:
                return { type: EduBasicType.Real, value: Math.round(value) };
            case MathematicalOperator.Floor:
                return { type: EduBasicType.Real, value: Math.floor(value) };
            case MathematicalOperator.Ceil:
                return { type: EduBasicType.Real, value: Math.ceil(value) };
            case MathematicalOperator.Trunc:
                return { type: EduBasicType.Real, value: Math.trunc(value) };
            case MathematicalOperator.Expand:
                return { type: EduBasicType.Real, value: value >= 0 ? Math.ceil(value) : Math.floor(value) };

            // Other mathematical operators
            case MathematicalOperator.Sgn:
                return { type: EduBasicType.Integer, value: value > 0 ? 1 : value < 0 ? -1 : 0 };

            default:
                throw new Error(`Unknown mathematical operator: ${this.operator}`);
        }
    }

    private evaluateComplex(z: ComplexValue): EduBasicValue
    {
        const { real, imaginary } = z;

        switch (this.operator)
        {
            // Trigonometric operators - complex extensions
            case MathematicalOperator.Sin:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: Math.sin(real) * Math.cosh(imaginary),
                        imaginary: Math.cos(real) * Math.sinh(imaginary)
                    }
                };
            case MathematicalOperator.Cos:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: Math.cos(real) * Math.cosh(imaginary),
                        imaginary: -Math.sin(real) * Math.sinh(imaginary)
                    }
                };
            case MathematicalOperator.Tan:
            {
                const sinZ = {
                    real: Math.sin(real) * Math.cosh(imaginary),
                    imaginary: Math.cos(real) * Math.sinh(imaginary)
                };
                const cosZ = {
                    real: Math.cos(real) * Math.cosh(imaginary),
                    imaginary: -Math.sin(real) * Math.sinh(imaginary)
                };
                return { type: EduBasicType.Complex, value: this.complexDivide(sinZ, cosZ) };
            }
            case MathematicalOperator.Asin:
            {
                // asin(z) = -i * log(i*z + sqrt(1 - z^2))
                const iz = { real: -imaginary, imaginary: real };
                const zSquared = this.complexMultiply(z, z);
                const oneMinusZSquared = this.complexSubtract({ real: 1, imaginary: 0 }, zSquared);
                const sqrt = this.complexSqrt(oneMinusZSquared);
                const sum = this.complexAdd(iz, sqrt);
                const logResult = this.complexLog(sum);
                return {
                    type: EduBasicType.Complex,
                    value: { real: logResult.imaginary, imaginary: -logResult.real }
                };
            }
            case MathematicalOperator.Acos:
            {
                // acos(z) = -i * log(z + i*sqrt(1 - z^2))
                const zSquared = this.complexMultiply(z, z);
                const oneMinusZSquared = this.complexSubtract({ real: 1, imaginary: 0 }, zSquared);
                const sqrt = this.complexSqrt(oneMinusZSquared);
                const iSqrt = { real: -sqrt.imaginary, imaginary: sqrt.real };
                const sum = this.complexAdd(z, iSqrt);
                const logResult = this.complexLog(sum);
                return {
                    type: EduBasicType.Complex,
                    value: { real: logResult.imaginary, imaginary: -logResult.real }
                };
            }
            case MathematicalOperator.Atan:
            {
                // atan(z) = (i/2) * log((1 - i*z) / (1 + i*z))
                const iz = { real: -imaginary, imaginary: real };
                const oneMinusIZ = this.complexSubtract({ real: 1, imaginary: 0 }, iz);
                const onePlusIZ = this.complexAdd({ real: 1, imaginary: 0 }, iz);
                const quotient = this.complexDivide(oneMinusIZ, onePlusIZ);
                const logResult = this.complexLog(quotient);
                return {
                    type: EduBasicType.Complex,
                    value: { real: -logResult.imaginary / 2, imaginary: logResult.real / 2 }
                };
            }

            // Hyperbolic operators - complex extensions
            case MathematicalOperator.Sinh:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: Math.sinh(real) * Math.cos(imaginary),
                        imaginary: Math.cosh(real) * Math.sin(imaginary)
                    }
                };
            case MathematicalOperator.Cosh:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: Math.cosh(real) * Math.cos(imaginary),
                        imaginary: Math.sinh(real) * Math.sin(imaginary)
                    }
                };
            case MathematicalOperator.Tanh:
            {
                const sinhZ = {
                    real: Math.sinh(real) * Math.cos(imaginary),
                    imaginary: Math.cosh(real) * Math.sin(imaginary)
                };
                const coshZ = {
                    real: Math.cosh(real) * Math.cos(imaginary),
                    imaginary: Math.sinh(real) * Math.sin(imaginary)
                };
                return { type: EduBasicType.Complex, value: this.complexDivide(sinhZ, coshZ) };
            }
            case MathematicalOperator.Asinh:
            {
                // asinh(z) = log(z + sqrt(z^2 + 1))
                const zSquared = this.complexMultiply(z, z);
                const zSquaredPlusOne = this.complexAdd(zSquared, { real: 1, imaginary: 0 });
                const sqrt = this.complexSqrt(zSquaredPlusOne);
                const sum = this.complexAdd(z, sqrt);
                return { type: EduBasicType.Complex, value: this.complexLog(sum) };
            }
            case MathematicalOperator.Acosh:
            {
                // acosh(z) = log(z + sqrt(z^2 - 1))
                const zSquared = this.complexMultiply(z, z);
                const zSquaredMinusOne = this.complexSubtract(zSquared, { real: 1, imaginary: 0 });
                const sqrt = this.complexSqrt(zSquaredMinusOne);
                const sum = this.complexAdd(z, sqrt);
                return { type: EduBasicType.Complex, value: this.complexLog(sum) };
            }
            case MathematicalOperator.Atanh:
            {
                // atanh(z) = (1/2) * log((1 + z) / (1 - z))
                const onePlusZ = this.complexAdd({ real: 1, imaginary: 0 }, z);
                const oneMinusZ = this.complexSubtract({ real: 1, imaginary: 0 }, z);
                const quotient = this.complexDivide(onePlusZ, oneMinusZ);
                const logResult = this.complexLog(quotient);
                return {
                    type: EduBasicType.Complex,
                    value: { real: logResult.real / 2, imaginary: logResult.imaginary / 2 }
                };
            }

            // Exponential and logarithmic operators - complex extensions
            case MathematicalOperator.Exp:
            {
                // exp(z) = exp(real) * (cos(imaginary) + i*sin(imaginary))
                const expReal = Math.exp(real);
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: expReal * Math.cos(imaginary),
                        imaginary: expReal * Math.sin(imaginary)
                    }
                };
            }
            case MathematicalOperator.Log:
                return { type: EduBasicType.Complex, value: this.complexLog(z) };
            case MathematicalOperator.Log10:
            {
                const logResult = this.complexLog(z);
                const log10 = Math.log(10);
                return {
                    type: EduBasicType.Complex,
                    value: { real: logResult.real / log10, imaginary: logResult.imaginary / log10 }
                };
            }
            case MathematicalOperator.Log2:
            {
                const logResult = this.complexLog(z);
                const log2 = Math.log(2);
                return {
                    type: EduBasicType.Complex,
                    value: { real: logResult.real / log2, imaginary: logResult.imaginary / log2 }
                };
            }

            // Root operators - complex extensions
            case MathematicalOperator.Sqrt:
                return { type: EduBasicType.Complex, value: this.complexSqrt(z) };
            case MathematicalOperator.Cbrt:
            {
                // Cube root: cbrt(z) = exp(log(z) / 3)
                const logResult = this.complexLog(z);
                const logDiv3 = { real: logResult.real / 3, imaginary: logResult.imaginary / 3 };
                return { type: EduBasicType.Complex, value: this.complexExp(logDiv3) };
            }

            // Rounding and truncation operators - not applicable to complex numbers
            case MathematicalOperator.Round:
            case MathematicalOperator.Floor:
            case MathematicalOperator.Ceil:
            case MathematicalOperator.Trunc:
            case MathematicalOperator.Expand:
                throw new Error(`Operator ${this.operator} is not applicable to complex numbers`);

            // Other mathematical operators
            case MathematicalOperator.Sgn:
                throw new Error(`Operator ${this.operator} is not applicable to complex numbers`);

            default:
                throw new Error(`Unknown mathematical operator: ${this.operator}`);
        }
    }

    // Complex number helper functions
    private complexAdd(a: ComplexValue, b: ComplexValue): ComplexValue
    {
        return { real: a.real + b.real, imaginary: a.imaginary + b.imaginary };
    }

    private complexSubtract(a: ComplexValue, b: ComplexValue): ComplexValue
    {
        return { real: a.real - b.real, imaginary: a.imaginary - b.imaginary };
    }

    private complexMultiply(a: ComplexValue, b: ComplexValue): ComplexValue
    {
        return {
            real: a.real * b.real - a.imaginary * b.imaginary,
            imaginary: a.real * b.imaginary + a.imaginary * b.real
        };
    }

    private complexDivide(a: ComplexValue, b: ComplexValue): ComplexValue
    {
        const denominator = b.real * b.real + b.imaginary * b.imaginary;
        if (denominator === 0)
        {
            throw new Error('Division by zero in complex number operation');
        }
        return {
            real: (a.real * b.real + a.imaginary * b.imaginary) / denominator,
            imaginary: (a.imaginary * b.real - a.real * b.imaginary) / denominator
        };
    }

    private complexLog(z: ComplexValue): ComplexValue
    {
        const magnitude = Math.sqrt(z.real * z.real + z.imaginary * z.imaginary);
        const argument = Math.atan2(z.imaginary, z.real);
        return { real: Math.log(magnitude), imaginary: argument };
    }

    private complexExp(z: ComplexValue): ComplexValue
    {
        const expReal = Math.exp(z.real);
        return {
            real: expReal * Math.cos(z.imaginary),
            imaginary: expReal * Math.sin(z.imaginary)
        };
    }

    private complexSqrt(z: ComplexValue): ComplexValue
    {
        const magnitude = Math.sqrt(Math.sqrt(z.real * z.real + z.imaginary * z.imaginary));
        const argument = Math.atan2(z.imaginary, z.real) / 2;
        return {
            real: magnitude * Math.cos(argument),
            imaginary: magnitude * Math.sin(argument)
        };
    }
}

