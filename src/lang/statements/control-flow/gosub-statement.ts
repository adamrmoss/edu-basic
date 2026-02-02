import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Implements the `GOSUB` statement.
 */
export class GosubStatement extends Statement
{
    /**
     * Label identifier.
     */
    public readonly labelName: string;

    /**
     * Create a new `GOSUB` statement.
     *
     * @param labelName Label identifier.
     */
    public constructor(labelName: string)
    {
        super();
        this.labelName = labelName;
    }

    /**
     * Execute the statement.
     *
     * @returns Execution status.
     * @throws If the label cannot be resolved.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const currentPc = context.getProgramCounter();
        const labelIndex = program.getLabelIndex(this.labelName);

        if (labelIndex === undefined)
        {
            throw new Error(`Label '${this.labelName}' not found`);
        }

        context.pushStackFrame(currentPc + 1);

        return { result: ExecutionResult.Goto, gotoTarget: labelIndex };
    }

    public override toString(): string
    {
        return `GOSUB ${this.labelName}`;
    }
}
