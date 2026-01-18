import { Expression } from '../expression';
import { EduBasicValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

export enum StringOperator
{
    Left = 'LEFT',
    Right = 'RIGHT',
    Instr = 'INSTR',
    Replace = 'REPLACE',
    Startswith = 'STARTSWITH',
    Endswith = 'ENDSWITH',
}

export class StringOperatorExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly operator: StringOperator,
        public readonly argument: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('StringOperatorExpression.evaluate() not yet implemented');
    }

    public toString(): string
    {
        return `${this.operator}(${this.stringExpr.toString()}, ${this.argument.toString()})`;
    }
}

export class MidExpression extends Expression
{
    public constructor(
        public readonly stringExpr: Expression,
        public readonly startPos: Expression,
        public readonly endPos: Expression
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        throw new Error('MidExpression.evaluate() not yet implemented');
    }

    public toString(): string
    {
        return `MID(${this.stringExpr.toString()}, ${this.startPos.toString()}, ${this.endPos.toString()})`;
    }
}
