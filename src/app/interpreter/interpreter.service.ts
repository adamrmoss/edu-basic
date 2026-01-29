import { Injector, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Program } from '../../lang/program';
import { ExecutionContext } from '../../lang/execution-context';
import { RuntimeExecution } from '../../lang/runtime-execution';
import { GraphicsService } from './graphics.service';
import { AudioService } from './audio.service';
import { TabSwitchService } from '../tab-switch.service';
import { FileSystemService } from '../disk/filesystem.service';
import { ConsoleService } from '../console/console.service';

export enum InterpreterState
{
    Idle = 'idle',
    Parsing = 'parsing',
    Running = 'running',
    Paused = 'paused',
    Error = 'error'
}

export interface ParseResult
{
    success: boolean;
    errors: string[];
    warnings: string[];
}

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

    public readonly program$: Observable<Program | null> = this.programSubject.asObservable();
    public readonly state$: Observable<InterpreterState> = this.stateSubject.asObservable();
    public readonly parseResult$: Observable<ParseResult | null> = this.parseResultSubject.asObservable();
    public readonly isRunning$: Observable<boolean> = this.isRunningSubject.asObservable();

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

    public get program(): Program | null
    {
        return this.programSubject.value;
    }

    public get state(): InterpreterState
    {
        return this.stateSubject.value;
    }

    public get isRunning(): boolean
    {
        return this.isRunningSubject.value;
    }

    public get parseResult(): ParseResult | null
    {
        return this.parseResultSubject.value;
    }

    public set program(program: Program | null)
    {
        this.programSubject.next(program);
        this.parseResultSubject.next(null);
        if (program)
        {
            this.sharedProgram = program; // Update shared program (though we're reusing the same instance now)
        }
    }

    public createProgram(): Program
    {
        return new Program();
    }

    public parse(sourceCode: string): ParseResult
    {
        this.stateSubject.next(InterpreterState.Parsing);

        try
        {
            const result: ParseResult = {
                success: true,
                errors: [],
                warnings: []
            };

            this.parseResultSubject.next(result);
            this.stateSubject.next(InterpreterState.Idle);

            return result;
        }
        catch (error)
        {
            console.error('Error parsing source code:', error);
            
            const result: ParseResult = {
                success: false,
                errors: [error instanceof Error ? error.message : String(error)],
                warnings: []
            };

            this.parseResultSubject.next(result);
            this.stateSubject.next(InterpreterState.Error);

            return result;
        }
    }

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

    public pause(): void
    {
        if (this.state !== InterpreterState.Running)
        {
            return;
        }

        this.stateSubject.next(InterpreterState.Paused);
        this.isRunningSubject.next(false);
    }

    public resume(): void
    {
        if (this.state !== InterpreterState.Paused)
        {
            return;
        }

        this.stateSubject.next(InterpreterState.Running);
        this.isRunningSubject.next(true);
    }

    public stop(): void
    {
        this.stateSubject.next(InterpreterState.Idle);
        this.isRunningSubject.next(false);
    }

    public reset(): void
    {
        this.programSubject.next(null);
        this.stateSubject.next(InterpreterState.Idle);
        this.parseResultSubject.next(null);
        this.isRunningSubject.next(false);
    }

    public getExecutionContext(): ExecutionContext
    {
        return this.executionContext;
    }

    public getSharedProgram(): Program
    {
        return this.sharedProgram;
    }

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

        return target.isContentEditable;
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
