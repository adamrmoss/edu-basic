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
