import { Expression } from '../expression';
import { EduBasicType, EduBasicValue, coerceArrayElements } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class ArrayLiteralExpression extends Expression
{
    public constructor(public readonly elements: Expression[])
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const values: EduBasicValue[] = [];

        for (const element of this.elements)
        {
            const value = element.evaluate(context);
            if (value.type === EduBasicType.Array)
            {
                throw new Error('Jagged arrays are not supported');
            }
            values.push(value);
        }

        return coerceArrayElements(values);
    }

    public toString(omitOuterParens?: boolean): string
    {
        if (this.elements.length === 0)
        {
            return '[ ]';
        }

        return `[${this.elements.map(e => e.toString()).join(', ')}]`;
    }
}

