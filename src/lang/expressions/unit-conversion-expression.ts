import { Expression } from './expression';

export enum UnitConversionOperator
{
    DegreesToRadians = 'RAD',
    RadiansToDegrees = 'DEG',
}

export class UnitConversionExpression extends Expression
{
    public constructor(
        public readonly operand: Expression,
        public readonly operator: UnitConversionOperator
    )
    {
        super();
    }
}
