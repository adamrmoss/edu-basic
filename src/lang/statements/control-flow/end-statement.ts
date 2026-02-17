import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * End variants for the `END` statement.
 */
export enum EndType
{
    Program,
    If,
    Unless,
    Select,
    Sub,
    Try
}

/**
 * Implements the `END` statement.
 */
export class EndStatement extends Statement
{
    /**
     * End variant.
     */
    public readonly endType: EndType;

    /**
     * Linked IF line index (0-based), when endType is If.
     *
     * Populated by static syntax analysis.
     */
    public ifLine?: number;

    /**
     * Linked UNLESS line index (0-based), when endType is Unless.
     *
     * Populated by static syntax analysis.
     */
    public unlessLine?: number;

    /**
     * Create a new `END` statement.
     *
     * @param endType End variant.
     */
    public constructor(endType: EndType = EndType.Program)
    {
        super();
        this.endType = endType;
    }

    public override getIndentAdjustment(): number
    {
        return -1;
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
        if (this.endType === EndType.Program)
        {
            return { result: ExecutionResult.End };
        }

        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        switch (this.endType)
        {
            case EndType.Sub:
                runtime.popControlFramesToAndIncluding('sub');
                return { result: ExecutionResult.Return };
            case EndType.If:
            {
                const top = runtime.getCurrentControlFrame();
                if (!top || top.type !== 'if')
                {
                    throw new Error('END IF without IF');
                }

                runtime.popControlFrame();
                break;
            }
            case EndType.Unless:
            {
                const top = runtime.getCurrentControlFrame();
                if (!top || top.type !== 'unless')
                {
                    throw new Error('END UNLESS without UNLESS');
                }

                runtime.popControlFrame();
                break;
            }
            case EndType.Select:
            {
                const top = runtime.getCurrentControlFrame();
                if (!top || top.type !== 'select')
                {
                    throw new Error('END SELECT without SELECT');
                }

                runtime.popControlFrame();
                break;
            }
            default:
                break;
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        switch (this.endType)
        {
            case EndType.Program:
                return 'END';
            case EndType.If:
                return 'END IF';
            case EndType.Unless:
                return 'END UNLESS';
            case EndType.Select:
                return 'END SELECT';
            case EndType.Sub:
                return 'END SUB';
            case EndType.Try:
                return 'END TRY';
        }
    }
}
