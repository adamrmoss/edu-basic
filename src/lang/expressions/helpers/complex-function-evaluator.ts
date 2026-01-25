import { EduBasicValue, EduBasicType, ComplexValue } from '../../edu-basic-value';
import { UnaryOperator } from '../unary-expression';

export class ComplexFunctionEvaluator
{
    public evaluate(operator: UnaryOperator, argValue: EduBasicValue): EduBasicValue
    {
        switch (operator)
        {
            case UnaryOperator.Realpart:
                return this.evaluateRealpart(argValue);
            case UnaryOperator.Imagpart:
                return this.evaluateImagpart(argValue);
            default:
                // REAL, IMAG, CONJ, CABS, CARG, CSQRT require complex
                if (argValue.type !== EduBasicType.Complex)
                {
                    throw new Error(`Complex operator ${operator} requires complex number operand, got ${argValue.type}`);
                }
                return this.evaluateComplexOnly(operator, argValue.value);
        }
    }

    private evaluateRealpart(argValue: EduBasicValue): EduBasicValue
    {
        switch (argValue.type)
        {
            case EduBasicType.Integer:
            case EduBasicType.Real:
                return { type: EduBasicType.Real, value: argValue.type === EduBasicType.Integer ? argValue.value : argValue.value };
            case EduBasicType.Complex:
                return { type: EduBasicType.Real, value: argValue.value.real };
            default:
                throw new Error(`REALPART requires numeric operand, got ${argValue.type}`);
        }
    }

    private evaluateImagpart(argValue: EduBasicValue): EduBasicValue
    {
        switch (argValue.type)
        {
            case EduBasicType.Integer:
            case EduBasicType.Real:
                return { type: EduBasicType.Real, value: 0 };
            case EduBasicType.Complex:
                return { type: EduBasicType.Real, value: argValue.value.imaginary };
            default:
                throw new Error(`IMAGPART requires numeric operand, got ${argValue.type}`);
        }
    }

    private evaluateComplexOnly(operator: UnaryOperator, z: { real: number; imaginary: number }): EduBasicValue
    {
        switch (operator)
        {
            case UnaryOperator.Real:
                return { type: EduBasicType.Real, value: z.real };
            case UnaryOperator.Imag:
                return { type: EduBasicType.Real, value: z.imaginary };
            case UnaryOperator.Conj:
                return {
                    type: EduBasicType.Complex,
                    value: { real: z.real, imaginary: -z.imaginary }
                };
            case UnaryOperator.Cabs:
            {
                const magnitude = Math.sqrt(z.real * z.real + z.imaginary * z.imaginary);
                return { type: EduBasicType.Real, value: magnitude };
            }
            case UnaryOperator.Carg:
            {
                const argument = Math.atan2(z.imaginary, z.real);
                return { type: EduBasicType.Real, value: argument };
            }
            case UnaryOperator.Csqrt:
            {
                const magnitude = Math.sqrt(Math.sqrt(z.real * z.real + z.imaginary * z.imaginary));
                const argument = Math.atan2(z.imaginary, z.real) / 2;
                return {
                    type: EduBasicType.Complex,
                    value: {
                        real: magnitude * Math.cos(argument),
                        imaginary: magnitude * Math.sin(argument)
                    }
                };
            }
            default:
                throw new Error(`Unknown complex operator: ${operator}`);
        }
    }
}
