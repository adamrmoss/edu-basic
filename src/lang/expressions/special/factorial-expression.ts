import { Expression } from '../expression';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class FactorialExpression extends Expression
{
    public constructor(
        public readonly operand: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const value = this.operand.evaluate(context);

        let n: number | null = null;

        switch (value.type)
        {
            case EduBasicType.Integer:
                n = Math.trunc(value.value);
                break;
            case EduBasicType.Real:
            {
                const asInt = Math.trunc(value.value);
                if (value.value !== asInt)
                {
                    throw new Error('Factorial operand must be an integer');
                }
                n = asInt;
                break;
            }
            default:
                throw new Error(`Factorial operand must be numeric, got ${value.type}`);
        }

        if (n < 0)
        {
            throw new Error('Factorial operand must be non-negative');
        }

        let result = 1;
        for (let i = 2; i <= n; i++)
        {
            result *= i;
            if (!Number.isFinite(result))
            {
                throw new Error('Factorial overflow');
            }
        }

        return { type: EduBasicType.Integer, value: result };
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.operand.toString()}!`;
    }
}

