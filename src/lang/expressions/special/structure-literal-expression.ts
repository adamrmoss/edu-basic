import { Expression } from '../expression';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

/**
 * Member entry in a structure literal.
 */
export interface StructureLiteralMember
{
    /**
     * Member name.
     */
    name: string;

    /**
     * Expression that produces the member value.
     */
    value: Expression;
}

/**
 * Expression node representing a structure literal (`{ name: expr, ... }`).
 */
export class StructureLiteralExpression extends Expression
{
    /**
     * Member entries for the literal.
     */
    public readonly members: StructureLiteralMember[];

    /**
     * Create a new structure literal expression.
     *
     * @param members Member entries for the literal.
     */
    public constructor(members: StructureLiteralMember[])
    {
        super();
        this.members = members;
    }

    /**
     * Evaluate each member expression and build a runtime structure value.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime structure value.
     */
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
