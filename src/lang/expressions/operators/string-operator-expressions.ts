import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

/**
 * Expression nodes for string operator keywords.
 */
export class LeftOperatorExpression extends Expression
{
    /**
     * String operand expression (left side).
     */
    public readonly stringExpr: Expression;

    /**
     * Length operand expression (right side).
     */
    public readonly lengthExpr: Expression;

    /**
     * Create a new `LEFT` operator expression.
     *
     * @param stringExpr String operand expression.
     * @param lengthExpr Length operand expression.
     */
    public constructor(stringExpr: Expression, lengthExpr: Expression)
    {
        super();
        this.stringExpr = stringExpr;
        this.lengthExpr = lengthExpr;
    }

    /**
     * Evaluate the operands and apply the `LEFT` operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const strValue = this.stringExpr.evaluate(context);
        if (strValue.type !== EduBasicType.String)
        {
            throw new Error(`LEFT requires string as left operand, got ${strValue.type}`);
        }

        const length = this.toInteger(this.lengthExpr.evaluate(context));
        return { type: EduBasicType.String, value: strValue.value.substring(0, Math.max(0, length)) };
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.stringExpr.toString()} LEFT ${this.lengthExpr.toString()}`;
    }

    private toInteger(value: EduBasicValue): number
    {
        if (value.type === EduBasicType.Integer)
        {
            return value.value;
        }
        if (value.type === EduBasicType.Real)
        {
            return Math.trunc(value.value);
        }
        throw new Error(`Cannot convert ${value.type} to integer`);
    }
}

/**
 * Expression node for the `RIGHT` operator.
 */
export class RightOperatorExpression extends Expression
{
    /**
     * String operand expression (left side).
     */
    public readonly stringExpr: Expression;

    /**
     * Length operand expression (right side).
     */
    public readonly lengthExpr: Expression;

    /**
     * Create a new `RIGHT` operator expression.
     *
     * @param stringExpr String operand expression.
     * @param lengthExpr Length operand expression.
     */
    public constructor(stringExpr: Expression, lengthExpr: Expression)
    {
        super();
        this.stringExpr = stringExpr;
        this.lengthExpr = lengthExpr;
    }

    /**
     * Evaluate the operands and apply the `RIGHT` operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const strValue = this.stringExpr.evaluate(context);
        if (strValue.type !== EduBasicType.String)
        {
            throw new Error(`RIGHT requires string as left operand, got ${strValue.type}`);
        }

        const length = this.toInteger(this.lengthExpr.evaluate(context));
        const start = Math.max(0, strValue.value.length - length);
        return { type: EduBasicType.String, value: strValue.value.substring(start) };
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.stringExpr.toString()} RIGHT ${this.lengthExpr.toString()}`;
    }

    private toInteger(value: EduBasicValue): number
    {
        if (value.type === EduBasicType.Integer)
        {
            return value.value;
        }
        if (value.type === EduBasicType.Real)
        {
            return Math.trunc(value.value);
        }
        throw new Error(`Cannot convert ${value.type} to integer`);
    }
}

/**
 * Expression node for the `MID ... TO ...` operator.
 */
export class MidOperatorExpression extends Expression
{
    /**
     * String operand expression (left side).
     */
    public readonly stringExpr: Expression;

    /**
     * Start index expression (1-based).
     */
    public readonly startExpr: Expression;

    /**
     * End index expression (1-based).
     */
    public readonly endExpr: Expression;

    /**
     * Create a new `MID` operator expression.
     *
     * @param stringExpr String operand expression.
     * @param startExpr Start index expression (1-based).
     * @param endExpr End index expression (1-based).
     */
    public constructor(stringExpr: Expression, startExpr: Expression, endExpr: Expression)
    {
        super();
        this.stringExpr = stringExpr;
        this.startExpr = startExpr;
        this.endExpr = endExpr;
    }

    /**
     * Evaluate the operands and apply the `MID` operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const strValue = this.stringExpr.evaluate(context);
        if (strValue.type !== EduBasicType.String)
        {
            throw new Error(`MID requires string as left operand, got ${strValue.type}`);
        }

        const startOneBased = this.toInteger(this.startExpr.evaluate(context));
        const endOneBased = this.toInteger(this.endExpr.evaluate(context));

        const startPos = Math.max(0, startOneBased - 1);
        const endExclusive = Math.min(strValue.value.length, endOneBased);

        if (endExclusive <= startPos)
        {
            return { type: EduBasicType.String, value: '' };
        }

        return { type: EduBasicType.String, value: strValue.value.substring(startPos, endExclusive) };
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.stringExpr.toString()} MID ${this.startExpr.toString()} TO ${this.endExpr.toString()}`;
    }

    private toInteger(value: EduBasicValue): number
    {
        if (value.type === EduBasicType.Integer)
        {
            return value.value;
        }
        if (value.type === EduBasicType.Real)
        {
            return Math.trunc(value.value);
        }
        throw new Error(`Cannot convert ${value.type} to integer`);
    }
}

/**
 * Expression node for the `INSTR` operator.
 */
export class InstrOperatorExpression extends Expression
{
    /**
     * Haystack string expression.
     */
    public readonly haystackExpr: Expression;

    /**
     * Needle string expression.
     */
    public readonly needleExpr: Expression;

    /**
     * Optional 1-based starting index expression.
     */
    public readonly fromExpr: Expression | null;

    /**
     * Create a new `INSTR` operator expression.
     *
     * @param haystackExpr Haystack string expression.
     * @param needleExpr Needle string expression.
     * @param fromExpr Optional 1-based start index expression.
     */
    public constructor(haystackExpr: Expression, needleExpr: Expression, fromExpr: Expression | null)
    {
        super();
        this.haystackExpr = haystackExpr;
        this.needleExpr = needleExpr;
        this.fromExpr = fromExpr;
    }

    /**
     * Evaluate the operands and apply the `INSTR` operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const haystackValue = this.haystackExpr.evaluate(context);
        const needleValue = this.needleExpr.evaluate(context);

        if (haystackValue.type !== EduBasicType.String || needleValue.type !== EduBasicType.String)
        {
            throw new Error('INSTR requires two string operands');
        }

        let startOneBased = 1;
        if (this.fromExpr !== null)
        {
            startOneBased = this.toInteger(this.fromExpr.evaluate(context));
        }

        const startIndex = Math.max(0, startOneBased - 1);
        const index = haystackValue.value.indexOf(needleValue.value, startIndex);

        return { type: EduBasicType.Integer, value: index >= 0 ? index + 1 : 0 };
    }

    public toString(omitOuterParens?: boolean): string
    {
        if (this.fromExpr === null)
        {
            return `${this.haystackExpr.toString()} INSTR ${this.needleExpr.toString()}`;
        }

        return `${this.haystackExpr.toString()} INSTR ${this.needleExpr.toString()} FROM ${this.fromExpr.toString()}`;
    }

    private toInteger(value: EduBasicValue): number
    {
        if (value.type === EduBasicType.Integer)
        {
            return value.value;
        }
        if (value.type === EduBasicType.Real)
        {
            return Math.trunc(value.value);
        }
        throw new Error(`Cannot convert ${value.type} to integer`);
    }
}

/**
 * Expression node for the `REPLACE ... WITH ...` operator.
 */
export class ReplaceOperatorExpression extends Expression
{
    /**
     * String operand expression.
     */
    public readonly stringExpr: Expression;

    /**
     * Substring to replace.
     */
    public readonly oldExpr: Expression;

    /**
     * Replacement substring.
     */
    public readonly newExpr: Expression;

    /**
     * Create a new `REPLACE` operator expression.
     *
     * @param stringExpr String operand expression.
     * @param oldExpr Substring to replace.
     * @param newExpr Replacement substring.
     */
    public constructor(stringExpr: Expression, oldExpr: Expression, newExpr: Expression)
    {
        super();
        this.stringExpr = stringExpr;
        this.oldExpr = oldExpr;
        this.newExpr = newExpr;
    }

    /**
     * Evaluate the operands and apply the `REPLACE` operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const strValue = this.stringExpr.evaluate(context);
        const oldValue = this.oldExpr.evaluate(context);
        const newValue = this.newExpr.evaluate(context);

        if (strValue.type !== EduBasicType.String || oldValue.type !== EduBasicType.String || newValue.type !== EduBasicType.String)
        {
            throw new Error('REPLACE requires string operands');
        }

        const escaped = oldValue.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return { type: EduBasicType.String, value: strValue.value.replace(new RegExp(escaped, 'g'), newValue.value) };
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.stringExpr.toString()} REPLACE ${this.oldExpr.toString()} WITH ${this.newExpr.toString()}`;
    }
}

/**
 * Expression node for the `JOIN` operator.
 */
export class JoinOperatorExpression extends Expression
{
    /**
     * Array operand expression (left side).
     */
    public readonly arrayExpr: Expression;

    /**
     * Separator expression (right side).
     */
    public readonly separatorExpr: Expression;

    /**
     * Create a new `JOIN` operator expression.
     *
     * @param arrayExpr Array operand expression.
     * @param separatorExpr Separator expression.
     */
    public constructor(arrayExpr: Expression, separatorExpr: Expression)
    {
        super();
        this.arrayExpr = arrayExpr;
        this.separatorExpr = separatorExpr;
    }

    /**
     * Evaluate the operands and apply the `JOIN` operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const arrayValue = this.arrayExpr.evaluate(context);
        const separatorValue = this.separatorExpr.evaluate(context);

        if (arrayValue.type !== EduBasicType.Array)
        {
            throw new Error(`JOIN requires array as left operand, got ${arrayValue.type}`);
        }

        if (arrayValue.dimensions && arrayValue.dimensions.length > 1)
        {
            throw new Error('JOIN is only supported for 1D arrays');
        }
        if (separatorValue.type !== EduBasicType.String)
        {
            throw new Error(`JOIN requires string separator, got ${separatorValue.type}`);
        }

        const strings = arrayValue.value.map((el) =>
        {
            if (el.type !== EduBasicType.String)
            {
                throw new Error(`JOIN array elements must be strings, got ${el.type}`);
            }
            return el.value;
        });

        return { type: EduBasicType.String, value: strings.join(separatorValue.value) };
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.arrayExpr.toString()} JOIN ${this.separatorExpr.toString()}`;
    }
}

/**
 * Expression node for the `STARTSWITH` operator.
 */
export class StartsWithOperatorExpression extends Expression
{
    /**
     * String operand expression (left side).
     */
    public readonly stringExpr: Expression;

    /**
     * Prefix expression (right side).
     */
    public readonly prefixExpr: Expression;

    /**
     * Create a new `STARTSWITH` operator expression.
     *
     * @param stringExpr String operand expression.
     * @param prefixExpr Prefix expression.
     */
    public constructor(stringExpr: Expression, prefixExpr: Expression)
    {
        super();
        this.stringExpr = stringExpr;
        this.prefixExpr = prefixExpr;
    }

    /**
     * Evaluate the operands and apply the `STARTSWITH` operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const strValue = this.stringExpr.evaluate(context);
        const prefixValue = this.prefixExpr.evaluate(context);

        if (strValue.type !== EduBasicType.String || prefixValue.type !== EduBasicType.String)
        {
            throw new Error('STARTSWITH requires string operands');
        }

        return { type: EduBasicType.Integer, value: strValue.value.startsWith(prefixValue.value) ? -1 : 0 };
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.stringExpr.toString()} STARTSWITH ${this.prefixExpr.toString()}`;
    }
}

/**
 * Expression node for the `ENDSWITH` operator.
 */
export class EndsWithOperatorExpression extends Expression
{
    /**
     * String operand expression (left side).
     */
    public readonly stringExpr: Expression;

    /**
     * Suffix expression (right side).
     */
    public readonly suffixExpr: Expression;

    /**
     * Create a new `ENDSWITH` operator expression.
     *
     * @param stringExpr String operand expression.
     * @param suffixExpr Suffix expression.
     */
    public constructor(stringExpr: Expression, suffixExpr: Expression)
    {
        super();
        this.stringExpr = stringExpr;
        this.suffixExpr = suffixExpr;
    }

    /**
     * Evaluate the operands and apply the `ENDSWITH` operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const strValue = this.stringExpr.evaluate(context);
        const suffixValue = this.suffixExpr.evaluate(context);

        if (strValue.type !== EduBasicType.String || suffixValue.type !== EduBasicType.String)
        {
            throw new Error('ENDSWITH requires string operands');
        }

        return { type: EduBasicType.Integer, value: strValue.value.endsWith(suffixValue.value) ? -1 : 0 };
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.stringExpr.toString()} ENDSWITH ${this.suffixExpr.toString()}`;
    }
}

