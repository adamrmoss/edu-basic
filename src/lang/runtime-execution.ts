import { Program } from './program';
import { ExecutionResult } from './statements/statement';
import { ExecutionContext } from './execution-context';
import { Graphics } from './graphics';
import { Audio } from './audio';
import { ControlFlowFrameStack } from './control-flow-frame-stack';
import { ControlStructureFrame, ControlStructureType } from './control-flow-frames';
import { ProgramSyntaxAnalyzer } from './program-syntax-analysis';
import { UnparsableStatement } from './statements/unparsable-statement';
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
    private readonly syntaxAnalyzer = new ProgramSyntaxAnalyzer();
    private isProgramLinked: boolean = false;

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
        this.ensureProgramLinked();

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

    private ensureProgramLinked(): void
    {
        if (this.isProgramLinked)
        {
            return;
        }

        const statements = this.program.getStatements();
        for (let i = 0; i < statements.length; i++)
        {
            const stmt = statements[i];
            if (stmt instanceof UnparsableStatement && stmt.errorMessage && stmt.errorMessage !== 'Comment or empty line')
            {
                throw new Error(stmt.errorMessage);
            }
        }

        const analysis = this.syntaxAnalyzer.analyzeAndLink(this.program);
        this.program.rebuildLabelMap();

        if (analysis.errors.length > 0)
        {
            throw new Error(analysis.errors[0].message);
        }

        this.isProgramLinked = true;
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
}
