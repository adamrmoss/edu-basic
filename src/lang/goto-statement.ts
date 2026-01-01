import { Statement } from './statement';

export class GotoStatement extends Statement
{
    public constructor(
        public readonly labelName: string
    )
    {
        super();
    }
}
