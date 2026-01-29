import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';

import { success, failure } from '../src/app/interpreter/parser/parse-result';
import { ParserService, ParsedLine } from '../src/app/interpreter/parser';

import { InterpreterService, InterpreterState } from '../src/app/interpreter/interpreter.service';
import { GraphicsService } from '../src/app/interpreter/graphics.service';
import { AudioService } from '../src/app/interpreter/audio.service';
import { TabSwitchService } from '../src/app/tab-switch.service';
import { FileSystemService } from '../src/app/disk/filesystem.service';
import { ConsoleService } from '../src/app/console/console.service';

import { ExecutionContext } from '../src/lang/execution-context';
import { Program } from '../src/lang/program';
import { Graphics } from '../src/lang/graphics';
import { Audio } from '../src/lang/audio';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { EduBasicType } from '../src/lang/edu-basic-value';
import { Statement, ExecutionResult, ExecutionStatus } from '../src/lang/statements/statement';

class NoOpStatement extends Statement
{
    public constructor(private readonly text: string)
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return this.text;
    }
}

describe('InterpreterService', () =>
{
    let service: InterpreterService;
    let graphicsService: jest.Mocked<GraphicsService>;
    let audioService: jest.Mocked<AudioService>;
    let tabSwitchService: jest.Mocked<TabSwitchService>;
    let parserService: jest.Mocked<ParserService>;

    beforeEach(() =>
    {
        const graphicsServiceMock = {
            getGraphics: jest.fn().mockReturnValue(new Graphics()),
        } as any;

        const audioServiceMock = {
            getAudio: jest.fn().mockReturnValue(new Audio()),
        } as any;

        const tabSwitchServiceMock = {
            requestTabSwitch: jest.fn(),
        } as any;

        const parserServiceMock = {
            clear: jest.fn(),
            parseLine: jest.fn(),
        } as any;

        const consoleServiceMock = {
            printOutput: jest.fn(),
            printError: jest.fn(),
        } as any;

        TestBed.configureTestingModule({
            providers: [
                InterpreterService,
                { provide: GraphicsService, useValue: graphicsServiceMock },
                { provide: AudioService, useValue: audioServiceMock },
                { provide: TabSwitchService, useValue: tabSwitchServiceMock },
                FileSystemService,
                { provide: ParserService, useValue: parserServiceMock },
                { provide: ConsoleService, useValue: consoleServiceMock },
            ]
        });

        // Spy on keyboard listener registration before instantiation.
        jest.spyOn(window, 'addEventListener');

        service = TestBed.inject(InterpreterService);
        graphicsService = TestBed.inject(GraphicsService) as jest.Mocked<GraphicsService>;
        audioService = TestBed.inject(AudioService) as jest.Mocked<AudioService>;
        tabSwitchService = TestBed.inject(TabSwitchService) as jest.Mocked<TabSwitchService>;
        parserService = TestBed.inject(ParserService) as jest.Mocked<ParserService>;
    });

    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    it('should register keyboard event listeners on window', () =>
    {
        expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(window.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    it('should normalize common keys', () =>
    {
        const normalizeKey = (service as any).normalizeKey.bind(service) as (e: KeyboardEvent) => string | null;

        expect(normalizeKey({ key: 'Escape' } as any)).toBe('ESC');
        expect(normalizeKey({ key: 'Enter' } as any)).toBe('ENTER');
        expect(normalizeKey({ key: 'ArrowUp' } as any)).toBe('ARROWUP');
        expect(normalizeKey({ key: 'F1' } as any)).toBe('F1');
        expect(normalizeKey({ key: 'a' } as any)).toBe('a');
        expect(normalizeKey({ key: 'PageDown' } as any)).toBe('PAGEDOWN');
        expect(normalizeKey({ key: 'Something' } as any)).toBe('SOMETHING');
    });

    it('should ignore key events from INPUT/TEXTAREA and contenteditable targets', () =>
    {
        const ctx = service.getExecutionContext();
        const setKeyDownSpy = jest.spyOn(ctx, 'setKeyDown');

        const keyDownHandler = (service as any).keyDownHandler as (e: KeyboardEvent) => void;

        keyDownHandler({ key: 'a', target: document.createElement('input') } as any);
        keyDownHandler({ key: 'a', target: document.createElement('textarea') } as any);

        const editable = document.createElement('div');
        editable.setAttribute('contenteditable', 'true');
        keyDownHandler({ key: 'a', target: editable } as any);

        expect(setKeyDownSpy).not.toHaveBeenCalled();

        keyDownHandler({ key: 'a', target: document.createElement('div') } as any);
        expect(setKeyDownSpy).toHaveBeenCalledWith('a');
    });

    it('should manage run/pause/resume/stop/reset state transitions', () =>
    {
        expect(service.state).toBe(InterpreterState.Idle);
        expect(service.isRunning).toBe(false);
        expect(service.program).toBeNull();

        service.run();
        expect(service.state).toBe(InterpreterState.Idle);

        service.program = new Program();
        service.run();
        expect(service.state).toBe(InterpreterState.Running);
        expect(service.isRunning).toBe(true);

        service.pause();
        expect(service.state).toBe(InterpreterState.Paused);
        expect(service.isRunning).toBe(false);

        service.resume();
        expect(service.state).toBe(InterpreterState.Running);
        expect(service.isRunning).toBe(true);

        service.stop();
        expect(service.state).toBe(InterpreterState.Idle);
        expect(service.isRunning).toBe(false);

        service.reset();
        expect(service.program).toBeNull();
        expect(service.state).toBe(InterpreterState.Idle);
        expect(service.parseResult).toBeNull();
        expect(service.isRunning).toBe(false);
    });

    it('should create and cache RuntimeExecution and wire tab switching', () =>
    {
        service.program = new Program();

        const r1 = service.getRuntimeExecution();
        const r2 = service.getRuntimeExecution();
        expect(r1).toBe(r2);

        r1.requestTabSwitch('output');
        expect(tabSwitchService.requestTabSwitch).toHaveBeenCalledWith('output');

        expect(graphicsService.getGraphics).toHaveBeenCalled();
        expect(audioService.getAudio).toHaveBeenCalled();
    });

    it('parse should return errors without throwing for invalid source', () =>
    {
        const okLine: ParsedLine = {
            lineNumber: 1,
            sourceText: 'OK',
            statement: new NoOpStatement('OK'),
            hasError: false,
        };

        const badLine: ParsedLine = {
            lineNumber: 2,
            sourceText: 'BAD',
            statement: new NoOpStatement('BAD'),
            hasError: true,
            errorMessage: 'Unknown keyword: BAD',
        };

        (parserService.parseLine as jest.Mock)
            .mockReturnValueOnce(success(okLine))
            .mockReturnValueOnce(success(badLine));

        const result = service.parse('OK\nBAD');

        expect(parserService.clear).toHaveBeenCalled();
        expect(result.success).toBe(false);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0]).toContain('Unknown keyword: BAD');
        expect(service.state).toBe(InterpreterState.Error);
        expect(service.program).not.toBeNull();
        expect(service.parseResult).not.toBeNull();
    });

    it('parse should succeed when no lines have parse errors', () =>
    {
        const okLine: ParsedLine = {
            lineNumber: 1,
            sourceText: 'OK',
            statement: new NoOpStatement('OK'),
            hasError: false,
        };

        (parserService.parseLine as jest.Mock).mockReturnValue(success(okLine));

        const result = service.parse('OK');

        expect(result.success).toBe(true);
        expect(result.errors).toEqual([]);
        expect(service.state).toBe(InterpreterState.Idle);
        expect(service.program).not.toBeNull();
    });

    it('parse should handle parser service failures without throwing', () =>
    {
        (parserService.parseLine as jest.Mock).mockReturnValue(failure('Parse error'));

        const result = service.parse('X');

        expect(result.success).toBe(false);
        expect(result.errors[0]).toContain('Parse error');
        expect(service.state).toBe(InterpreterState.Error);
    });
});

