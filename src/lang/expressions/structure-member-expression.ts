import { Expression } from './expression';
import { EduBasicValue } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

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
        throw new Error('StructureMemberExpression.evaluate() not yet implemented');
    }

    public toString(): string
    {
        return `${this.structureExpr.toString()}[${this.memberName}]`;
    }
}
