import { Expression } from './expression';

export enum StringFunction
{
    Str = 'STR',
    Val = 'VAL',
    Hex = 'HEX',
    Bin = 'BIN',
    Asc = 'ASC',
    Chr = 'CHR',
    Ucase = 'UCASE',
    Lcase = 'LCASE',
    Ltrim = 'LTRIM',
    Rtrim = 'RTRIM',
    Trim = 'TRIM',
    Reverse = 'REVERSE',
}

export class StringFunctionExpression extends Expression
{
    public constructor(
        public readonly functionName: StringFunction,
        public readonly argument: Expression
    )
    {
        super();
    }
}
