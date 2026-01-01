import { Statement } from './statement';
import { Expression } from './expressions/expression';

export class LetStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly value: Expression
    )
    {
        super();
    }
}
