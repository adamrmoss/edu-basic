import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { ArrayDimension, EduBasicType, EduBasicValue, coerceValue, tryGetArrayRankSuffixFromName } from '../../edu-basic-value';

/**
 * Segment used by `LET` bracket/member assignment (e.g. `.x` or `[i]`).
 */
export type LetBracketSegment =
    | { type: 'member'; memberName: string }
    | { type: 'indices'; indices: Expression[] };

/**
 * Implements `LET` assignment to a chained path (structure members and/or array indices).
 */
export class LetBracketStatement extends Statement
{
    /**
     * Base identifier (variable name) for the assignment.
     */
    public readonly baseIdentifier: string;

    /**
     * Path segments after the base identifier.
     */
    public readonly segments: LetBracketSegment[];

    /**
     * Expression producing the assigned value.
     */
    public readonly value: Expression;

    /**
     * Create a new bracket/member assignment statement.
     *
     * @param baseIdentifier Base identifier (variable name).
     * @param segments Path segments after the base identifier.
     * @param value Expression producing the assigned value.
     */
    public constructor(baseIdentifier: string, segments: LetBracketSegment[], value: Expression)
    {
        super();
        this.baseIdentifier = baseIdentifier;
        this.segments = segments;
        this.value = value;
    }

    /**
     * Execute the statement.
     *
     * @returns Execution status.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const evaluatedValue = this.value.evaluate(context);

        const { rootName, rootValue } = this.getRootBinding(context);

        if (this.segments.length === 0)
        {
            context.setVariable(rootName, evaluatedValue, false);
            return { result: ExecutionResult.Continue };
        }

        let current: EduBasicValue = rootValue;

        // Walk path segments to reach the parent of the last; then assign at the last segment.
        for (let i = 0; i < this.segments.length - 1; i++)
        {
            const seg = this.segments[i];
            const next = this.segments[i + 1];
            current = this.resolveSegmentForTraversal(context, current, seg, next);
        }

        const last = this.segments[this.segments.length - 1];
        this.assignAtSegment(context, current, last, evaluatedValue);

        context.setVariable(rootName, rootValue, false);
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        const segs = this.segments.map(s =>
        {
            switch (s.type)
            {
                case 'member':
                    return `.${s.memberName}`;
                case 'indices':
                    return `[${s.indices.map(x => x.toString()).join(', ')}]`;
            }
        }).join('');

        return `LET ${this.baseIdentifier}${segs} = ${this.value.toString()}`;
    }

    private getRootBinding(context: ExecutionContext): { rootName: string; rootValue: EduBasicValue }
    {
        const baseName = this.baseIdentifier;

        if (tryGetArrayRankSuffixFromName(baseName) !== null)
        {
            const rootValue = context.getVariable(baseName);
            return { rootName: baseName, rootValue };
        }

        const sigil = baseName.charAt(baseName.length - 1);
        const isTypedArrayBase = sigil === '%' || sigil === '#' || sigil === '$' || sigil === '&';

        if (isTypedArrayBase)
        {
            let rootName = `${baseName}[]`;

            if (this.segments.length > 0)
            {
                const first = this.segments[0];
                if (first.type === 'indices')
                {
                    const rankSuffix = `[${','.repeat(Math.max(0, first.indices.length - 1))}]`;
                    rootName = `${baseName}${rankSuffix}`;
                }
            }

            const rootValue = context.getVariable(rootName);
            return { rootName, rootValue };
        }

        const rootValue = context.getVariable(baseName);
        return { rootName: baseName, rootValue };
    }

    private resolveSegmentForTraversal(
        context: ExecutionContext,
        current: EduBasicValue,
        segment: LetBracketSegment,
        next: LetBracketSegment
    ): EduBasicValue
    {
        switch (segment.type)
        {
            case 'member':
                return this.resolveMemberForTraversal(context, current, segment.memberName, next);
            case 'indices':
                return this.resolveIndicesForTraversal(context, current, segment.indices, next);
        }
    }

    private assignAtSegment(context: ExecutionContext, current: EduBasicValue, segment: LetBracketSegment, value: EduBasicValue): void
    {
        switch (segment.type)
        {
            case 'member':
                this.assignAtMember(context, current, segment.memberName, value);
                return;
            case 'indices':
                this.assignAtIndices(context, current, segment.indices, value);
                return;
        }
    }

    private resolveMemberForTraversal(
        context: ExecutionContext,
        current: EduBasicValue,
        memberName: string,
        next: LetBracketSegment
    ): EduBasicValue
    {
        if (current.type === EduBasicType.Structure)
        {
            return this.getOrCreateStructureMember(context, current, memberName, next);
        }
        
        throw new Error('LET: member access requires a structure');
    }

    private assignAtMember(
        context: ExecutionContext,
        current: EduBasicValue,
        memberName: string,
        value: EduBasicValue
    ): void
    {
        if (current.type === EduBasicType.Structure)
        {
            this.setStructureMember(current, memberName, value);
            return;
        }
        
        throw new Error('LET: member assignment requires a structure');
    }

    private resolveIndicesForTraversal(
        context: ExecutionContext,
        current: EduBasicValue,
        indices: Expression[],
        next: LetBracketSegment
    ): EduBasicValue
    {
        if (current.type === EduBasicType.Array)
        {
            return this.getArrayElementValue(context, current, indices);
        }
        
        throw new Error("LET: bracket access requires an array (use '.' for structure members)");
    }

    private assignAtIndices(
        context: ExecutionContext,
        current: EduBasicValue,
        indices: Expression[],
        value: EduBasicValue
    ): void
    {
        if (current.type === EduBasicType.Array)
        {
            this.setArrayElementValue(context, current, indices, value);
            return;
        }
        
        throw new Error("LET: bracket assignment requires an array (use '.' for structure members)");
    }

    private getOrCreateStructureMember(
        context: ExecutionContext,
        current: EduBasicValue,
        memberName: string,
        next: LetBracketSegment
    ): EduBasicValue
    {
        if (current.type !== EduBasicType.Structure)
        {
            throw new Error('LET: structure member access requires a structure');
        }

        const map = current.value;
        const memberSuffix = tryGetArrayRankSuffixFromName(memberName);
        const baseMemberName = memberSuffix ? memberSuffix.baseName : memberName;

        let keyName = memberName;
        if (next.type === 'indices' && memberSuffix === null)
        {
            const rankSuffix = `[${','.repeat(Math.max(0, next.indices.length - 1))}]`;
            keyName = `${memberName}${rankSuffix}`;
        }

        const direct = map.get(keyName);
        if (direct)
        {
            return direct;
        }

        const upperKeyName = keyName.toUpperCase();
        for (const [k, v] of map.entries())
        {
            if (k.toUpperCase() === upperKeyName)
            {
                return v;
            }
        }

        let created: EduBasicValue;

        if (next.type === 'indices')
        {
            const elementType = this.getTypedElementTypeFromName(baseMemberName);
            created = { type: EduBasicType.Array, value: [], elementType };
        }
        else
        {
            created = this.getDefaultValueForName(memberName);
        }

        map.set(keyName, created);
        return created;
    }

    private setStructureMember(current: EduBasicValue, memberName: string, value: EduBasicValue): void
    {
        if (current.type !== EduBasicType.Structure)
        {
            throw new Error('LET: structure member assignment requires a structure');
        }

        const coerced = this.coerceToName(value, memberName);
        current.value.set(memberName, coerced);
    }

    private getArrayElementValue(context: ExecutionContext, current: EduBasicValue, indices: Expression[]): EduBasicValue
    {
        if (current.type !== EduBasicType.Array)
        {
            throw new Error('LET: array indexing requires an array');
        }

        const dims = current.dimensions;
        if (indices.length > 1)
        {
            if (!dims || dims.length === 0)
            {
                throw new Error('LET: multi-dimensional array access requires DIM');
            }

            if (dims.length !== indices.length)
            {
                throw new Error(`LET: expected ${dims.length} indices, got ${indices.length}`);
            }
        }

        const flatIndex = this.computeFlatIndex(context, current, indices);
        if (flatIndex === null)
        {
            throw new Error('Array index is out of bounds');
        }

        return current.value[flatIndex] ?? this.getDefaultValueForType(current.elementType);
    }

    private setArrayElementValue(context: ExecutionContext, current: EduBasicValue, indices: Expression[], value: EduBasicValue): void
    {
        if (current.type !== EduBasicType.Array)
        {
            throw new Error('LET: array indexing requires an array');
        }

        if (indices.length === 0)
        {
            throw new Error('LET: array index is missing');
        }

        const coerced = this.coerceToType(value, current.elementType);

        const dims = current.dimensions;

        if (indices.length > 1)
        {
            if (!dims || dims.length === 0)
            {
                throw new Error('LET: multi-dimensional array assignment requires DIM');
            }

            if (dims.length !== indices.length)
            {
                throw new Error(`LET: expected ${dims.length} indices, got ${indices.length}`);
            }

            const flatIndex = this.computeFlatIndex(context, current, indices);
            if (flatIndex === null)
            {
                throw new Error('LET: array index is out of bounds');
            }

            current.value[flatIndex] = coerced;
            return;
        }

        const indexValue = indices[0].evaluate(context);
        const oneBased = this.toOneBasedIndex(indexValue);
        if (oneBased === null)
        {
            throw new Error('LET: array index must be numeric');
        }

        if (dims && dims.length === 1)
        {
            const lower = dims[0].lower;
            const offset = oneBased - lower;
            const flatIndex = offset * dims[0].stride;
            if (offset < 0 || offset >= dims[0].length || flatIndex < 0 || flatIndex >= current.value.length)
            {
                throw new Error('LET: array index is out of bounds');
            }

            current.value[flatIndex] = coerced;
            return;
        }

        const jsIndex = oneBased - 1;
        if (jsIndex < 0)
        {
            throw new Error('LET: array index is out of bounds');
        }

        while (current.value.length <= jsIndex)
        {
            current.value.push(this.getDefaultValueForType(current.elementType));
        }

        current.value[jsIndex] = coerced;
    }

    private computeFlatIndex(context: ExecutionContext, array: { value: EduBasicValue[]; elementType: EduBasicType; dimensions?: ArrayDimension[] }, indices: Expression[]): number | null
    {
        const dims = array.dimensions;
        if (!dims || dims.length === 0)
        {
            if (indices.length !== 1)
            {
                return null;
            }

            const oneBased = this.toOneBasedIndex(indices[0].evaluate(context));
            if (oneBased === null)
            {
                return null;
            }

            const jsIndex = oneBased - 1;
            if (jsIndex < 0 || jsIndex >= array.value.length)
            {
                return null;
            }

            return jsIndex;
        }

        if (dims.length !== indices.length)
        {
            return null;
        }

        let flatIndex = 0;

        for (let d = 0; d < dims.length; d++)
        {
            const dim = dims[d];
            const oneBased = this.toOneBasedIndex(indices[d].evaluate(context));
            if (oneBased === null)
            {
                return null;
            }

            const offset = oneBased - dim.lower;
            if (offset < 0 || offset >= dim.length)
            {
                return null;
            }

            flatIndex += offset * dim.stride;
        }

        if (flatIndex < 0 || flatIndex >= array.value.length)
        {
            return null;
        }

        return flatIndex;
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

    private getTypedElementTypeFromName(name: string): EduBasicType
    {
        const sigil = name.charAt(name.length - 1);
        switch (sigil)
        {
            case '%':
                return EduBasicType.Integer;
            case '#':
                return EduBasicType.Real;
            case '$':
                return EduBasicType.String;
            case '&':
                return EduBasicType.Complex;
            default:
                return EduBasicType.Structure;
        }
    }

    private coerceToType(value: EduBasicValue, targetType: EduBasicType): EduBasicValue
    {
        if (value.type === EduBasicType.Complex && (targetType === EduBasicType.Integer || targetType === EduBasicType.Real))
        {
            throw new Error(`Cannot assign complex number to ${targetType}`);
        }

        return coerceValue(value, targetType);
    }

    private coerceToName(value: EduBasicValue, name: string): EduBasicValue
    {
        const sigil = name.charAt(name.length - 1);

        switch (sigil)
        {
            case '%':
                return this.coerceToType(value, EduBasicType.Integer);
            case '#':
                return this.coerceToType(value, EduBasicType.Real);
            case '$':
                return this.coerceToType(value, EduBasicType.String);
            case '&':
                return this.coerceToType(value, EduBasicType.Complex);
            default:
                return value;
        }
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
            case EduBasicType.Structure:
                return { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() };
            case EduBasicType.Array:
                return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer, dimensions: [{ lower: 1, length: 0, stride: 1 }] };
        }
    }
}

