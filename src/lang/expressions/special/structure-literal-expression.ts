import { Expression } from '../expression';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export interface StructureLiteralMember
{
    name: string;
    value: Expression;
}

export class StructureLiteralExpression extends Expression
{
    public constructor(public readonly members: StructureLiteralMember[])
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const map = new Map<string, EduBasicValue>();

        for (const member of this.members)
        {
            map.set(member.name, member.value.evaluate(context));
        }

        return { type: EduBasicType.Structure, value: map };
    }

    public toString(omitOuterParens?: boolean): string
    {
        if (this.members.length === 0)
        {
            return '{ }';
        }

        const parts: string[] = [];

        for (const member of this.members)
        {
            parts.push(`${member.name}: ${member.value.toString()}`);
        }

        return `{ ${parts.join(', ')} }`;
    }
}
