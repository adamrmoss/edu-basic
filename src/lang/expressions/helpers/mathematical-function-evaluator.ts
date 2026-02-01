import { EduBasicValue, EduBasicType, ComplexValue } from '../../edu-basic-value';
import { UnaryOperator } from '../unary-expression';

/**
 * Evaluator for mathematical unary operators (real and complex).
 */
export class MathematicalFunctionEvaluator
{
    /**
     * Evaluate a mathematical unary operator.
     *
     * @param operator Unary operator to evaluate.
     * @param argValue Argument value.
     * @returns The evaluated runtime value.
     */
    public evaluate(operator: UnaryOperator, argValue: EduBasicValue): EduBasicValue
    {
        if (argValue.type === EduBasicType.Complex)
        {
            return this.evaluateComplex(operator, argValue.value);
        }
        else if (argValue.type === EduBasicType.Integer || argValue.type === EduBasicType.Real)
        {
            const numValue = argValue.type === EduBasicType.Integer ? argValue.value : argValue.value;
            return this.evaluateReal(operator, numValue);
        }
        else
        {
            throw new Error(`Mathematical operator ${operator} requires numeric operand, got ${argValue.type}`);
        }
    }

    private evaluateReal(operator: UnaryOperator, value: number): EduBasicValue
    {
        // Check if operation requires complex numbers and upcast if needed
        const needsComplex = this.requiresComplex(operator, value);
        if (needsComplex)
        {
            return this.evaluateComplex(operator, { real: value, imaginary: 0 });
        }

        switch (operator)
        {
            // Trigonometric
            case UnaryOperator.Sin:
                return { type: EduBasicType.Real, value: Math.sin(value) };
            case UnaryOperator.Cos:
                return { type: EduBasicType.Real, value: Math.cos(value) };
            case UnaryOperator.Tan:
                return { type: EduBasicType.Real, value: Math.tan(value) };
            case UnaryOperator.Asin:
                return { type: EduBasicType.Real, value: Math.asin(value) };
            case UnaryOperator.Acos:
                return { type: EduBasicType.Real, value: Math.acos(value) };
            case UnaryOperator.Atan:
                return { type: EduBasicType.Real, value: Math.atan(value) };

            // Hyperbolic
            case UnaryOperator.Sinh:
                return { type: EduBasicType.Real, value: Math.sinh(value) };
            case UnaryOperator.Cosh:
                return { type: EduBasicType.Real, value: Math.cosh(value) };
            case UnaryOperator.Tanh:
                return { type: EduBasicType.Real, value: Math.tanh(value) };
            case UnaryOperator.Asinh:
                return { type: EduBasicType.Real, value: Math.asinh(value) };
            case UnaryOperator.Acosh:
                return { type: EduBasicType.Real, value: Math.acosh(value) };
            case UnaryOperator.Atanh:
                return { type: EduBasicType.Real, value: Math.atanh(value) };

            // Exponential and logarithmic
            case UnaryOperator.Exp:
                return { type: EduBasicType.Real, value: Math.exp(value) };
            case UnaryOperator.Log:
                return { type: EduBasicType.Real, value: Math.log(value) };
            case UnaryOperator.Log10:
                return { type: EduBasicType.Real, value: Math.log10(value) };
            case UnaryOperator.Log2:
                return { type: EduBasicType.Real, value: Math.log2(value) };

            // Roots
            case UnaryOperator.Sqrt:
                return { type: EduBasicType.Real, value: Math.sqrt(value) };
            case UnaryOperator.Cbrt:
                return { type: EduBasicType.Real, value: Math.cbrt(value) };

            // Rounding
            case UnaryOperator.Round:
                return { type: EduBasicType.Real, value: Math.round(value) };
            case UnaryOperator.Floor:
                return { type: EduBasicType.Real, value: Math.floor(value) };
            case UnaryOperator.Ceil:
                return { type: EduBasicType.Real, value: Math.ceil(value) };
            case UnaryOperator.Trunc:
                return { type: EduBasicType.Real, value: Math.trunc(value) };
            case UnaryOperator.Expand:
                return { type: EduBasicType.Real, value: value >= 0 ? Math.ceil(value) : Math.floor(value) };

            // Other
            case UnaryOperator.Sgn:
                return { type: EduBasicType.Integer, value: value > 0 ? 1 : value < 0 ? -1 : 0 };
            case UnaryOperator.Abs:
                return { type: EduBasicType.Real, value: Math.abs(value) };

            default:
                throw new Error(`Unknown mathematical operator: ${operator}`);
        }
    }

    private evaluateComplex(operator: UnaryOperator, z: ComplexValue): EduBasicValue
    {
        switch (operator)
        {
            // Trigonometric - complex extensions
            case UnaryOperator.Sin:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: Math.sin(z.real) * Math.cosh(z.imaginary),
                        imaginary: Math.cos(z.real) * Math.sinh(z.imaginary)
                    }
                };
            case UnaryOperator.Cos:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: Math.cos(z.real) * Math.cosh(z.imaginary),
                        imaginary: -Math.sin(z.real) * Math.sinh(z.imaginary)
                    }
                };
            case UnaryOperator.Tan:
            {
                const sinZ = {
                    real: Math.sin(z.real) * Math.cosh(z.imaginary),
                    imaginary: Math.cos(z.real) * Math.sinh(z.imaginary)
                };
                const cosZ = {
                    real: Math.cos(z.real) * Math.cosh(z.imaginary),
                    imaginary: -Math.sin(z.real) * Math.sinh(z.imaginary)
                };
                return { type: EduBasicType.Complex, value: this.complexDivide(sinZ, cosZ) };
            }
            case UnaryOperator.Asin:
            {
                const iz = { real: -z.imaginary, imaginary: z.real };
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
            case UnaryOperator.Acos:
            {
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
            case UnaryOperator.Atan:
            {
                const iz = { real: -z.imaginary, imaginary: z.real };
                const oneMinusIZ = this.complexSubtract({ real: 1, imaginary: 0 }, iz);
                const onePlusIZ = this.complexAdd({ real: 1, imaginary: 0 }, iz);
                const quotient = this.complexDivide(oneMinusIZ, onePlusIZ);
                const logResult = this.complexLog(quotient);
                return {
                    type: EduBasicType.Complex,
                    value: { real: -logResult.imaginary / 2, imaginary: logResult.real / 2 }
                };
            }

            // Hyperbolic - complex extensions
            case UnaryOperator.Sinh:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: Math.sinh(z.real) * Math.cos(z.imaginary),
                        imaginary: Math.cosh(z.real) * Math.sin(z.imaginary)
                    }
                };
            case UnaryOperator.Cosh:
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: Math.cosh(z.real) * Math.cos(z.imaginary),
                        imaginary: Math.sinh(z.real) * Math.sin(z.imaginary)
                    }
                };
            case UnaryOperator.Tanh:
            {
                const sinhZ = {
                    real: Math.sinh(z.real) * Math.cos(z.imaginary),
                    imaginary: Math.cosh(z.real) * Math.sin(z.imaginary)
                };
                const coshZ = {
                    real: Math.cosh(z.real) * Math.cos(z.imaginary),
                    imaginary: Math.sinh(z.real) * Math.sin(z.imaginary)
                };
                return { type: EduBasicType.Complex, value: this.complexDivide(sinhZ, coshZ) };
            }
            case UnaryOperator.Asinh:
            {
                const zSquared = this.complexMultiply(z, z);
                const zSquaredPlusOne = this.complexAdd(zSquared, { real: 1, imaginary: 0 });
                const sqrt = this.complexSqrt(zSquaredPlusOne);
                const sum = this.complexAdd(z, sqrt);
                return { type: EduBasicType.Complex, value: this.complexLog(sum) };
            }
            case UnaryOperator.Acosh:
            {
                const zSquared = this.complexMultiply(z, z);
                const zSquaredMinusOne = this.complexSubtract(zSquared, { real: 1, imaginary: 0 });
                const sqrt = this.complexSqrt(zSquaredMinusOne);
                const sum = this.complexAdd(z, sqrt);
                return { type: EduBasicType.Complex, value: this.complexLog(sum) };
            }
            case UnaryOperator.Atanh:
            {
                const onePlusZ = this.complexAdd({ real: 1, imaginary: 0 }, z);
                const oneMinusZ = this.complexSubtract({ real: 1, imaginary: 0 }, z);
                const quotient = this.complexDivide(onePlusZ, oneMinusZ);
                const logResult = this.complexLog(quotient);
                return {
                    type: EduBasicType.Complex,
                    value: { real: logResult.real / 2, imaginary: logResult.imaginary / 2 }
                };
            }

            // Exponential and logarithmic
            case UnaryOperator.Exp:
            {
                const expReal = Math.exp(z.real);
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: expReal * Math.cos(z.imaginary),
                        imaginary: expReal * Math.sin(z.imaginary)
                    }
                };
            }
            case UnaryOperator.Log:
                return { type: EduBasicType.Complex, value: this.complexLog(z) };
            case UnaryOperator.Log10:
            {
                const logResult = this.complexLog(z);
                const log10 = Math.log(10);
                return {
                    type: EduBasicType.Complex,
                    value: { real: logResult.real / log10, imaginary: logResult.imaginary / log10 }
                };
            }
            case UnaryOperator.Log2:
            {
                const logResult = this.complexLog(z);
                const log2 = Math.log(2);
                return {
                    type: EduBasicType.Complex,
                    value: { real: logResult.real / log2, imaginary: logResult.imaginary / log2 }
                };
            }

            // Roots
            case UnaryOperator.Sqrt:
                return { type: EduBasicType.Complex, value: this.complexSqrt(z) };
            case UnaryOperator.Cbrt:
            {
                const logResult = this.complexLog(z);
                const logDiv3 = { real: logResult.real / 3, imaginary: logResult.imaginary / 3 };
                return { type: EduBasicType.Complex, value: this.complexExp(logDiv3) };
            }
            case UnaryOperator.Abs:
            {
                const magnitude = Math.sqrt(z.real * z.real + z.imaginary * z.imaginary);
                return { type: EduBasicType.Real, value: magnitude };
            }

            // Not applicable to complex
            case UnaryOperator.Round:
            case UnaryOperator.Floor:
            case UnaryOperator.Ceil:
            case UnaryOperator.Trunc:
            case UnaryOperator.Expand:
            case UnaryOperator.Sgn:
                throw new Error(`Operator ${operator} is not applicable to complex numbers`);

            default:
                throw new Error(`Unknown mathematical operator: ${operator}`);
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

    private requiresComplex(operator: UnaryOperator, value: number): boolean
    {
        switch (operator)
        {
            case UnaryOperator.Sqrt:
                return value < 0;
            case UnaryOperator.Log:
            case UnaryOperator.Log10:
            case UnaryOperator.Log2:
                return value < 0; // log(0) = -Infinity (real), log(negative) = complex
            case UnaryOperator.Asin:
            case UnaryOperator.Acos:
                return value < -1 || value > 1;
            case UnaryOperator.Acosh:
                return value < 1;
            case UnaryOperator.Atanh:
                return value <= -1 || value >= 1;
            default:
                return false;
        }
    }
}
