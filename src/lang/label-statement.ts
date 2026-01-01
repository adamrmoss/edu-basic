import { Statement } from './statement';

export class LabelStatement extends Statement
{
    public constructor(
        public readonly labelName: string
    )
    {
        super();
    }
}
