import { Expression } from './expression';
import { EduBasicValue, EduBasicType } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

export class ArrayLiteralExpression extends Expression
{
    public constructor(
        public readonly elements: Expression[]
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const evaluatedElements = this.elements.map(el => el.evaluate(context));
        const elementType = evaluatedElements.length > 0 
            ? evaluatedElements[0].type 
            : EduBasicType.Integer;

        return {
            type: EduBasicType.Array,
            value: evaluatedElements,
            elementType: elementType
        };
    }

    public toString(): string
    {
        if (this.elements.length === 0)
        {
            return '[ ]';
        }

        const elementStrings = this.elements.map(el => el.toString());
        return `[${elementStrings.join(', ')}]`;
    }
}
