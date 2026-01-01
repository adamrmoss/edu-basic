import { Statement } from './statement';
import { Expression } from './expressions/expression';

export class IfStatement extends Statement
{
    public constructor(
        public readonly condition: Expression,
        public readonly thenBranch: Statement[],
        public readonly elseIfBranches: { condition: Expression; statements: Statement[] }[],
        public readonly elseBranch: Statement[] | null
    )
    {
        super();
    }
}
