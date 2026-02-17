import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Implements the `LABEL` statement.
 */
export class LabelStatement extends Statement
{
    /**
     * Label identifier.
     */
    public readonly labelName: string;

    /**
     * Create a new `LABEL` statement.
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
     * Labels are no-ops at runtime; they are used for jump targets.
     *
     * @returns Execution status.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        // No-op at runtime; GOTO/GOSUB use the label index from syntax analysis.
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `LABEL ${this.labelName}`;
    }
}
