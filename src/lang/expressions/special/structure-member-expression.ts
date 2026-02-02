import { Expression } from '../expression';
import { EduBasicType, EduBasicValue, tryGetArrayRankSuffixFromName } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

/**
 * Expression node that accesses a member on a structure using dot syntax (`a.b`).
 */
export class StructureMemberExpression extends Expression
{
    /**
     * Base expression expected to evaluate to a structure.
     */
    public readonly structureExpr: Expression;

    /**
     * Member name to retrieve (including any type sigil / rank suffix).
     */
    public readonly memberName: string;

    /**
     * Create a new structure member access expression.
     *
     * @param structureExpr Base expression expected to evaluate to a structure.
     * @param memberName Member name to retrieve.
     */
    public constructor(structureExpr: Expression, memberName: string)
    {
        super();
        this.structureExpr = structureExpr;
        this.memberName = memberName;
    }

    /**
     * Evaluate the structure and return the requested member value.
     *
     * @param context Execution context to evaluate against.
     * @returns The member value, or a type-appropriate default if missing.
     */
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
        return `${this.structureExpr.toString()}.${this.memberName}`;
    }

    private static getDefaultValueForName(name: string): EduBasicValue
    {
        const suffix = tryGetArrayRankSuffixFromName(name);
        if (suffix !== null)
        {
            const sigil = suffix.baseName.charAt(suffix.baseName.length - 1);

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
