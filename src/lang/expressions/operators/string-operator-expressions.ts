import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class LeftOperatorExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly lengthExpr: Expression
    )
    {
        super();
    }

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

export class RightOperatorExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly lengthExpr: Expression
    )
    {
        super();
    }

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

export class MidOperatorExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly startExpr: Expression,
        public readonly endExpr: Expression
    )
    {
        super();
    }

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

export class InstrOperatorExpression extends Expression
{
    public constructor(
        public readonly haystackExpr: Expression,
        public readonly needleExpr: Expression,
        public readonly fromExpr: Expression | null
    )
    {
        super();
    }

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

export class ReplaceOperatorExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly oldExpr: Expression,
        public readonly newExpr: Expression
    )
    {
        super();
    }

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

export class JoinOperatorExpression extends Expression
{
    public constructor(
        public readonly arrayExpr: Expression,
        public readonly separatorExpr: Expression
    )
    {
        super();
    }

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

export class StartsWithOperatorExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly prefixExpr: Expression
    )
    {
        super();
    }

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

export class EndsWithOperatorExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly suffixExpr: Expression
    )
    {
        super();
    }

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

