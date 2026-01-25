export enum EduBasicType
{
    Integer = 'INTEGER',
    Real = 'REAL',
    Complex = 'COMPLEX',
    String = 'STRING',
    Structure = 'STRUCTURE',
    Array = 'ARRAY',
}

export interface ComplexValue
{
    real: number;
    imaginary: number;
}

export type EduBasicValue = 
    | { type: EduBasicType.Integer; value: number }
    | { type: EduBasicType.Real; value: number }
    | { type: EduBasicType.Complex; value: ComplexValue }
    | { type: EduBasicType.String; value: string }
    | { type: EduBasicType.Structure; value: Map<string, EduBasicValue> }
    | { type: EduBasicType.Array; value: EduBasicValue[]; elementType: EduBasicType };

/**
 * Finds the most specific common type from a list of types.
 * Follows the hierarchy: Integer → Real → Complex.
 * String and Structure types cannot be coerced to numeric types.
 * 
 * @param types Array of types to find common type for
 * @returns The most specific common type, or null if types are incompatible
 */
export function findMostSpecificCommonType(types: EduBasicType[]): EduBasicType | null
{
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
 * Coerces array elements to the most specific common type.
 * Used when creating array literals from evaluated expressions.
 * 
 * @param elements Array of evaluated values
 * @returns Array value with coerced elements and determined elementType
 */
export function coerceArrayElements(elements: EduBasicValue[]): { type: EduBasicType.Array; value: EduBasicValue[]; elementType: EduBasicType }
{
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
 * Coerces a value to a target type.
 * Follows the hierarchy: Integer → Real → Complex.
 * 
 * @param value The value to coerce
 * @param targetType The target type to coerce to
 * @returns The coerced value
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
            if (value.type === EduBasicType.Real)
            {
                return { type: EduBasicType.Integer, value: Math.trunc(value.value) };
            }
            if (value.type === EduBasicType.Complex)
            {
                return { type: EduBasicType.Integer, value: Math.trunc(value.value.real) };
            }
            break;
            
        case EduBasicType.Real:
            if (value.type === EduBasicType.Integer)
            {
                return { type: EduBasicType.Real, value: value.value };
            }
            if (value.type === EduBasicType.Complex)
            {
                return { type: EduBasicType.Real, value: value.value.real };
            }
            break;
            
        case EduBasicType.Complex:
            if (value.type === EduBasicType.Integer)
            {
                return { type: EduBasicType.Complex, value: { real: value.value, imaginary: 0 } };
            }
            if (value.type === EduBasicType.Real)
            {
                return { type: EduBasicType.Complex, value: { real: value.value, imaginary: 0 } };
            }
            break;
    }
    
    return value;
}

/**
 * Converts an EduBasicValue to its canonical string representation.
 * This is the standard formatting used for printing and display.
 * 
 * @param value The value to convert
 * @returns Canonical string representation
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
 * Converts an EduBasicValue to its expression string representation.
 * This includes quotes around strings and is used for expression display.
 * 
 * @param value The value to convert
 * @returns Expression string representation
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
