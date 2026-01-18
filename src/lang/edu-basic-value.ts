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
 * Converts an EduBasicValue to its canonical string representation.
 * This is the standard formatting used for printing and display.
 * 
 * @param value The value to convert
 * @returns Canonical string representation
 */
export function valueToString(value: EduBasicValue): string
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
            return value.value;
        case EduBasicType.Array:
            return value.value.map(v => valueToString(v)).join(',');
        case EduBasicType.Structure:
            return '[Structure]';
    }
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
            return '[Structure]';
    }
}
