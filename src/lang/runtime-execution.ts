import { Program } from './program';
import { Statement, ExecutionResult } from './statements/statement';
import { ExecutionContext } from './execution-context';
import { Graphics } from './graphics';
import { Audio } from './audio';
import { ControlFlowFrameStack } from './control-flow-frame-stack';
import { ControlStructureFrame, ControlStructureType } from './control-flow-frames';
import {
    CaseStatement,
    DoLoopStatement,
    ElseIfStatement,
    ElseStatement,
    EndStatement,
    EndType,
    ForStatement,
    GotoStatement,
    IfStatement,
    LoopStatement,
    NextStatement,
    SelectCaseStatement,
    SubStatement,
    UnlessStatement,
    WendStatement,
    WhileStatement
} from './statements/control-flow';
import { FileSystemService } from '../app/disk/filesystem.service';
import { ConsoleService } from '../app/console/console.service';

/**
 * Step-by-step runtime executor for a compiled `Program`.
 *
 * This class is the "engine" behind program execution:
 * - `executeStep()` runs exactly one statement (or returns `End`).
 * - Control flow statements push/pop control frames so constructs like IF/ELSE/END IF
 *   and DO/LOOP can match their corresponding endpoints at runtime.
 * - Some statements need access to app concerns (console output, filesystem, tab switching).
 *
 * The runtime is intentionally stateful:
 * - The program counter lives in `ExecutionContext`.
 * - Control frames live in this instance (not in `ExecutionContext`), because they are
 *   about structured control flow rather than variable scope.
 */
export class RuntimeExecution
{
    private readonly controlFrames = new ControlFlowFrameStack();
    private tabSwitchCallback: ((tabId: string) => void) | null = null;
    private sleepUntilMs: number | null = null;

    /**
     * Create a new runtime execution engine.
     *
     * @param program Program to execute.
     * @param context Shared execution context (variables, call frames, program counter).
     * @param graphics Graphics runtime for drawing statements.
     * @param audio Audio runtime for audio statements.
     * @param fileSystem Virtual filesystem used by file I/O statements.
     * @param consoleService Optional console service for interactive hosts.
     */
    public constructor(
        private readonly program: Program,
        private readonly context: ExecutionContext,
        private readonly graphics: Graphics,
        private readonly audio: Audio,
        private readonly fileSystem: FileSystemService,
        private readonly consoleService: ConsoleService | null = null
    )
    {
        this.context.setAudio(this.audio);
    }

    /**
     * Get the filesystem bridge used by file I/O statements.
     */
    public getFileSystem(): FileSystemService
    {
        return this.fileSystem;
    }

    /**
     * Get the console service, if provided (it may be null in some hosting contexts).
     */
    public getConsoleService(): ConsoleService | null
    {
        return this.consoleService;
    }

    /**
     * Register a callback that can switch the active UI tab (e.g., console ↔ graphics).
     */
    public setTabSwitchCallback(callback: ((tabId: string) => void) | null): void
    {
        this.tabSwitchCallback = callback;
    }

    /**
     * Request a tab switch if a callback has been registered.
     */
    public requestTabSwitch(tabId: string): void
    {
        if (this.tabSwitchCallback)
        {
            this.tabSwitchCallback(tabId);
        }
    }

    /**
     * Execute exactly one statement at the current program counter.
     *
     * High-level flow:
     * - Respect any active sleep delay.
     * - Fetch the current statement; if missing, end execution.
     * - Execute the statement and apply control effects (GOTO/RETURN/END).
     * - Default behavior is to advance the program counter by 1.
     */
    public executeStep(): ExecutionResult
    {
        // If a sleep is active, keep yielding `Continue` until the timestamp elapses.
        if (this.sleepUntilMs !== null)
        {
            if (Date.now() < this.sleepUntilMs)
            {
                return ExecutionResult.Continue;
            }

            // Sleep window elapsed; resume normal execution.
            this.sleepUntilMs = null;
        }

        // Fetch the current statement by program counter.
        const pc = this.context.getProgramCounter();
        const statement = this.program.getStatement(pc);

        // Missing statements mean the program has run off the end.
        if (!statement)
        {
            return ExecutionResult.End;
        }

        // Execute the statement to obtain the next control action.
        const status = statement.execute(this.context, this.graphics, this.audio, this.program, this);

        if (status.result === ExecutionResult.Goto && status.gotoTarget !== undefined)
        {
            // Structured blocks must be unwound so the frame stack matches the new location.
            this.unwindControlFramesForGoto(status.gotoTarget);
            this.context.setProgramCounter(status.gotoTarget);
            return ExecutionResult.Continue;
        }

        if (status.result === ExecutionResult.End)
        {
            // The statement requested termination (END/UEND/etc.).
            return ExecutionResult.End;
        }

        if (status.result === ExecutionResult.Return)
        {
            // Return pops a call frame; if there is no frame, the program ends.
            const returnAddress = this.context.popStackFrame();

            if (returnAddress !== undefined)
            {
                // Resume execution at the stored return address.
                this.context.setProgramCounter(returnAddress);
                return ExecutionResult.Continue;
            }

            return ExecutionResult.End;
        }

        // Default behavior: advance to the next statement.
        this.context.incrementProgramCounter();
        return ExecutionResult.Continue;
    }

    /**
     * When a `GOTO` jumps into/out of structured blocks, we must ensure the control-frame
     * stack matches the new location.
     *
     * Strategy:
     * - Pop frames until the target program counter lies within the top frame's
     *   [startLine, endLine] span, or until no frames remain.
     */
    private unwindControlFramesForGoto(targetPc: number): void
    {
        // Pop frames until the target lies within the active frame span.
        while (true)
        {
            const top = this.getCurrentControlFrame();
            if (!top)
            {
                return;
            }

            if (targetPc < top.startLine || targetPc > top.endLine)
            {
                // The jump leaves the current structured block, so discard its frame.
                this.popControlFrame();
                continue;
            }

            // The target is inside the current frame; stop unwinding.
            return;
        }
    }

    /**
     * Block execution for at least the given number of milliseconds.
     *
     * This does not use a real sleep; it sets a timestamp that `executeStep()` checks.
     */
    public sleep(milliseconds: number): void
    {
        // Normalize to a non-negative integer to keep `executeStep()` logic simple.
        const ms = Math.max(0, Math.floor(milliseconds));

        // Treat non-positive sleeps as no-ops.
        if (ms === 0)
        {
            return;
        }

        // Store a wall-clock timestamp; `executeStep()` will poll it.
        this.sleepUntilMs = Date.now() + ms;
    }

    /**
     * Push a new structured-control frame (IF/WHILE/FOR/etc.).
     */
    public pushControlFrame(frame: ControlStructureFrame): void
    {
        this.controlFrames.push(frame);
    }

    /**
     * Pop the most recent structured-control frame (IF/WHILE/FOR/etc.).
     */
    public popControlFrame(): ControlStructureFrame | undefined
    {
        return this.controlFrames.pop();
    }

    /**
     * Peek the most recent structured-control frame without mutating the stack.
     */
    public getCurrentControlFrame(): ControlStructureFrame | undefined
    {
        return this.controlFrames.peek();
    }

    /**
     * Find the most recent frame with the given type.
     */
    public findControlFrame(type: ControlStructureType): ControlStructureFrame | undefined
    {
        return this.controlFrames.find(type);
    }

    /**
     * Find the most recent frame matching an arbitrary predicate.
     */
    public findControlFrameWhere(predicate: (frame: ControlStructureFrame) => boolean): ControlStructureFrame | undefined
    {
        return this.controlFrames.findWhere(predicate);
    }

    /**
     * Pop frames until (and including) the most recent frame of the requested type.
     */
    public popControlFramesToAndIncluding(type: ControlStructureType): void
    {
        this.controlFrames.popToAndIncluding(type);
    }

    /**
     * Pop frames until (and including) the first that matches the predicate.
     */
    public popControlFramesToAndIncludingWhere(predicate: (frame: ControlStructureFrame) => boolean): ControlStructureFrame | undefined
    {
        return this.controlFrames.popToAndIncludingWhere(predicate);
    }

    /**
     * Find the matching `END IF` for an `IF` at `ifLine`.
     *
     * This is used by IF-family statements to decide where to jump when a branch is not taken.
     */
    public findMatchingEndIf(ifLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        // Scan forward, tracking nested IF blocks.
        for (let i = ifLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof IfStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.If)
            {
                // A matching END IF is only valid when all nested IFs have been closed.
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    /**
     * Find the matching `END UNLESS` for an `UNLESS` at `unlessLine`.
     */
    public findMatchingEndUnless(unlessLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        // Scan forward, tracking nested UNLESS blocks.
        for (let i = unlessLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof UnlessStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.Unless)
            {
                // A matching END UNLESS is only valid when all nested UNLESS have been closed.
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    /**
     * Find the matching `END SELECT` for a `SELECT CASE` at `selectLine`.
     */
    public findMatchingEndSelect(selectLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        // Scan forward, tracking nested SELECT CASE blocks.
        for (let i = selectLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof SelectCaseStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.Select)
            {
                // A matching END SELECT is only valid when all nested SELECTs have been closed.
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    /**
     * From within a SELECT block, find the next `CASE` at the current nesting level,
     * or return `endSelectLine` if there is no further `CASE`.
     */
    public findNextCaseOrEndSelect(fromLine: number, endSelectLine: number): number
    {
        const statements = this.program.getStatements();
        let selectDepth = 0;

        // Scan forward to the next CASE at the current SELECT nesting depth.
        for (let i = fromLine; i <= endSelectLine && i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof SelectCaseStatement)
            {
                selectDepth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.Select)
            {
                // Consume nested END SELECTs until we return to the caller's depth.
                if (selectDepth > 0)
                {
                    selectDepth--;
                    continue;
                }
            }

            if (selectDepth === 0 && stmt instanceof CaseStatement)
            {
                // CASE at depth 0 is the next clause for the current SELECT block.
                return i;
            }
        }

        // No more CASE clauses exist; fall back to END SELECT.
        return endSelectLine;
    }

    /**
     * From within an IF block, find the next `ELSEIF`/`ELSE` at the current nesting level,
     * or return `endIfLine` if no further clauses exist.
     */
    public findNextIfClauseOrEnd(fromLine: number, endIfLine: number): number
    {
        const statements = this.program.getStatements();
        let depth = 0;

        // Scan forward, ignoring nested IF blocks.
        for (let i = fromLine; i <= endIfLine && i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof IfStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.If)
            {
                // Consume nested END IFs until we return to the caller's depth.
                if (depth > 0)
                {
                    depth--;
                    continue;
                }
            }

            if (depth === 0)
            {
                // Only consider ELSEIF/ELSE at the current IF nesting level.
                if (stmt instanceof ElseIfStatement || stmt instanceof ElseStatement)
                {
                    return i;
                }
            }
        }

        return endIfLine;
    }

    /**
     * Find the matching `NEXT` for a `FOR` at `forLine`.
     */
    public findMatchingNext(forLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        // Scan forward, tracking nested FOR loops.
        for (let i = forLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof ForStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof NextStatement)
            {
                // A matching NEXT is only valid when all nested FORs have been closed.
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    /**
     * Find the matching `WEND` for a `WHILE` at `whileLine`.
     */
    public findMatchingWend(whileLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        // Scan forward, tracking nested WHILE blocks.
        for (let i = whileLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof WhileStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof WendStatement)
            {
                // A matching WEND is only valid when all nested WHILEs have been closed.
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    /**
     * Find the matching `LOOP` for a `DO` at `doLine`.
     */
    public findMatchingLoop(doLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        // Scan forward, tracking nested DO blocks.
        for (let i = doLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof DoLoopStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof LoopStatement)
            {
                // A matching LOOP is only valid when all nested DOs have been closed.
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    /**
     * Find the matching `END SUB` for a `SUB` declaration at `subLine`.
     */
    public findMatchingEndSub(subLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        // Scan forward, tracking nested SUB blocks.
        for (let i = subLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof SubStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.Sub)
            {
                // A matching END SUB is only valid when all nested SUBs have been closed.
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    /**
     * Determine the end line of an IF block using indentation heuristics.
     *
     * This exists primarily to support editor features and block-aware statements that
     * rely on indentation levels, with a fallback to scanning text for `END IF`.
     */
    public getIfEndLine(ifLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let indentLevel = 0;
        let foundIf = false;

        // Walk forward, using indentation to detect when the IF block ends.
        for (let i = ifLine; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (i === ifLine && stmt instanceof IfStatement)
            {
                // Capture the indentation level of the IF body.
                foundIf = true;
                indentLevel = stmt.indentLevel + 1;
                continue;
            }

            if (foundIf)
            {
                // A same-level IF indicates a sibling block; find its END IF textually.
                if (stmt instanceof IfStatement && stmt.indentLevel === indentLevel - 1)
                {
                    const endIfIndex = this.findEndIfByText(i);

                    if (endIfIndex !== undefined)
                    {
                        return endIfIndex;
                    }
                }

                if (stmt.indentLevel < indentLevel)
                {
                    // Indent decreased: treat as leaving the IF body and locate END IF.
                    const endIfIndex = this.findEndIfByText(i);

                    if (endIfIndex !== undefined)
                    {
                        return endIfIndex;
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * Determine the end line of a WHILE block using indentation heuristics.
     */
    public getWhileEndLine(whileLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let indentLevel = 0;
        let foundWhile = false;

        // Walk forward, using indentation to detect when the WHILE block ends.
        for (let i = whileLine; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (i === whileLine && stmt instanceof WhileStatement)
            {
                // Capture the indentation level of the WHILE body.
                foundWhile = true;
                indentLevel = stmt.indentLevel + 1;
                continue;
            }

            if (foundWhile)
            {
                if (stmt.indentLevel < indentLevel)
                {
                    // Indent decreased: locate the next statement at the WHILE's indentation level.
                    for (let j = i; j < statements.length; j++)
                    {
                        const checkStmt = statements[j];

                        if (checkStmt.indentLevel === indentLevel - 1)
                        {
                            return j;
                        }
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * Determine the end line of a DO/LOOP block using indentation heuristics.
     */
    public getDoLoopEndLine(doLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let indentLevel = 0;
        let foundDo = false;

        // Walk forward, using indentation to detect when the DO/LOOP block ends.
        for (let i = doLine; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (i === doLine && stmt instanceof DoLoopStatement)
            {
                // Capture the indentation level of the DO body.
                foundDo = true;
                indentLevel = stmt.indentLevel + 1;
                continue;
            }

            if (foundDo)
            {
                if (stmt.indentLevel < indentLevel)
                {
                    // Indent decreased: locate the next statement at the DO's indentation level.
                    for (let j = i; j < statements.length; j++)
                    {
                        const checkStmt = statements[j];

                        if (checkStmt.indentLevel === indentLevel - 1)
                        {
                            return j;
                        }
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * Determine the end line of a FOR/NEXT block using indentation heuristics.
     */
    public getForEndLine(forLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        const forStmt = statements[forLine] as ForStatement;

        // Validate the statement at the requested line.
        if (!(forStmt instanceof ForStatement))
        {
            return undefined;
        }

        // The FOR body ends when indentation falls below the FOR's body indentation.
        let indentLevel = forStmt.indentLevel + 1;

        for (let i = forLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt.indentLevel < indentLevel)
            {
                return i;
            }
        }

        return undefined;
    }

    /**
     * Fallback "text scan" for IF termination.
     *
     * Some statement sequences are easier to recognize by their `toString()` output than
     * by indentation alone.
     */
    private findEndIfByText(startIndex: number): number | undefined
    {
        const statements = this.program.getStatements();

        // Scan forward for the first statement whose display text begins with 'END IF'.
        for (let i = startIndex; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt.toString().startsWith('END IF'))
            {
                return i;
            }
        }

        return undefined;
    }
}
