import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class LabelStatement extends Statement
{
    public constructor(
        public readonly labelName: string
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return `LABEL ${this.labelName}`;
    }
}
