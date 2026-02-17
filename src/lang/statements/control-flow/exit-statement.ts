import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * `EXIT` statement targets.
 */
export enum ExitTarget
{
    For,
    While,
    Do,
    Sub
}

/**
 * Implements the `EXIT` statement.
 */
export class ExitStatement extends Statement
{
    /**
     * Linked line index (0-based) to jump to (line after the block end).
     *
     * Populated by static syntax analysis.
     */
    public exitTargetLine?: number;

    /**
     * Target control-flow construct to exit.
     */
    public readonly target: ExitTarget;

    /**
     * Optional FOR loop variable name filter.
     */
    public readonly forVariableName: string | null;

    /**
     * Create a new `EXIT` statement.
     *
     * @param target Target control-flow construct to exit.
     * @param forVariableName Optional FOR loop variable name filter.
     */
    public constructor(target: ExitTarget, forVariableName: string | null = null)
    {
        super();
        this.target = target;
        this.forVariableName = forVariableName;
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
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        if (this.target === ExitTarget.Sub)
        {
            return { result: ExecutionResult.Return };
        }

        if (this.exitTargetLine !== undefined)
        {
            return { result: ExecutionResult.Goto, gotoTarget: this.exitTargetLine };
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        switch (this.target)
        {
            case ExitTarget.For:
                if (this.forVariableName)
                {
                    return `EXIT FOR ${this.forVariableName}`;
                }
                return 'EXIT FOR';
            case ExitTarget.While:
                return 'EXIT WHILE';
            case ExitTarget.Do:
                return 'EXIT DO';
            case ExitTarget.Sub:
                return 'EXIT SUB';
            default:
                return 'EXIT';
        }
    }
}
