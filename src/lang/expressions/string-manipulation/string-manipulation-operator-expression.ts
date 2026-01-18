import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export enum StringManipulationOperator
{
    Asc = 'ASC',
    Chr = 'CHR',
    Ucase = 'UCASE',
    Lcase = 'LCASE',
    Ltrim = 'LTRIM',
    Rtrim = 'RTRIM',
    Trim = 'TRIM',
    Reverse = 'REVERSE',
}

export class StringManipulationOperatorExpression extends Expression
{
    public constructor(
        public readonly operator: StringManipulationOperator,
        public readonly argument: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('StringManipulationOperatorExpression.evaluate() not yet implemented');
    }

    public toString(): string
    {
        return `${this.operator}(${this.argument.toString()})`;
    }
}

