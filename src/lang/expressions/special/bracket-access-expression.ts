import { Expression } from '../expression';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';
import { VariableExpression } from './variable-expression';

export class BracketAccessExpression extends Expression
{
    public constructor(
        public readonly baseExpr: Expression,
        public readonly bracketExpr: Expression | null,
        public readonly bracketIdentifier: string | null
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const baseValue = this.evaluateBaseValue(context);

        if (baseValue.type === EduBasicType.Array)
        {
            const dimensions = baseValue.dimensions;
            if (dimensions && dimensions.length > 1)
            {
                throw new Error('BracketAccessExpression: multi-dimensional arrays require comma-separated indices (e.g., a#[i, j])');
            }

            const indexValue = this.evaluateIndexValue(context);
            const index = this.toOneBasedIndex(indexValue);
            if (index === null)
            {
                throw new Error('Array index is out of bounds');
            }

            const lower = dimensions && dimensions.length === 1 ? dimensions[0].lower : 1;
            const length = dimensions && dimensions.length === 1 ? dimensions[0].length : baseValue.value.length;
            const stride = dimensions && dimensions.length === 1 ? dimensions[0].stride : 1;

            const offset = index - lower;
            const flatIndex = offset * stride;
            if (offset < 0 || offset >= length || flatIndex < 0 || flatIndex >= baseValue.value.length)
            {
                throw new Error('Array index is out of bounds');
            }

            return baseValue.value[flatIndex] ?? BracketAccessExpression.getDefaultValueForType(baseValue.elementType);
        }

        if (baseValue.type === EduBasicType.Structure)
        {
            const key = this.getStructureKey(context);
            if (!key)
            {
                return { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() };
            }

            const found = BracketAccessExpression.tryGetStructureMember(baseValue.value, key);
            if (found !== null)
            {
                return found;
            }

            return BracketAccessExpression.getDefaultValueForName(key);
        }

        throw new Error(`Cannot apply [ ] to ${baseValue.type}`);
    }

    public toString(omitOuterParens?: boolean): string
    {
        const inside = this.bracketIdentifier ? this.bracketIdentifier : (this.bracketExpr ? this.bracketExpr.toString() : '');
        return `${this.baseExpr.toString()}[${inside}]`;
    }

    private evaluateBaseValue(context: ExecutionContext): EduBasicValue
    {
        if (this.baseExpr instanceof VariableExpression)
        {
            const baseName = this.baseExpr.name;

            if (baseName.endsWith('[]'))
            {
                return context.getVariable(baseName);
            }

            const sigil = baseName.charAt(baseName.length - 1);
            const isTypedArrayBase = sigil === '%' || sigil === '#' || sigil === '$' || sigil === '&';
            const arrayName = `${baseName}[]`;

            if (isTypedArrayBase)
            {
                // Typed arrays default to empty arrays when not declared.
                return context.getVariable(arrayName);
            }

            // Untyped identifiers are generally structures; only treat as an array if it actually exists.
            if (context.hasVariable(arrayName))
            {
                return context.getVariable(arrayName);
            }
        }

        return this.baseExpr.evaluate(context);
    }

    private evaluateIndexValue(context: ExecutionContext): EduBasicValue
    {
        if (this.bracketExpr)
        {
            return this.bracketExpr.evaluate(context);
        }

        if (this.bracketIdentifier)
        {
            return new VariableExpression(this.bracketIdentifier).evaluate(context);
        }

        return { type: EduBasicType.Integer, value: 0 };
    }

    private toOneBasedIndex(value: EduBasicValue): number | null
    {
        switch (value.type)
        {
            case EduBasicType.Integer:
                return Math.trunc(value.value);
            case EduBasicType.Real:
                return Math.trunc(value.value);
            case EduBasicType.Complex:
                return Math.trunc(value.value.real);
            case EduBasicType.String:
            {
                const parsed = Number.parseInt(value.value, 10);
                return Number.isFinite(parsed) ? parsed : null;
            }
            default:
                return null;
        }
    }

    private getStructureKey(context: ExecutionContext): string
    {
        if (this.bracketIdentifier)
        {
            return this.bracketIdentifier;
        }

        if (!this.bracketExpr)
        {
            return '';
        }

        const value = this.bracketExpr.evaluate(context);
        if (value.type === EduBasicType.String)
        {
            return value.value;
        }

        if (value.type === EduBasicType.Integer || value.type === EduBasicType.Real)
        {
            return String(value.value);
        }

        if (value.type === EduBasicType.Complex)
        {
            return `${value.value.real}+${value.value.imaginary}i`;
        }

        return value.type;
    }

    private static tryGetStructureMember(map: Map<string, EduBasicValue>, key: string): EduBasicValue | null
    {
        const direct = map.get(key);
        if (direct)
        {
            return direct;
        }

        const upperKey = key.toUpperCase();
        for (const [k, v] of map.entries())
        {
            if (k.toUpperCase() === upperKey)
            {
                return v;
            }
        }

        return null;
    }

    private static getDefaultValueForName(name: string): EduBasicValue
    {
        if (name.endsWith('[]'))
        {
            const sigil = name.charAt(name.length - 3);
            switch (sigil)
            {
                case '%':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer };
                case '#':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Real };
                case '$':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.String };
                case '&':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Complex };
                default:
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Structure };
            }
        }

        const sigil = name.charAt(name.length - 1);
        switch (sigil)
        {
            case '%':
                return { type: EduBasicType.Integer, value: 0 };
            case '#':
                return { type: EduBasicType.Real, value: 0.0 };
            case '$':
                return { type: EduBasicType.String, value: '' };
            case '&':
                return { type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } };
            default:
                return { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() };
        }
    }

    private static getDefaultValueForType(type: EduBasicType): EduBasicValue
    {
        switch (type)
        {
            case EduBasicType.Integer:
                return { type: EduBasicType.Integer, value: 0 };
            case EduBasicType.Real:
                return { type: EduBasicType.Real, value: 0.0 };
            case EduBasicType.String:
                return { type: EduBasicType.String, value: '' };
            case EduBasicType.Complex:
                return { type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } };
            case EduBasicType.Array:
                return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer };
            case EduBasicType.Structure:
                return { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() };
        }
    }
}

