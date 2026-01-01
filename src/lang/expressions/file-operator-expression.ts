import { Expression } from './expression';

export enum FileOperator
{
    Eof = 'EOF',
    Loc = 'LOC',
    Exists = 'EXISTS',
}

export class FileOperatorExpression extends Expression
{
    public constructor(
        public readonly operator: FileOperator,
        public readonly argument: Expression
    )
    {
        super();
    }
}
