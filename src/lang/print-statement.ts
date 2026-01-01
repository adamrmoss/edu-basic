import { Statement } from './statement';
import { Expression } from './expressions/expression';

export class PrintStatement extends Statement
{
    public constructor(
        public readonly expressions: Expression[],
        public readonly newline: boolean = true
    )
    {
        super();
    }
}
