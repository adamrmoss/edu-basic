import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeEditorComponent } from '@/app/code-editor/code-editor.component';
import { DiskService } from '@/app/disk/disk.service';
import { InterpreterService, InterpreterState } from '@/app/interpreter/interpreter.service';
import { ParserService, ParsedLine } from '@/app/interpreter/parser.service';
import { BehaviorSubject } from 'rxjs';
import { LetStatement } from '@/lang/statements/variables';
import { PrintStatement } from '@/lang/statements/io';
import { UnparsableStatement } from '@/lang/statements/unparsable-statement';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { EduBasicType } from '@/lang/edu-basic-value';
import { Program } from '@/lang/program';
import { ExecutionContext } from '@/lang/execution-context';
import { RuntimeExecution } from '@/lang/runtime-execution';
import { ExecutionResult } from '@/lang/statements/statement';
import { GraphicsService } from '@/app/interpreter/graphics.service';
import { AudioService } from '@/app/interpreter/audio.service';
import { TabSwitchService } from '@/app/tab-switch.service';
import { FileSystemService } from '@/app/disk/filesystem.service';
import { success, failure } from '@/lang/parsing/parse-result';

describe('CodeEditorComponent', () => {
    let component: CodeEditorComponent;
    let fixture: ComponentFixture<CodeEditorComponent>;
    let diskService: jest.Mocked<DiskService>;
    let interpreterService: jest.Mocked<InterpreterService>;
    let parserService: jest.Mocked<ParserService>;

    let programCodeSubject: BehaviorSubject<string>;
    let runtimeExecution: any;

    beforeEach(async () => {
        programCodeSubject = new BehaviorSubject<string>('');

        const diskServiceMock = {
            programCode$: programCodeSubject.asObservable(),
            programCode: '',
            getProgramCodeFromFile: jest.fn().mockReturnValue('')
        } as any;

        const parserServiceMock = {
            parseLine: jest.fn()
        } as any;

        const sharedProgram = new Program();
        const executionContext = new ExecutionContext();

        const interpreterServiceMock = {
            reset: jest.fn(),
            run: jest.fn(),
            stop: jest.fn(),
            getSharedProgram: jest.fn().mockReturnValue(sharedProgram),
            getExecutionContext: jest.fn().mockReturnValue(executionContext),
            getRuntimeExecution: jest.fn(),
            program: null,
            state: InterpreterState.Idle
        } as any;
        interpreterServiceMock.run.mockImplementation(() =>
        {
            interpreterServiceMock.state = InterpreterState.Running;
        });
        interpreterServiceMock.stop.mockImplementation(() =>
        {
            interpreterServiceMock.state = InterpreterState.Idle;
        });

        const graphicsServiceMock = {
            getGraphics: jest.fn()
        } as any;

        const audioServiceMock = {
            getAudio: jest.fn()
        } as any;

        const tabSwitchServiceMock = {} as any;

        const fileSystemServiceMock = {} as any;

        const runtimeExecutionMock = {
            executeStep: jest.fn(),
            setTabSwitchCallback: jest.fn()
        } as any;

        interpreterServiceMock.getRuntimeExecution.mockReturnValue(runtimeExecutionMock);
        runtimeExecution = runtimeExecutionMock;

        await TestBed.configureTestingModule({
            imports: [CodeEditorComponent],
            providers: [
                { provide: DiskService, useValue: diskServiceMock },
                { provide: InterpreterService, useValue: interpreterServiceMock },
                { provide: ParserService, useValue: parserServiceMock },
                { provide: GraphicsService, useValue: graphicsServiceMock },
                { provide: AudioService, useValue: audioServiceMock },
                { provide: TabSwitchService, useValue: tabSwitchServiceMock },
                { provide: FileSystemService, useValue: fileSystemServiceMock }
            ]
        }).compileComponents();

        diskService = TestBed.inject(DiskService) as jest.Mocked<DiskService>;
        interpreterService = TestBed.inject(InterpreterService) as jest.Mocked<InterpreterService>;
        parserService = TestBed.inject(ParserService) as jest.Mocked<ParserService>;

        fixture = TestBed.createComponent(CodeEditorComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with empty code', () => {
            fixture.detectChanges();
            expect(component.lines).toEqual(['']);
        });

        it('should subscribe to program code changes', () => {
            fixture.detectChanges();

            programCodeSubject.next('PRINT "Hello"');

            expect(component.lines).toEqual(['PRINT "Hello"']);
        });

        it('should initialize with empty error lines', () => {
            fixture.detectChanges();
            expect(component.errorLines.size).toBe(0);
        });
    });

    describe('Canonical Representation Replacement', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should replace line with canonical representation on Enter', (done) => {
            const statement = new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'let x=42',
                statement,
                hasError: false
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            component.lines = ['let x=42'];
            fixture.detectChanges();

            const textarea = component.textEditorRef?.codeTextareaRef?.nativeElement;
            if (textarea)
            {
                textarea.value = 'let x=42';
                textarea.setSelectionRange(7, 7);

                const mockEvent = {
                    key: 'Enter',
                    target: textarea
                } as unknown as KeyboardEvent;

                component.onKeyDown(mockEvent);

                setTimeout(() => {
                    expect(component.lines).toEqual(['LET x = 42']);
                    expect(diskService.programCode).toBe('LET x = 42');
                    done();
                }, 10);
            }
            else
            {
                done();
            }
        });

        it('should preserve indentation when replacing with canonical representation', (done) => {
            const statement = new PrintStatement([new LiteralExpression({ type: EduBasicType.String, value: 'Hello' })]);
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'print "Hello"',
                statement,
                hasError: false
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            component.lines = ['    print "Hello"'];
            fixture.detectChanges();

            const textarea = component.textEditorRef?.codeTextareaRef?.nativeElement;
            if (textarea)
            {
                textarea.value = '    print "Hello"';
                textarea.setSelectionRange(18, 18);

                component.onBlur();

                setTimeout(() => {
                    expect(component.lines).toEqual(['    PRINT "Hello"']);
                    expect(diskService.programCode).toBe('    PRINT "Hello"');
                    done();
                }, 10);
            }
            else
            {
                done();
            }
        });

        it('should not replace empty lines', () => {
            component.lines = [''];
            fixture.detectChanges();

            component.onBlur();

            expect(parserService.parseLine).not.toHaveBeenCalled();
        });

        it('should not replace comment lines', () => {
            component.lines = ["' This is a comment"];
            fixture.detectChanges();

            component.onBlur();

            expect(parserService.parseLine).not.toHaveBeenCalled();
        });

        it('should not replace if canonical representation matches original', () => {
            const statement = new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'LET x = 42',
                statement,
                hasError: false
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            component.lines = ['LET x = 42'];
            fixture.detectChanges();

            component.onBlur();

            expect(component.lines).toEqual(['LET x = 42']);
        });

        it('should handle multiple lines with mixed valid and invalid', () => {
            const validStatement = new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));
            const errorStatement = new UnparsableStatement('INVALID', 'Error');

            parserService.parseLine
                .mockReturnValueOnce(success({
                    lineNumber: 0,
                    sourceText: 'LET x = 42',
                    statement: validStatement,
                    hasError: false
                } as ParsedLine))
                .mockReturnValueOnce(success({
                    lineNumber: 1,
                    sourceText: 'INVALID',
                    statement: errorStatement,
                    hasError: true,
                    errorMessage: 'Error'
                } as ParsedLine));

            component.lines = ['LET x = 42', 'INVALID'];
            component.onLinesChange(['LET x = 42', 'INVALID']);

            expect(component.errorLines.has(0)).toBe(false);
            expect(component.errorLines.has(1)).toBe(true);
        });
    });

    describe('Error Line Tracking', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should track lines with parse errors', () => {
            const unparsableStatement = new UnparsableStatement('INVALID', 'Syntax error');
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'INVALID',
                statement: unparsableStatement,
                hasError: true,
                errorMessage: 'Syntax error'
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            component.lines = ['INVALID'];
            component.onLinesChange(['INVALID']);

            expect(component.errorLines.has(0)).toBe(true);
        });

        it('should not track valid lines as errors', () => {
            const statement = new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'LET x = 42',
                statement,
                hasError: false
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            component.lines = ['LET x = 42'];
            component.onLinesChange(['LET x = 42']);

            expect(component.errorLines.has(0)).toBe(false);
        });

        it('should track multiple error lines', () => {
            const errorStatement = new UnparsableStatement('INVALID1', 'Error');
            const validStatement = new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));
            const anotherErrorStatement = new UnparsableStatement('INVALID2', 'Error');

            parserService.parseLine
                .mockReturnValueOnce(success({
                    lineNumber: 0,
                    sourceText: 'INVALID1',
                    statement: errorStatement,
                    hasError: true,
                    errorMessage: 'Error'
                } as ParsedLine))
                .mockReturnValueOnce(success({
                    lineNumber: 1,
                    sourceText: 'LET x = 42',
                    statement: validStatement,
                    hasError: false
                } as ParsedLine))
                .mockReturnValueOnce(success({
                    lineNumber: 2,
                    sourceText: 'INVALID2',
                    statement: anotherErrorStatement,
                    hasError: true,
                    errorMessage: 'Error'
                } as ParsedLine));

            component.lines = ['INVALID1', 'LET x = 42', 'INVALID2'];
            component.onLinesChange(['INVALID1', 'LET x = 42', 'INVALID2']);

            expect(component.errorLines.has(0)).toBe(true);
            expect(component.errorLines.has(1)).toBe(false);
            expect(component.errorLines.has(2)).toBe(true);
        });

        it('should clear error tracking when line is fixed', () => {
            const errorStatement = new UnparsableStatement('INVALID', 'Error');
            const validStatement = new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));

            parserService.parseLine
                .mockReturnValueOnce(success({
                    lineNumber: 0,
                    sourceText: 'INVALID',
                    statement: errorStatement,
                    hasError: true,
                    errorMessage: 'Error'
                } as ParsedLine))
                .mockReturnValueOnce(success({
                    lineNumber: 0,
                    sourceText: 'LET x = 42',
                    statement: validStatement,
                    hasError: false
                } as ParsedLine));

            component.lines = ['INVALID'];
            component.onLinesChange(['INVALID']);

            expect(component.errorLines.has(0)).toBe(true);

            component.lines = ['LET x = 42'];
            component.onLinesChange(['LET x = 42']);

            expect(component.errorLines.has(0)).toBe(false);
        });

        it('should handle parse failures as errors', () => {
            parserService.parseLine.mockReturnValue(failure('Parse error'));

            component.lines = ['INVALID'];
            component.onLinesChange(['INVALID']);

            expect(component.errorLines.has(0)).toBe(true);
        });
    });

    describe('isLineError', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should return true for error lines', () => {
            component.errorLines.add(0);
            component.errorLines.add(2);

            expect(component.errorLines.has(0)).toBe(true);
            expect(component.errorLines.has(2)).toBe(true);
        });

        it('should return false for non-error lines', () => {
            component.errorLines.add(0);

            expect(component.errorLines.has(1)).toBe(false);
            expect(component.errorLines.has(2)).toBe(false);
        });
    });

    describe('Line Number Updates', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should update line numbers on input', () => {
            parserService.parseLine.mockImplementation((lineNumber: number, sourceText: string) => {
                return success({
                    lineNumber,
                    sourceText,
                    statement: new UnparsableStatement(sourceText, 'Comment or empty line'),
                    hasError: false
                } as ParsedLine);
            });

            component.lines = ['Line 1', 'Line 2', 'Line 3'];
            fixture.detectChanges();
            component.onLinesChange(['Line 1', 'Line 2', 'Line 3']);

            expect(component.textEditorRef?.lineNumbers.length).toBeGreaterThan(0);
        });

        it('should handle empty code', () => {
            component.lines = [''];
            fixture.detectChanges();
            component.onLinesChange(['']);

            expect(component.textEditorRef?.lineNumbers.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Run Program', () =>
    {
        beforeEach(() =>
        {
            fixture.detectChanges();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should no-op when program code is empty/whitespace', () =>
        {
            diskService.getProgramCodeFromFile = jest.fn().mockReturnValue('   \n   ');

            component.onRun();

            expect(interpreterService.reset).not.toHaveBeenCalled();
            expect(parserService.parseLine).not.toHaveBeenCalled();
            expect(interpreterService.run).not.toHaveBeenCalled();
        });

        it('should parse, run, and stop when ExecutionResult.End is reached', () =>
        {
            jest.useFakeTimers();

            diskService.getProgramCodeFromFile = jest.fn().mockReturnValue([
                "' comment",
                'LET x = 1',
                'PRINT "A"'
            ].join('\n'));

            parserService.parseLine.mockImplementation((lineNumber: number, sourceText: string) =>
            {
                if (sourceText.startsWith('LET'))
                {
                    return success({
                        lineNumber,
                        sourceText,
                        statement: new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 1 })),
                        hasError: false
                    } as ParsedLine);
                }

                return success({
                    lineNumber,
                    sourceText,
                    statement: new PrintStatement([new LiteralExpression({ type: EduBasicType.String, value: 'A' })]),
                    hasError: false
                } as ParsedLine);
            });

            runtimeExecution.executeStep.mockReturnValue(ExecutionResult.End);

            const program = interpreterService.getSharedProgram();
            const clearSpy = jest.spyOn(program, 'clear');
            const appendSpy = jest.spyOn(program, 'appendLine');
            const rebuildSpy = jest.spyOn(program, 'rebuildLabelMap');

            component.onRun();

            expect(interpreterService.reset).toHaveBeenCalled();
            expect(clearSpy).toHaveBeenCalled();
            expect(appendSpy).toHaveBeenCalledTimes(2);
            expect(rebuildSpy).toHaveBeenCalled();

            expect(interpreterService.run).toHaveBeenCalled();

            jest.advanceTimersByTime(10);

            expect(runtimeExecution.executeStep).toHaveBeenCalled();
            expect(interpreterService.stop).toHaveBeenCalled();
        });

        it('should return early and log when parsing fails', () =>
        {
            diskService.getProgramCodeFromFile = jest.fn().mockReturnValue('PRINT 1');
            parserService.parseLine.mockReturnValue(failure('bad parse'));

            component.onRun();

            expect(interpreterService.reset).toHaveBeenCalled();
            expect(interpreterService.run).not.toHaveBeenCalled();
            expect(interpreterService.stop).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalled();
        });

        it('should stop when runtime execution throws', () =>
        {
            jest.useFakeTimers();

            diskService.getProgramCodeFromFile = jest.fn().mockReturnValue('PRINT "A"');
            parserService.parseLine.mockReturnValue(success({
                lineNumber: 0,
                sourceText: 'PRINT "A"',
                statement: new PrintStatement([new LiteralExpression({ type: EduBasicType.String, value: 'A' })]),
                hasError: false
            } as ParsedLine));

            runtimeExecution.executeStep.mockImplementation(() =>
            {
                throw new Error('boom');
            });

            component.onRun();
            jest.advanceTimersByTime(10);

            expect(console.error).toHaveBeenCalledWith('Error executing step:', expect.any(Error));
            expect(interpreterService.stop).toHaveBeenCalled();
        });
    });

    describe('Component Cleanup', () => {
        it('should unsubscribe on destroy', () => {
            fixture.detectChanges();

            const destroySpy = jest.spyOn(component['destroy$'], 'next');
            const completeSpy = jest.spyOn(component['destroy$'], 'complete');

            component.ngOnDestroy();

            expect(destroySpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });
    });
});
