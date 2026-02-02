import { RuntimeNode } from '../runtime-node';
import { ExecutionContext } from '../execution-context';
import { Graphics } from '../graphics';
import { Audio } from '../audio';
import { Program } from '../program';
import { RuntimeExecution } from '../runtime-execution';

/**
 * High-level execution outcomes returned by statements.
 */
export enum ExecutionResult
{
    Continue,
    End,
    Goto,
    Return,
}

/**
 * Result payload returned from `Statement.execute(...)`.
 */
export interface ExecutionStatus
{
    /**
     * Execution outcome.
     */
    result: ExecutionResult;

    /**
     * Target program counter (0-based statement index) for `Goto`.
     */
    gotoTarget?: number;
}

/**
 * Base type for EduBASIC statement AST nodes.
 */
export abstract class Statement extends RuntimeNode
{
    /**
     * 0-based program line index.
     *
     * This is populated by static syntax analysis after a `Program` is built.
     */
    public lineNumber?: number;

    /**
     * Whether this statement has been linked into a `Program` via static syntax analysis.
     */
    public get isLinkedToProgram(): boolean
    {
        return this.lineNumber !== undefined;
    }

    /**
     * Indentation level (used by the editor/runtime for block structure).
     */
    public indentLevel: number = 0;

    /**
     * Execute the statement.
     *
     * @param context Execution context (variables, stack frames, program counter).
     * @param graphics Graphics runtime for drawing statements.
     * @param audio Audio runtime for audio statements.
     * @param program Program being executed.
     * @param runtime Runtime execution engine.
     * @returns Execution status describing control flow.
     */
    public abstract execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus;

    /**
     * Indentation delta applied by this statement in block-aware editors/runtimes.
     *
     * @returns Indent adjustment (default is 0).
     */
    public getIndentAdjustment(): number
    {
        return 0;
    }
}
