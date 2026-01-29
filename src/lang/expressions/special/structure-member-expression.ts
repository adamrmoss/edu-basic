import { Expression } from '../expression';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class StructureMemberExpression extends Expression
{
    public constructor(
        public readonly structureExpr: Expression,
        public readonly memberName: string
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const structureValue = this.structureExpr.evaluate(context);
        if (structureValue.type !== EduBasicType.Structure)
        {
            throw new Error('StructureMemberExpression: base expression is not a structure');
        }

        const map = structureValue.value;
        const direct = map.get(this.memberName);
        if (direct)
        {
            return direct;
        }

        const upperMemberName = this.memberName.toUpperCase();
        for (const [key, value] of map.entries())
        {
            if (key.toUpperCase() === upperMemberName)
            {
                return value;
            }
        }

        return StructureMemberExpression.getDefaultValueForName(this.memberName);
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.structureExpr.toString()}[${this.memberName}]`;
    }

    private static getDefaultValueForName(name: string): EduBasicValue
    {
        if (name.endsWith('[]'))
        {
            const sigil = name.charAt(name.length - 3);

            switch (sigil)
            {
                case '%':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer };
                case '#':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Real };
                case '$':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.String };
                case '&':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Complex };
                default:
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Structure };
            }
        }

        const sigil = name.charAt(name.length - 1);

        switch (sigil)
        {
            case '%':
                return { type: EduBasicType.Integer, value: 0 };
            case '#':
                return { type: EduBasicType.Real, value: 0.0 };
            case '$':
                return { type: EduBasicType.String, value: '' };
            case '&':
                return { type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } };
            default:
                return { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() };
        }
    }
}
