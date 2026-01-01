import { Expression } from './expression';

export enum LogicalOperator
{
    And = 'AND',
    Or = 'OR',
    Not = 'NOT',
    Xor = 'XOR',
    Nand = 'NAND',
    Nor = 'NOR',
    Xnor = 'XNOR',
    Imp = 'IMP',
}

export class LogicalExpression extends Expression
{
    public constructor(
        public readonly left: Expression | null,
        public readonly operator: LogicalOperator,
        public readonly right: Expression
    )
    {
        super();
    }
}
