import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Program } from '../../lang/program';
import { ExecutionContext } from '../../lang/execution-context';
import { RuntimeExecution } from '../../lang/runtime-execution';
import { ConsoleService } from '../console/console.service';
import { GraphicsService } from './graphics.service';
import { AudioService } from './audio.service';
import { TabSwitchService } from '../tab-switch.service';

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

    public readonly program$: Observable<Program | null> = this.programSubject.asObservable();
    public readonly state$: Observable<InterpreterState> = this.stateSubject.asObservable();
    public readonly parseResult$: Observable<ParseResult | null> = this.parseResultSubject.asObservable();
    public readonly isRunning$: Observable<boolean> = this.isRunningSubject.asObservable();

    constructor(
        private readonly consoleService: ConsoleService,
        private readonly graphicsService: GraphicsService,
        private readonly audioService: AudioService,
        private readonly tabSwitchService: TabSwitchService
    )
    {
        this.executionContext = new ExecutionContext();
        this.sharedProgram = new Program();
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

    public setProgram(program: Program): void
    {
        this.programSubject.next(program);
        this.parseResultSubject.next(null);
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
            const result: ParseResult = {
                success: false,
                errors: [error instanceof Error ? error.message : String(error)],
                warnings: []
            };

            this.parseResultSubject.next(result);
            this.stateSubject.next(InterpreterState.Error);
            this.consoleService.printError(result.errors.join('\n'));

            return result;
        }
    }

    public run(): void
    {
        if (this.state !== InterpreterState.Idle)
        {
            this.consoleService.printError('Cannot run: interpreter is not in idle state');
            return;
        }

        if (!this.program)
        {
            this.consoleService.printError('Cannot run: no program loaded');
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
            this.runtimeExecution = new RuntimeExecution(
                this.sharedProgram,
                this.executionContext,
                this.graphicsService.getGraphics(),
                this.audioService.getAudio()
            );
            this.runtimeExecution.setTabSwitchCallback((tabId: string) => {
                this.tabSwitchService.requestTabSwitch(tabId);
            });
        }

        return this.runtimeExecution;
    }
}

