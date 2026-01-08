import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class GotoStatement extends Statement
{
    public constructor(
        public readonly labelName: string
    )
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const labelIndex = program.getLabelIndex(this.labelName);

        if (labelIndex === undefined)
        {
            throw new Error(`Label '${this.labelName}' not found`);
        }

        return { result: ExecutionResult.Goto, gotoTarget: labelIndex };
    }

    public override toString(): string
    {
        return `GOTO ${this.labelName}`;
    }
}
