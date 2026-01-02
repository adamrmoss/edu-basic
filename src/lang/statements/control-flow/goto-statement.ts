import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class GotoStatement extends Statement
{
    public constructor(
        public readonly labelName: string
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        const targetIndex = program.getLabelIndex(this.labelName);

        if (targetIndex === undefined)
        {
            throw new Error(`Label not found: ${this.labelName}`);
        }

        return { result: ExecutionResult.Goto, gotoTarget: targetIndex };
    }
}
