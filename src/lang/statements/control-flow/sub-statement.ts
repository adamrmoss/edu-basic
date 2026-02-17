import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Parameter definition for a `SUB` statement.
 */
export interface SubParameter
{
    /**
     * Parameter name.
     */
    name: string;

    /**
     * Whether the parameter is passed by reference (`BYREF`).
     */
    byRef: boolean;
}

/**
 * Implements the `SUB` statement.
 */
export class SubStatement extends Statement
{
    /**
     * Linked `END SUB` line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public endSubLine?: number;

    /**
     * Subroutine name.
     */
    public readonly name: string;

    /**
     * Parameter definitions.
     */
    public readonly parameters: SubParameter[];

    /**
     * Statement body (block construction).
     */
    public readonly body: Statement[];

    /**
     * Create a new `SUB` statement.
     *
     * @param name Subroutine name.
     * @param parameters Parameter definitions.
     * @param body Statement body.
     */
    public constructor(name: string, parameters: SubParameter[], body: Statement[])
    {
        super();
        this.name = name;
        this.parameters = parameters;
        this.body = body;
    }

    public override getIndentAdjustment(): number
    {
        return 1;
    }

    /**
     * Execute the statement.
     *
     * `SUB` statements are not executed directly; execution jumps over them unless entered via `CALL`.
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
        // When not linked, no-op; when reached by fall-through, skip to the line after END SUB.
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        const currentPc = context.getProgramCounter();
        if (this.endSubLine === undefined)
        {
            throw new Error(`SUB ${this.name} is missing END SUB`);
        }

        return { result: ExecutionResult.Goto, gotoTarget: this.endSubLine + 1 };
    }

    public override toString(): string
    {
        const params = this.parameters.map(p => 
            (p.byRef ? 'BYREF ' : '') + p.name
        ).join(', ');

        if (params)
        {
            return `SUB ${this.name} ${params}`;
        }

        return `SUB ${this.name}`;
    }
}
