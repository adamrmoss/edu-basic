import { Expression } from '../expression';
import { EduBasicType, EduBasicValue, tryGetArrayRankSuffixFromName } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';
import { VariableExpression } from './variable-expression';
import { StructureMemberExpression } from './structure-member-expression';

/**
 * Expression node for multi-index array access (`base[i, j, ...]`).
 */
export class MultiIndexBracketAccessExpression extends Expression
{
    /**
     * Base expression expected to evaluate to a dimensioned array.
     */
    public readonly baseExpr: Expression;

    /**
     * Index expressions (1-based), one per array dimension.
     */
    public readonly indices: Expression[];

    /**
     * Create a new multi-index bracket access expression.
     *
     * @param baseExpr Base expression expected to evaluate to an array.
     * @param indices Index expressions (1-based), one per dimension.
     */
    public constructor(baseExpr: Expression, indices: Expression[])
    {
        super();
        this.baseExpr = baseExpr;
        this.indices = indices;
    }

    /**
     * Evaluate the base array and indices, then return the referenced element.
     *
     * @param context Execution context to evaluate against.
     * @returns The referenced element value (or a type-appropriate default).
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        let baseValue = this.baseExpr.evaluate(context);

        if (baseValue.type !== EduBasicType.Array && this.baseExpr instanceof VariableExpression)
        {
            const baseName = this.baseExpr.name;
            const sigil = baseName.charAt(baseName.length - 1);
            const isTypedArrayBase = sigil === '%' || sigil === '#' || sigil === '$' || sigil === '&';

            if (isTypedArrayBase)
            {
                const rankSuffix = `[${','.repeat(Math.max(0, this.indices.length - 1))}]`;
                baseValue = context.getVariable(`${baseName}${rankSuffix}`);
            }
        }

        if (baseValue.type !== EduBasicType.Array && this.baseExpr instanceof StructureMemberExpression)
        {
            const structureValue = this.baseExpr.structureExpr.evaluate(context);
            if (structureValue.type === EduBasicType.Structure)
            {
                const memberName = this.baseExpr.memberName;
                const memberSuffix = tryGetArrayRankSuffixFromName(memberName);
                if (memberSuffix !== null)
                {
                    baseValue = this.baseExpr.evaluate(context);
                }
                else
                {
                    const rankSuffix = `[${','.repeat(Math.max(0, this.indices.length - 1))}]`;
                    const inferredArrayName = `${memberName}${rankSuffix}`;

                    const found = this.tryGetStructureMember(structureValue.value, inferredArrayName);
                    if (found !== null)
                    {
                        baseValue = found;
                    }
                    else
                    {
                        baseValue = this.getDefaultValueForName(inferredArrayName);
                    }
                }
            }
        }

        if (baseValue.type !== EduBasicType.Array)
        {
            throw new Error('MultiIndexBracketAccessExpression: base expression is not an array');
        }

        const dimensions = baseValue.dimensions;
        if (!dimensions || dimensions.length === 0)
        {
            throw new Error('MultiIndexBracketAccessExpression: array is not dimensioned');
        }

        if (dimensions.length !== this.indices.length)
        {
            throw new Error(`MultiIndexBracketAccessExpression: expected ${dimensions.length} indices, got ${this.indices.length}`);
        }

        let flatIndex = 0;

        for (let d = 0; d < dimensions.length; d++)
        {
            const dim = dimensions[d];
            const indexValue = this.indices[d].evaluate(context);
            const oneBased = this.toOneBasedIndex(indexValue);
            if (oneBased === null)
            {
                throw new Error('Array index is out of bounds');
            }

            const offset = oneBased - dim.lower;
            if (offset < 0 || offset >= dim.length)
            {
                throw new Error('Array index is out of bounds');
            }

            flatIndex += offset * dim.stride;
        }

        if (flatIndex < 0 || flatIndex >= baseValue.value.length)
        {
            throw new Error('Array index is out of bounds');
        }

        return baseValue.value[flatIndex] ?? this.getDefaultValueForType(baseValue.elementType);
    }

    public toString(omitOuterParens?: boolean): string
    {
        const idx = this.indices.map(i => i.toString()).join(', ');
        return `${this.baseExpr.toString()}[${idx}]`;
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

    private getDefaultValueForType(type: EduBasicType): EduBasicValue
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
                return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer, dimensions: [{ lower: 1, length: 0, stride: 1 }] };
            case EduBasicType.Structure:
                return { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() };
        }
    }

    private tryGetStructureMember(map: Map<string, EduBasicValue>, key: string): EduBasicValue | null
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

    private getDefaultValueForName(name: string): EduBasicValue
    {
        const suffix = tryGetArrayRankSuffixFromName(name);
        if (suffix !== null)
        {
            const sigil = suffix.baseName.charAt(suffix.baseName.length - 1);
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

        return { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() };
    }
}

