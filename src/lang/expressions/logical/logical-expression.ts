import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

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

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const rightValue = this.right.evaluate(context);
        const r = Math.floor(this.toNumber(rightValue));

        if (this.left === null)
        {
            if (this.operator === LogicalOperator.Not)
            {
                return { type: EduBasicType.Integer, value: ~r };
            }
            
            throw new Error(`Operator ${this.operator} requires left operand`);
        }

        const leftValue = this.left.evaluate(context);
        const l = Math.floor(this.toNumber(leftValue));

        switch (this.operator)
        {
            case LogicalOperator.And:
                return { type: EduBasicType.Integer, value: l & r };

            case LogicalOperator.Or:
                return { type: EduBasicType.Integer, value: l | r };

            case LogicalOperator.Xor:
                return { type: EduBasicType.Integer, value: l ^ r };

            case LogicalOperator.Nand:
                return { type: EduBasicType.Integer, value: ~(l & r) };

            case LogicalOperator.Nor:
                return { type: EduBasicType.Integer, value: ~(l | r) };

            case LogicalOperator.Xnor:
                return { type: EduBasicType.Integer, value: ~(l ^ r) };

            case LogicalOperator.Imp:
                return { type: EduBasicType.Integer, value: ~l | r };

            default:
                throw new Error(`Unknown logical operator: ${this.operator}`);
        }
    }

    private toNumber(value: EduBasicValue): number
    {
        if (value.type === EduBasicType.Integer || value.type === EduBasicType.Real)
        {
            return value.value;
        }
        
        throw new Error(`Cannot convert ${value.type} to number`);
    }

    public toString(): string
    {
        if (this.left === null)
        {
            return `(${this.operator} ${this.right.toString()})`;
        }
        
        return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
    }
}

