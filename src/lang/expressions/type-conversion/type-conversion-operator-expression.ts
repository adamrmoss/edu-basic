import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export enum TypeConversionOperator
{
    Int = 'INT',
    Str = 'STR',
    Val = 'VAL',
    Hex = 'HEX',
    Bin = 'BIN',
}

export class TypeConversionOperatorExpression extends Expression
{
    public constructor(
        public readonly operator: TypeConversionOperator,
        public readonly argument: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('TypeConversionOperatorExpression.evaluate() not yet implemented');
    }
}

