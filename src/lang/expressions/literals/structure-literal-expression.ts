import { Expression } from '../expression';
import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class StructureLiteralExpression extends Expression
{
    public constructor(
        public readonly members: Map<string, Expression>
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const evaluatedMembers = new Map<string, EduBasicValue>();

        for (const [key, expr] of this.members.entries())
        {
            evaluatedMembers.set(key, expr.evaluate(context));
        }

        return {
            type: EduBasicType.Structure,
            value: evaluatedMembers
        };
    }

    public toString(): string
    {
        if (this.members.size === 0)
        {
            return '{ }';
        }

        const memberStrings: string[] = [];
        for (const [key, expr] of this.members.entries())
        {
            memberStrings.push(`${key}: ${expr.toString()}`);
        }

        return `{ ${memberStrings.join(', ')} }`;
    }
}
