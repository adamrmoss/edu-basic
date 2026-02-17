import { Injector, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Program } from '../../lang/program';
import { ExecutionContext } from '../../lang/execution-context';
import { RuntimeExecution } from '../../lang/runtime-execution';
import { ProgramSyntaxAnalyzer } from '../../lang/program-syntax-analysis';
import { GraphicsService } from './graphics.service';
import { AudioService } from './audio.service';
import { TabSwitchService } from '../tab-switch.service';
import { FileSystemService } from '../disk/filesystem.service';
import { ConsoleService } from '../console/console.service';
import { ParserService } from './parser.service';
import { UnparsableStatement } from '../../lang/statements/unparsable-statement';

/**
 * High-level interpreter lifecycle state exposed to the UI.
 */
export enum InterpreterState
{
    /**
     * Not running (ready to parse or run).
     */
    Idle = 'idle',

    /**
     * Currently parsing source text.
     */
    Parsing = 'parsing',

    /**
     * Currently running a program.
     */
    Running = 'running',

    /**
     * Program execution is paused.
     */
    Paused = 'paused',

    /**
     * An error state was reached (typically due to parse errors).
     */
    Error = 'error'
}

/**
 * Result of parsing the current program source.
 */
export interface ParseResult
{
    /**
     * Whether parsing succeeded without errors.
     */
    success: boolean;

    /**
     * Error messages collected during parsing.
     */
    errors: string[];

    /**
     * Warning messages collected during parsing.
     */
    warnings: string[];
}

/**
 * Holds shared runtime objects for program execution and console commands.
 *
 * This service is primarily a state + dependency hub:
 * - Provides a long-lived `ExecutionContext` and a shared `Program`.
 * - Lazily creates (and caches) a `RuntimeExecution` wired to graphics, audio, disk, console, and tab switching.
 * - Tracks interpreter state (Idle/Running/Paused/etc.) for UI components.
 * - Forwards global keyboard events into `ExecutionContext` (when running in a browser).
 *
 * Important: program stepping is performed by the UI (see `CodeEditorComponent`), not by this service.
 */
@Injectable({
    providedIn: 'root'
})
export class InterpreterService
{
    private readonly programSubject = new BehaviorSubject<Program | null>(null);
    private readonly stateSubject = new BehaviorSubject<InterpreterState>(InterpreterState.Idle);
    private readonly parseResultSubject = new BehaviorSubject<ParseResult | null>(null);
    private readonly isRunningSubject = new BehaviorSubject<boolean>(false);

    private executionContext: ExecutionContext;
    private sharedProgram: Program;
    private runtimeExecution: RuntimeExecution | null = null;
    private readonly keyDownHandler = (event: KeyboardEvent): void =>
    {
        if (this.shouldIgnoreKeyEvent(event))
        {
            return;
        }

        const key = this.normalizeKey(event);
        if (!key)
        {
            return;
        }

        this.executionContext.setKeyDown(key);
    };

    private readonly keyUpHandler = (event: KeyboardEvent): void =>
    {
        if (this.shouldIgnoreKeyEvent(event))
        {
            return;
        }

        const key = this.normalizeKey(event);
        if (!key)
        {
            return;
        }

        this.executionContext.setKeyUp(key);
    };

    /**
     * Observable stream of the current `Program`.
     */
    public readonly program$: Observable<Program | null> = this.programSubject.asObservable();

    /**
     * Observable stream of interpreter state changes.
     */
    public readonly state$: Observable<InterpreterState> = this.stateSubject.asObservable();

    /**
     * Observable stream of parse results for the most recent parse operation.
     */
    public readonly parseResult$: Observable<ParseResult | null> = this.parseResultSubject.asObservable();

    /**
     * Observable stream indicating whether the interpreter is currently running.
     */
    public readonly isRunning$: Observable<boolean> = this.isRunningSubject.asObservable();

    /**
     * Create a new interpreter service and initialize shared runtime objects.
     *
     * @param graphicsService Graphics service used by runtime execution.
     * @param audioService Audio service used by runtime execution.
     * @param tabSwitchService UI tab switch request bus.
     * @param fileSystemService Virtual filesystem service used by file I/O statements.
     * @param injector Injector used for lazy dependency access.
     */
    constructor(
        private readonly graphicsService: GraphicsService,
        private readonly audioService: AudioService,
        private readonly tabSwitchService: TabSwitchService,
        private readonly fileSystemService: FileSystemService,
        private readonly injector: Injector
    )
    {
        this.executionContext = new ExecutionContext();
        this.sharedProgram = new Program();
        this.initializeKeyboardListeners();
    }

    /**
     * Current program snapshot.
     */
    public get program(): Program | null
    {
        return this.programSubject.value;
    }

    /**
     * Current interpreter state snapshot.
     */
    public get state(): InterpreterState
    {
        return this.stateSubject.value;
    }

    /**
     * Current running state snapshot.
     */
    public get isRunning(): boolean
    {
        return this.isRunningSubject.value;
    }

    /**
     * Current parse result snapshot.
     */
    public get parseResult(): ParseResult | null
    {
        return this.parseResultSubject.value;
    }

    /**
     * Update the current program.
     */
    public set program(program: Program | null)
    {
        this.programSubject.next(program);
        this.parseResultSubject.next(null);
        this.runtimeExecution = null;
        if (program)
        {
            // Update shared program reference (some call sites reuse the same instance).
            this.sharedProgram = program;
        }
    }

    /**
     * Create a new `Program` instance.
     */
    public createProgram(): Program
    {
        return new Program();
    }

    /**
     * Parse source code into a new `Program` and update interpreter state.
     *
     * @param sourceCode Full program source text.
     */
    public parse(sourceCode: string): ParseResult
    {
        this.stateSubject.next(InterpreterState.Parsing);

        const parserService = this.injector.get(ParserService);
        parserService.clear();

        const program = this.createProgram();
        const errors: string[] = [];
        const syntaxAnalyzer = new ProgramSyntaxAnalyzer();

        const lines = sourceCode.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++)
        {
            const lineText = lines[i];
            const parseLineResult = parserService.parseLine(i + 1, lineText);

            if (!parseLineResult.success)
            {
                errors.push(parseLineResult.error || `Line ${i + 1}: Parse error`);
                program.appendLine(new UnparsableStatement(lineText, parseLineResult.error || 'Parse error'));
                continue;
            }

            const parsedLine = parseLineResult.value;
            program.appendLine(parsedLine.statement);

            if (parsedLine.hasError && parsedLine.errorMessage)
            {
                errors.push(`Line ${i + 1}: ${parsedLine.errorMessage}`);
            }
        }

        const analysis = syntaxAnalyzer.analyzeAndLink(program);
        for (const error of analysis.errors)
        {
            errors.push(`Line ${error.lineNumber + 1}: ${error.message}`);
        }

        program.rebuildLabelMap();
        this.program = program;

        const result: ParseResult = {
            success: errors.length === 0,
            errors,
            warnings: []
        };

        this.parseResultSubject.next(result);
        this.stateSubject.next(result.success ? InterpreterState.Idle : InterpreterState.Error);

        return result;
    }

    /**
     * Transition the interpreter to the Running state.
     */
    public run(): void
    {
        if (this.state !== InterpreterState.Idle)
        {
            return;
        }

        if (!this.program)
        {
            return;
        }

        this.stateSubject.next(InterpreterState.Running);
        this.isRunningSubject.next(true);
    }

    /**
     * Pause execution if currently running.
     */
    public pause(): void
    {
        if (this.state !== InterpreterState.Running)
        {
            return;
        }

        this.stateSubject.next(InterpreterState.Paused);
        this.isRunningSubject.next(false);
    }

    /**
     * Resume execution if currently paused.
     */
    public resume(): void
    {
        if (this.state !== InterpreterState.Paused)
        {
            return;
        }

        this.stateSubject.next(InterpreterState.Running);
        this.isRunningSubject.next(true);
    }

    /**
     * Stop execution and return to Idle.
     */
    public stop(): void
    {
        this.stateSubject.next(InterpreterState.Idle);
        this.isRunningSubject.next(false);
    }

    /**
     * Reset interpreter state, program, and parse results.
     */
    public reset(): void
    {
        this.programSubject.next(null);
        this.stateSubject.next(InterpreterState.Idle);
        this.parseResultSubject.next(null);
        this.isRunningSubject.next(false);
        this.runtimeExecution = null;
    }

    /**
     * Get the shared execution context.
     */
    public getExecutionContext(): ExecutionContext
    {
        return this.executionContext;
    }

    /**
     * Get the shared program instance.
     */
    public getSharedProgram(): Program
    {
        return this.sharedProgram;
    }

    /**
     * Get (or lazily create) the shared runtime execution engine.
     */
    public getRuntimeExecution(): RuntimeExecution
    {
        if (!this.runtimeExecution)
        {
            const consoleService = this.injector.get(ConsoleService);
            
            this.runtimeExecution = new RuntimeExecution(
                this.sharedProgram,
                this.executionContext,
                this.graphicsService.getGraphics(),
                this.audioService.getAudio(),
                this.fileSystemService,
                consoleService
            );
            this.runtimeExecution.setTabSwitchCallback((tabId: string) => {
                this.tabSwitchService.requestTabSwitch(tabId);
            });
        }

        return this.runtimeExecution;
    }

    private initializeKeyboardListeners(): void
    {
        if (typeof window === 'undefined')
        {
            return;
        }

        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
    }

    private shouldIgnoreKeyEvent(event: KeyboardEvent): boolean
    {
        const target = event.target as HTMLElement | null;
        if (!target)
        {
            return false;
        }

        const tagName = target.tagName?.toUpperCase();
        if (tagName === 'INPUT' || tagName === 'TEXTAREA')
        {
            return true;
        }

        if (target.isContentEditable)
        {
            return true;
        }

        const contentEditable = target.contentEditable;
        if (typeof contentEditable === 'string' && contentEditable.toLowerCase() === 'true')
        {
            return true;
        }

        const attr = target.getAttribute?.('contenteditable');
        if (attr !== null && attr !== undefined)
        {
            return attr.toLowerCase() !== 'false';
        }

        return false;
    }

    private normalizeKey(event: KeyboardEvent): string | null
    {
        const key = event.key;

        switch (key)
        {
            case 'Escape':
                return 'ESC';
            case 'Enter':
                return 'ENTER';
            case 'Backspace':
                return 'BACKSPACE';
            case 'Tab':
                return 'TAB';
            case 'ArrowUp':
                return 'ARROWUP';
            case 'ArrowDown':
                return 'ARROWDOWN';
            case 'ArrowLeft':
                return 'ARROWLEFT';
            case 'ArrowRight':
                return 'ARROWRIGHT';
            case 'Home':
                return 'HOME';
            case 'End':
                return 'END';
            case 'PageUp':
                return 'PAGEUP';
            case 'PageDown':
                return 'PAGEDOWN';
            case 'Insert':
                return 'INSERT';
            case 'Delete':
                return 'DELETE';
            case 'Shift':
                return 'SHIFT';
            case 'Control':
                return 'CTRL';
            case 'Alt':
                return 'ALT';
            case 'CapsLock':
                return 'CAPSLOCK';
            case ' ':
                return ' ';
        }

        if (key.startsWith('F') && key.length <= 3)
        {
            return key.toUpperCase();
        }

        if (key.length === 1)
        {
            return key;
        }

        return key.toUpperCase();
    }
}
