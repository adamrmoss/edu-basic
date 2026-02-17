import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Target frame types supported by the `CONTINUE` statement.
 */
export enum ContinueTarget
{
    /**
     * Continue a `FOR` loop.
     */
    For,

    /**
     * Continue a `WHILE` loop.
     */
    While,

    /**
     * Continue a `DO` loop.
     */
    Do
}

/**
 * Implements the `CONTINUE` statement.
 */
export class ContinueStatement extends Statement
{
    /**
     * Linked line index (0-based) to jump to for the next iteration.
     *
     * Populated by static syntax analysis for CONTINUE DO and CONTINUE WHILE.
     */
    public continueTargetLine?: number;

    /**
     * Continue target discriminator.
     */
    public readonly target: ContinueTarget;

    /**
     * Create a new `CONTINUE` statement.
     *
     * @param target Continue target discriminator.
     */
    public constructor(target: ContinueTarget)
    {
        super();
        this.target = target;
    }

    /**
     * Execute the statement.
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
        if (this.continueTargetLine !== undefined)
        {
            return { result: ExecutionResult.Goto, gotoTarget: this.continueTargetLine };
        }

        if (this.target === ContinueTarget.For)
        {
            const frame = runtime.findControlFrame('for');

            if (frame)
            {
                return { result: ExecutionResult.Goto, gotoTarget: frame.endLine };
            }
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        switch (this.target)
        {
            case ContinueTarget.For:
                return 'CONTINUE FOR';
            case ContinueTarget.While:
                return 'CONTINUE WHILE';
            case ContinueTarget.Do:
                return 'CONTINUE DO';
            default:
                return 'CONTINUE';
        }
    }
}
