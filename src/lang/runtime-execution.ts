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
        if (this.sleepUntilMs !== null)
        {
            if (Date.now() < this.sleepUntilMs)
            {
                return ExecutionResult.Continue;
            }

            this.sleepUntilMs = null;
        }

        const pc = this.context.getProgramCounter();
        const statement = this.program.getStatement(pc);

        if (!statement)
        {
            return ExecutionResult.End;
        }

        const status = statement.execute(this.context, this.graphics, this.audio, this.program, this);

        if (status.result === ExecutionResult.Goto && status.gotoTarget !== undefined)
        {
            this.unwindControlFramesForGoto(status.gotoTarget);
            this.context.setProgramCounter(status.gotoTarget);
            return ExecutionResult.Continue;
        }

        if (status.result === ExecutionResult.End)
        {
            return ExecutionResult.End;
        }

        if (status.result === ExecutionResult.Return)
        {
            const returnAddress = this.context.popStackFrame();

            if (returnAddress !== undefined)
            {
                this.context.setProgramCounter(returnAddress);
                return ExecutionResult.Continue;
            }

            return ExecutionResult.End;
        }

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
        while (true)
        {
            const top = this.getCurrentControlFrame();
            if (!top)
            {
                return;
            }

            if (targetPc < top.startLine || targetPc > top.endLine)
            {
                this.popControlFrame();
                continue;
            }

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
        const ms = Math.max(0, Math.floor(milliseconds));

        if (ms === 0)
        {
            return;
        }

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
                if (selectDepth > 0)
                {
                    selectDepth--;
                    continue;
                }
            }

            if (selectDepth === 0 && stmt instanceof CaseStatement)
            {
                return i;
            }
        }

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
                if (depth > 0)
                {
                    depth--;
                    continue;
                }
            }

            if (depth === 0)
            {
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

        for (let i = ifLine; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (i === ifLine && stmt instanceof IfStatement)
            {
                foundIf = true;
                indentLevel = stmt.indentLevel + 1;
                continue;
            }

            if (foundIf)
            {
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

        for (let i = whileLine; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (i === whileLine && stmt instanceof WhileStatement)
            {
                foundWhile = true;
                indentLevel = stmt.indentLevel + 1;
                continue;
            }

            if (foundWhile)
            {
                if (stmt.indentLevel < indentLevel)
                {
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

        for (let i = doLine; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (i === doLine && stmt instanceof DoLoopStatement)
            {
                foundDo = true;
                indentLevel = stmt.indentLevel + 1;
                continue;
            }

            if (foundDo)
            {
                if (stmt.indentLevel < indentLevel)
                {
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

        if (!(forStmt instanceof ForStatement))
        {
            return undefined;
        }

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
