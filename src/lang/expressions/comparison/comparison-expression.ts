import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export enum ComparisonOperator
{
    Equal = '=',
    NotEqual = '<>',
    LessThan = '<',
    GreaterThan = '>',
    LessThanOrEqual = '<=',
    GreaterThanOrEqual = '>=',
}

export class ComparisonExpression extends Expression
{
    public constructor(
        public readonly left: Expression,
        public readonly operator: ComparisonOperator,
        public readonly right: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const leftValue = this.left.evaluate(context);
        const rightValue = this.right.evaluate(context);

        let result: boolean;

        if (leftValue.type === EduBasicType.String && rightValue.type === EduBasicType.String)
        {
            switch (this.operator)
            {
                case ComparisonOperator.Equal:
                    result = leftValue.value === rightValue.value;
                    break;
                case ComparisonOperator.NotEqual:
                    result = leftValue.value !== rightValue.value;
                    break;
                case ComparisonOperator.LessThan:
                    result = leftValue.value < rightValue.value;
                    break;
                case ComparisonOperator.GreaterThan:
                    result = leftValue.value > rightValue.value;
                    break;
                case ComparisonOperator.LessThanOrEqual:
                    result = leftValue.value <= rightValue.value;
                    break;
                case ComparisonOperator.GreaterThanOrEqual:
                    result = leftValue.value >= rightValue.value;
                    break;
                default:
                    throw new Error(`Unknown comparison operator: ${this.operator}`);
            }
        }
        else
        {
            const l = this.toNumber(leftValue);
            const r = this.toNumber(rightValue);

            switch (this.operator)
            {
                case ComparisonOperator.Equal:
                    result = l === r;
                    break;
                case ComparisonOperator.NotEqual:
                    result = l !== r;
                    break;
                case ComparisonOperator.LessThan:
                    result = l < r;
                    break;
                case ComparisonOperator.GreaterThan:
                    result = l > r;
                    break;
                case ComparisonOperator.LessThanOrEqual:
                    result = l <= r;
                    break;
                case ComparisonOperator.GreaterThanOrEqual:
                    result = l >= r;
                    break;
                default:
                    throw new Error(`Unknown comparison operator: ${this.operator}`);
            }
        }

        return { type: EduBasicType.Integer, value: result ? -1 : 0 };
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
        return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
    }
}
