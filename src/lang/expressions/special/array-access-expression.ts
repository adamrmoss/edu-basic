import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export class ArrayAccessExpression extends Expression
{
    public constructor(
        public readonly arrayExpr: Expression,
        public readonly index: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('ArrayAccessExpression.evaluate() not yet implemented');
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.arrayExpr.toString()}[${this.index.toString()}]`;
    }
}
