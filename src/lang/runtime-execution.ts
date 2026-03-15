import { Program } from './program';
import { ExecutionResult } from './statements/statement';
import { ExecutionContext } from './execution-context';
import { Graphics } from './graphics';
import { Audio } from './audio';
import { ControlStructureFrame, ControlStructureType } from './control-flow-frames';
import { ProgramSyntaxAnalyzer } from './program-syntax-analysis';
import { UnparsableStatement } from './statements/unparsable-statement';
import { FileSystemService } from '../app/disk/filesystem.service';
import { ConsoleService } from '../app/console/console.service';

type UnwindEntry = { type: 'for' | 'select' | 'sub' | 'if' | 'unless'; startLine: number; endLine: number };

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
 *
 * Dedicated stacks per control type (for, select, sub, if, unless) avoid searching a shared stack;
 * unwind order is tracked for GOTO so frames are popped in LIFO order.
 */
export class RuntimeExecution
{
    private readonly forFrames: ControlStructureFrame[] = [];
    private readonly ifFrames: ControlStructureFrame[] = [];
    private readonly selectFrames: ControlStructureFrame[] = [];
    private readonly subFrames: ControlStructureFrame[] = [];
    private readonly unlessFrames: ControlStructureFrame[] = [];
    private readonly unwindOrder: UnwindEntry[] = [];
    private tabSwitchCallback: ((tabId: string) => void) | null = null;
    private sleepUntilMs: number | null = null;
    private readonly syntaxAnalyzer = new ProgramSyntaxAnalyzer();
    private isProgramLinked: boolean = false;
    private pendingInputRequest: { message: string; default: string } | null = null;
    private pendingInputValue: string | null = null;

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
     * Get the current INPUT request (message and default) when execution is waiting for user input.
     * Cleared after reading so the next step can proceed with the value set via setPendingInput.
     */
    public getPendingInputRequest(): { message: string; default: string } | null
    {
        return this.pendingInputRequest;
    }

    /**
     * Set the user's input value and clear the pending request so the next executeStep continues.
     */
    public setPendingInput(value: string): void
    {
        this.pendingInputValue = value;
        this.pendingInputRequest = null;
    }

    /**
     * Consumed by InputStatement: returns and clears the pending input value.
     */
    public getAndClearPendingInput(): string | null
    {
        const value = this.pendingInputValue;
        this.pendingInputValue = null;
        return value;
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

        // If a sleep is active, keep yielding Continue until the timestamp elapses.
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

        if (status.result === ExecutionResult.WaitingForInput)
        {
            this.pendingInputRequest = {
                message: status.inputMessage ?? '',
                default: status.inputDefault ?? ''
            };
            return ExecutionResult.WaitingForInput;
        }

        // Apply control effect: GOTO unwinds frames so stack matches target; RETURN pops call frame.
        switch (status.result)
        {
            case ExecutionResult.Goto:
                if (status.gotoTarget !== undefined)
                {
                    this.unwindControlFramesForGoto(status.gotoTarget);
                    this.context.setProgramCounter(status.gotoTarget);
                }
                return ExecutionResult.Continue;
            case ExecutionResult.End:
                return ExecutionResult.End;
            case ExecutionResult.Return:
            {
                const returnAddress = this.context.popCallStackFrame();

                if (returnAddress !== undefined)
                {
                    this.context.setProgramCounter(returnAddress);
                    return ExecutionResult.Continue;
                }

                return ExecutionResult.End;
            }
            default:
                this.context.incrementProgramCounter();
                return ExecutionResult.Continue;
        }
    }

    private ensureProgramLinked(): void
    {
        if (this.isProgramLinked)
        {
            return;
        }

        // Fail fast on any unparsable line (other than comment/empty) before linking.
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
        // Pop frames until target PC lies inside the top frame's span (or stack empty).
        while (this.unwindOrder.length > 0)
        {
            const entry = this.unwindOrder[this.unwindOrder.length - 1];

            if (targetPc >= entry.startLine && targetPc <= entry.endLine)
            {
                return;
            }

            if (entry.type === 'sub')
            {
                this.context.popCallStackFrame();
            }

            this.popControlFrame();
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
     * Push a new structured-control frame (FOR/SELECT/SUB/IF/UNLESS).
     */
    public pushControlFrame(frame: ControlStructureFrame): void
    {
        const type = frame.type;

        switch (type)
        {
            case 'for':
                this.forFrames.push(frame);
                break;
            case 'if':
                this.ifFrames.push(frame);
                break;
            case 'select':
                this.selectFrames.push(frame);
                break;
            case 'sub':
                this.subFrames.push(frame);
                break;
            case 'unless':
                this.unlessFrames.push(frame);
                break;
            default:
                return;
        }

        this.unwindOrder.push({
            type: type as UnwindEntry['type'],
            startLine: frame.startLine,
            endLine: frame.endLine
        });
    }

    /**
     * Pop the most recent structured-control frame.
     */
    public popControlFrame(): ControlStructureFrame | undefined
    {
        if (this.unwindOrder.length === 0)
        {
            return undefined;
        }

        const entry = this.unwindOrder.pop()!;
        let frame: ControlStructureFrame | undefined;

        switch (entry.type)
        {
            case 'for':
                frame = this.forFrames.pop();
                break;
            case 'if':
                frame = this.ifFrames.pop();
                break;
            case 'select':
                frame = this.selectFrames.pop();
                break;
            case 'sub':
                frame = this.subFrames.pop();
                break;
            case 'unless':
                frame = this.unlessFrames.pop();
                break;
            default:
                return undefined;
        }

        return frame;
    }

    private peekFrameStack(stack: ControlStructureFrame[]): ControlStructureFrame | undefined
    {
        return stack.length > 0 ? stack[stack.length - 1] : undefined;
    }

    /**
     * Peek the most recent structured-control frame without mutating the stack.
     */
    public getCurrentControlFrame(): ControlStructureFrame | undefined
    {
        if (this.unwindOrder.length === 0)
        {
            return undefined;
        }

        const entryType = this.unwindOrder[this.unwindOrder.length - 1].type;

        switch (entryType)
        {
            case 'for':
                return this.peekFrameStack(this.forFrames);
            case 'if':
                return this.peekFrameStack(this.ifFrames);
            case 'select':
                return this.peekFrameStack(this.selectFrames);
            case 'sub':
                return this.peekFrameStack(this.subFrames);
            case 'unless':
                return this.peekFrameStack(this.unlessFrames);
            default:
                return undefined;
        }
    }

    /**
     * Find the most recent frame with the given type (O(1) via dedicated stack).
     */
    public findControlFrame(type: ControlStructureType): ControlStructureFrame | undefined
    {
        switch (type)
        {
            case 'for':
                return this.peekFrameStack(this.forFrames);
            case 'if':
                return this.peekFrameStack(this.ifFrames);
            case 'select':
                return this.peekFrameStack(this.selectFrames);
            case 'sub':
                return this.peekFrameStack(this.subFrames);
            case 'unless':
                return this.peekFrameStack(this.unlessFrames);
            default:
                return undefined;
        }
    }

    /**
     * Find the most recent frame matching an arbitrary predicate (search from top of unwind order).
     */
    public findControlFrameWhere(predicate: (frame: ControlStructureFrame) => boolean): ControlStructureFrame | undefined
    {
        for (let i = this.unwindOrder.length - 1; i >= 0; i--)
        {
            const frame = this.getFrameAtUnwindIndex(i);
            if (frame && predicate(frame))
            {
                return frame;
            }
        }

        return undefined;
    }

    private getFrameAtUnwindIndex(i: number): ControlStructureFrame | undefined
    {
        const type = this.unwindOrder[i].type;
        let count = 0;

        // Count how many frames of this type appear up to index i (nth frame of type).
        for (let j = 0; j <= i; j++)
        {
            if (this.unwindOrder[j].type === type)
            {
                count++;
            }
        }

        let stack: ControlStructureFrame[];

        switch (type)
        {
            case 'for':
                stack = this.forFrames;
                break;
            case 'if':
                stack = this.ifFrames;
                break;
            case 'select':
                stack = this.selectFrames;
                break;
            case 'sub':
                stack = this.subFrames;
                break;
            case 'unless':
                stack = this.unlessFrames;
                break;
            default:
                return undefined;
        }

        return count > 0 && count <= stack.length ? stack[count - 1] : undefined;
    }

    /**
     * Pop frames until (and including) the most recent frame of the requested type.
     */
    public popControlFramesToAndIncluding(type: ControlStructureType): void
    {
        while (this.unwindOrder.length > 0)
        {
            const popped = this.popControlFrame();
            if (popped && popped.type === type)
            {
                return;
            }
        }
    }

    /**
     * Pop frames until (and including) the first that matches the predicate.
     */
    public popControlFramesToAndIncludingWhere(predicate: (frame: ControlStructureFrame) => boolean): ControlStructureFrame | undefined
    {
        while (this.unwindOrder.length > 0)
        {
            const top = this.getCurrentControlFrame();
            if (top && predicate(top))
            {
                return this.popControlFrame();
            }

            this.popControlFrame();
        }

        return undefined;
    }
}
