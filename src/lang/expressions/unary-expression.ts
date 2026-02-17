import { Expression } from './expression';
import { EduBasicValue, EduBasicType, ComplexValue } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';
import { MathematicalFunctionEvaluator } from './helpers/mathematical-function-evaluator';
import { ComplexFunctionEvaluator } from './helpers/complex-function-evaluator';
import { StringFunctionEvaluator } from './helpers/string-function-evaluator';
import { TypeConversionEvaluator } from './helpers/type-conversion-evaluator';

/**
 * Unary operators supported by the expression runtime.
 */
export enum UnaryOperator
{
    // Prefix operators
    Plus = '+',
    Minus = '-',
    Not = 'NOT',
    
    // Mathematical functions
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
    Abs = 'ABS',
    
    // Complex functions
    Real = 'REAL',
    Imag = 'IMAG',
    Realpart = 'REALPART',
    Imagpart = 'IMAGPART',
    Conj = 'CONJ',
    Cabs = 'CABS',
    Carg = 'CARG',
    Csqrt = 'CSQRT',
    
    // String manipulation
    Asc = 'ASC',
    Chr = 'CHR',
    Ucase = 'UCASE',
    Lcase = 'LCASE',
    Ltrim = 'LTRIM',
    Rtrim = 'RTRIM',
    Trim = 'TRIM',
    Reverse = 'REVERSE',
    
    // Type conversion
    Int = 'INT',
    Str = 'STR',
    Val = 'VAL',
    Hex = 'HEX',
    Bin = 'BIN',

    // Audio operators
    Notes = 'NOTES',
}

/**
 * Category discriminator for unary operators.
 */
export enum UnaryOperatorCategory
{
    Prefix,
    Mathematical,
    Complex,
    StringManipulation,
    TypeConversion,
    Audio,
}

/**
 * Expression node representing the application of a unary operator to an operand.
 */
export class UnaryExpression extends Expression
{
    private readonly mathEvaluator = new MathematicalFunctionEvaluator();
    private readonly complexEvaluator = new ComplexFunctionEvaluator();
    private readonly stringEvaluator = new StringFunctionEvaluator();
    private readonly typeConversionEvaluator = new TypeConversionEvaluator();

    /**
     * Unary operator applied by this node.
     */
    public readonly operator: UnaryOperator;

    /**
     * Operand expression.
     */
    public readonly operand: Expression;

    /**
     * Operator category used to select the evaluation strategy.
     */
    public readonly category: UnaryOperatorCategory;

    /**
     * Create a new unary expression node.
     *
     * @param operator Operator to apply.
     * @param operand Operand expression.
     * @param category Operator category.
     */
    public constructor(operator: UnaryOperator, operand: Expression, category: UnaryOperatorCategory)
    {
        super();
        this.operator = operator;
        this.operand = operand;
        this.category = category;
    }

    /**
     * Evaluate the operand and apply the operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const operandValue = this.operand.evaluate(context);

        switch (this.category)
        {
            case UnaryOperatorCategory.Prefix:
                return this.evaluatePrefix(operandValue);
            case UnaryOperatorCategory.Mathematical:
                return this.mathEvaluator.evaluate(this.operator, operandValue);
            case UnaryOperatorCategory.Complex:
                return this.complexEvaluator.evaluate(this.operator, operandValue);
            case UnaryOperatorCategory.StringManipulation:
                return this.stringEvaluator.evaluate(this.operator, operandValue);
            case UnaryOperatorCategory.TypeConversion:
                return this.typeConversionEvaluator.evaluate(this.operator, operandValue);
            case UnaryOperatorCategory.Audio:
                return this.evaluateAudio(operandValue, context);
            default:
                throw new Error(`Unknown unary operator category: ${this.category}`);
        }
    }

    private evaluatePrefix(operandValue: EduBasicValue): EduBasicValue
    {
        switch (this.operator)
        {
            case UnaryOperator.Plus:
                return operandValue;

            case UnaryOperator.Minus:
            {
                if (operandValue.type === EduBasicType.Integer)
                {
                    return { type: EduBasicType.Integer, value: -operandValue.value };
                }
                else if (operandValue.type === EduBasicType.Real)
                {
                    return { type: EduBasicType.Real, value: -operandValue.value };
                }
                else if (operandValue.type === EduBasicType.Complex)
                {
                    return {
                        type: EduBasicType.Complex,
                        value: {
                            real: -operandValue.value.real,
                            imaginary: -operandValue.value.imaginary
                        }
                    };
                }
                
                throw new Error(`Cannot negate ${operandValue.type}`);
            }

            case UnaryOperator.Not:
            {
                const num = this.toNumber(operandValue);
                return { type: EduBasicType.Integer, value: ~Math.floor(num) };
            }

            default:
                throw new Error(`Unknown prefix operator: ${this.operator}`);
        }
    }

    private evaluateAudio(operandValue: EduBasicValue, context: ExecutionContext): EduBasicValue
    {
        switch (this.operator)
        {
            case UnaryOperator.Notes:
            {
                // Spec: docs/edu-basic-language.md
                // - Syntax: NOTES voiceNumber%
                // - Description: number of notes remaining in the voice (0-7)
                //
                // NOTE: Expression evaluation only receives ExecutionContext, so this operator
                // reads Audio via context.getAudio(). If audio is unavailable (e.g. tests / non-browser),
                // it returns 0.
                const audio = context.getAudio();
                if (!audio)
                {
                    return { type: EduBasicType.Integer, value: 0 };
                }

                const voiceIndex = Math.floor(this.toNumber(operandValue));
                const remaining = audio.getNotesRemaining(voiceIndex);
                return { type: EduBasicType.Integer, value: remaining };
            }

            default:
                throw new Error(`Unknown audio operator: ${this.operator}`);
        }
    }

    private toNumber(value: EduBasicValue): number
    {
        if (value.type === EduBasicType.Integer || value.type === EduBasicType.Real)
        {
            return value.value;
        }
        
        throw new Error(`Cannot convert ${value.type} to number`);
    }

    public toString(omitOuterParens: boolean = true): string
    {
        if (this.category === UnaryOperatorCategory.Prefix)
        {
            return `${this.operator}${this.operand.toString()}`;
        }
        
        // Unary keyword-operators are formatted as prefix operators.
        // Parentheses are only grouping in EduBASIC and are emitted by the operand expression itself
        // (e.g. SIN (x + y)).
        const argStr = this.operand.toString();
        if (this.category === UnaryOperatorCategory.Audio)
        {
            return `${this.operator} ${argStr}`;
        }
        return `${this.operator}${argStr}`;
    }
}
