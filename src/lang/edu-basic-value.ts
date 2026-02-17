/**
 * Core runtime value types for EduBASIC.
 *
 * This module defines the runtime value domain (`EduBasicValue`) plus helpers for:
 * - array rank suffix parsing/formatting (e.g. `[]`, `[,,]`)
 * - numeric type coercion (Integer → Real → Complex)
 * - canonical string formatting for display
 */
export enum EduBasicType
{
    /**
     * Integer numeric type.
     */
    Integer = 'INTEGER',

    /**
     * Real (floating-point) numeric type.
     */
    Real = 'REAL',

    /**
     * Complex numeric type.
     */
    Complex = 'COMPLEX',

    /**
     * String type.
     */
    String = 'STRING',

    /**
     * Structure type (map of member name to value).
     */
    Structure = 'STRUCTURE',

    /**
     * Array type (linear buffer plus optional dimension metadata).
     */
    Array = 'ARRAY',
}

/**
 * Runtime representation of a complex number value.
 */
export interface ComplexValue
{
    /**
     * Real component.
     */
    real: number;

    /**
     * Imaginary component.
     */
    imaginary: number;
}

/**
 * One dimension of an EduBASIC array.
 */
export interface ArrayDimension
{
    /**
     * Lower bound for this dimension.
     */
    lower: number;

    /**
     * Number of elements in this dimension.
     */
    length: number;

    /**
     * Linear stride for this dimension in the underlying storage.
     */
    stride: number;
}

/**
 * Runtime value for the EduBASIC interpreter.
 *
 * Notes:
 * - Values are tagged unions keyed by `type`.
 * - Arrays store elements in a linear `value` buffer and include an `elementType`.
 * - Structures store members in a `Map` keyed by member name.
 */
export type EduBasicValue =
    | { type: EduBasicType.Integer; value: number }
    | { type: EduBasicType.Real; value: number }
    | { type: EduBasicType.Complex; value: ComplexValue }
    | { type: EduBasicType.String; value: string }
    | { type: EduBasicType.Structure; value: Map<string, EduBasicValue> }
    | { type: EduBasicType.Array; value: EduBasicValue[]; elementType: EduBasicType; dimensions?: ArrayDimension[] };

/**
 * Build the array-rank suffix for a given rank.
 *
 * Examples:
 * - rank 1 → `[]`
 * - rank 2 → `[,]`
 * - rank 3 → `[,,]`
 *
 * @param rank Array rank (number of indices).
 * @returns The corresponding suffix string.
 */
export function getArrayRankSuffix(rank: number): string
{
    if (rank < 1)
    {
        return '[]';
    }

    return `[${','.repeat(rank - 1)}]`;
}

/**
 * Try to extract an array-rank suffix from a name.
 *
 * @param name Variable name that may include a suffix (e.g. `A[,]`).
 * @returns Parsed suffix metadata, or `null` if no valid suffix is present.
 */
export function tryGetArrayRankSuffixFromName(name: string): { baseName: string; rank: number; suffix: string } | null
{
    // Find last '['; require matching ']' and only commas between; rank = comma count + 1.
    const left = name.lastIndexOf('[');
    if (left < 0 || !name.endsWith(']'))
    {
        return null;
    }

    const suffix = name.slice(left);
    if (suffix.length < 2 || suffix[0] !== '[' || suffix[suffix.length - 1] !== ']')
    {
        return null;
    }

    const inside = suffix.slice(1, -1);
    for (let i = 0; i < inside.length; i++)
    {
        if (inside[i] !== ',')
        {
            return null;
        }
    }

    const rank = inside.length + 1;
    const baseName = name.slice(0, left);
    return { baseName, rank, suffix };
}

/**
 * Find the most specific common numeric type from a list of types.
 *
 * Coercion hierarchy:
 * - Integer → Real → Complex
 *
 * @param types Types to unify.
 * @returns The most specific common type, or `null` if types are incompatible.
 */
export function findMostSpecificCommonType(types: EduBasicType[]): EduBasicType | null
{
    // Unify numeric types only; Integer < Real < Complex; string/structure/array => null.
    if (types.length === 0)
    {
        return EduBasicType.Integer;
    }
    
    const uniqueTypes = new Set(types);
    
    if (uniqueTypes.size === 1)
    {
        return types[0];
    }
    
    const hasInteger = uniqueTypes.has(EduBasicType.Integer);
    const hasReal = uniqueTypes.has(EduBasicType.Real);
    const hasComplex = uniqueTypes.has(EduBasicType.Complex);
    const hasString = uniqueTypes.has(EduBasicType.String);
    const hasStructure = uniqueTypes.has(EduBasicType.Structure);
    const hasArray = uniqueTypes.has(EduBasicType.Array);
    
    if (hasString || hasStructure || hasArray)
    {
        return null;
    }
    
    if (hasComplex)
    {
        return EduBasicType.Complex;
    }
    
    if (hasReal)
    {
        return EduBasicType.Real;
    }
    
    return EduBasicType.Integer;
}

/**
 * Coerce array elements to the most specific common numeric type.
 *
 * Used when creating array literals from evaluated expressions.
 *
 * @param elements Evaluated element values.
 * @returns Array value with coerced elements and the determined `elementType`.
 */
export function coerceArrayElements(elements: EduBasicValue[]): { type: EduBasicType.Array; value: EduBasicValue[]; elementType: EduBasicType }
{
    // Empty => Integer array; else unify element types and coerce each value to common type.
    if (elements.length === 0)
    {
        return {
            type: EduBasicType.Array,
            value: [],
            elementType: EduBasicType.Integer
        };
    }
    
    const elementTypes = elements.map(el => el.type);
    const uniqueTypes = new Set(elementTypes);
    
    if (uniqueTypes.size === 1)
    {
        return {
            type: EduBasicType.Array,
            value: elements,
            elementType: elementTypes[0]
        };
    }
    
    if (uniqueTypes.has(EduBasicType.String))
    {
        throw new Error('Array literal cannot mix strings with other types');
    }
    
    const commonType = findMostSpecificCommonType(elementTypes);
    
    if (commonType === null)
    {
        throw new Error('Array literal elements must be of compatible numeric types (Integer, Real, Complex)');
    }
    
    const coercedElements = elements.map(el => coerceValue(el, commonType));
    
    return {
        type: EduBasicType.Array,
        value: coercedElements,
        elementType: commonType
    };
}

/**
 * Coerce a numeric value to a target numeric type.
 *
 * Coercion hierarchy:
 * - Integer → Real → Complex
 *
 * @param value Value to coerce.
 * @param targetType Target numeric type.
 * @returns The coerced value.
 */
export function coerceValue(value: EduBasicValue, targetType: EduBasicType): EduBasicValue
{
    if (value.type === targetType)
    {
        return value;
    }
    
    switch (targetType)
    {
        case EduBasicType.Integer:
            switch (value.type)
            {
                case EduBasicType.Real:
                    return { type: EduBasicType.Integer, value: Math.trunc(value.value) };
                case EduBasicType.Complex:
                    return { type: EduBasicType.Integer, value: Math.trunc(value.value.real) };
                default:
                    break;
            }
            break;

        case EduBasicType.Real:
            switch (value.type)
            {
                case EduBasicType.Integer:
                    return { type: EduBasicType.Real, value: value.value };
                case EduBasicType.Complex:
                    return { type: EduBasicType.Real, value: value.value.real };
                default:
                    break;
            }
            break;

        case EduBasicType.Complex:
            switch (value.type)
            {
                case EduBasicType.Integer:
                    return { type: EduBasicType.Complex, value: { real: value.value, imaginary: 0 } };
                case EduBasicType.Real:
                    return { type: EduBasicType.Complex, value: { real: value.value, imaginary: 0 } };
                default:
                    break;
            }
            break;
    }
    
    return value;
}

/**
 * Convert an EduBASIC value to its canonical display string.
 *
 * @param value Value to convert.
 * @returns Canonical string representation.
 */
export function valueToString(value: EduBasicValue): string
{
    if (value.type === EduBasicType.String)
    {
        return value.value;
    }
    
    return valueToExpressionString(value);
}

/**
 * Convert an EduBASIC value to an expression string representation.
 *
 * This includes quotes around strings and is used for expression display.
 *
 * @param value Value to convert.
 * @returns Expression string representation.
 */
export function valueToExpressionString(value: EduBasicValue): string
{
    switch (value.type)
    {
        case EduBasicType.Integer:
        case EduBasicType.Real:
            return value.value.toString();
        case EduBasicType.Complex:
            const real = value.value.real;
            const imag = value.value.imaginary;
            const sign = imag >= 0 ? '+' : '';
            return `${real}${sign}${imag}i`;
        case EduBasicType.String:
            return `"${value.value}"`;
        case EduBasicType.Array:
            return '[' + value.value.map(v => valueToExpressionString(v)).join(', ') + ']';
        case EduBasicType.Structure:
            if (value.value.size === 0)
            {
                return '{ }';
            }
            const memberStrings: string[] = [];
            for (const [key, memberValue] of value.value.entries())
            {
                memberStrings.push(`${key}: ${valueToExpressionString(memberValue)}`);
            }
            return `{ ${memberStrings.join(', ')} }`;
    }
}
