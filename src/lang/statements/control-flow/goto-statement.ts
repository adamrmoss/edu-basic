import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Implements the `GOTO` statement.
 */
export class GotoStatement extends Statement
{
    /**
     * Label identifier.
     */
    public readonly labelName: string;

    /**
     * Create a new `GOTO` statement.
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
