import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeEditorComponent } from '../src/app/code-editor/code-editor.component';
import { DiskService } from '../src/app/disk/disk.service';
import { InterpreterService } from '../src/app/interpreter/interpreter.service';
import { ParserService, ParsedLine } from '../src/app/interpreter/parser';
import { BehaviorSubject } from 'rxjs';
import { LetStatement } from '../src/lang/statements/variables';
import { PrintStatement } from '../src/lang/statements/io';
import { UnparsableStatement } from '../src/lang/statements/unparsable-statement';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { EduBasicType } from '../src/lang/edu-basic-value';
import { Program } from '../src/lang/program';
import { ExecutionContext } from '../src/lang/execution-context';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { GraphicsService } from '../src/app/interpreter/graphics.service';
import { AudioService } from '../src/app/interpreter/audio.service';
import { TabSwitchService } from '../src/app/tab-switch.service';
import { FileSystemService } from '../src/app/files/filesystem.service';
import { success, failure } from '../src/app/interpreter/parser/parse-result';

describe('CodeEditorComponent', () => {
    let component: CodeEditorComponent;
    let fixture: ComponentFixture<CodeEditorComponent>;
    let diskService: jest.Mocked<DiskService>;
    let interpreterService: jest.Mocked<InterpreterService>;
    let parserService: jest.Mocked<ParserService>;

    let programCodeSubject: BehaviorSubject<string>;

    beforeEach(async () => {
        programCodeSubject = new BehaviorSubject<string>('');

        const diskServiceMock = {
            programCode$: programCodeSubject.asObservable(),
            programCode: ''
        } as any;

        const parserServiceMock = {
            parseLine: jest.fn()
        } as any;

        const interpreterServiceMock = {
            reset: jest.fn(),
            getSharedProgram: jest.fn().mockReturnValue(new Program()),
            getExecutionContext: jest.fn().mockReturnValue(new ExecutionContext()),
            getRuntimeExecution: jest.fn(),
            program: null,
            state: 'idle'
        } as any;

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
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with empty code', () => {
            fixture.detectChanges();
            expect(component.code).toBe('');
        });

        it('should subscribe to program code changes', () => {
            fixture.detectChanges();

            programCodeSubject.next('PRINT "Hello"');

            expect(component.code).toBe('PRINT "Hello"');
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

            component.code = 'let x=42';
            component.ngAfterViewInit();

            const textarea = component['textareaElement'];
            if (textarea)
            {
                textarea.value = 'let x=42';
                textarea.setSelectionRange(7, 7);

                const mockEvent = {
                    key: 'Enter',
                    target: textarea
                } as unknown as KeyboardEvent;

                component.onTextAreaKeyDown(mockEvent);

                setTimeout(() => {
                    expect(component.code).toBe('LET x = 42');
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

            component.code = '    print "Hello"';
            component.ngAfterViewInit();

            const textarea = component['textareaElement'];
            if (textarea)
            {
                textarea.value = '    print "Hello"';
                textarea.setSelectionRange(18, 18);

                component.onTextAreaBlur();

                setTimeout(() => {
                    expect(component.code).toBe('    PRINT "Hello"');
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
            component.code = '';
            component.ngAfterViewInit();

            component.onTextAreaBlur();

            expect(parserService.parseLine).not.toHaveBeenCalled();
        });

        it('should not replace comment lines', () => {
            component.code = "' This is a comment";
            component.ngAfterViewInit();

            component.onTextAreaBlur();

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

            component.code = 'LET x = 42';
            component.ngAfterViewInit();

            component.onTextAreaBlur();

            expect(component.code).toBe('LET x = 42');
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

            component.code = 'LET x = 42\nINVALID';
            component.onTextAreaInput({ target: { value: 'LET x = 42\nINVALID' } } as any);

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

            component.code = 'INVALID';
            component.onTextAreaInput({ target: { value: 'INVALID' } } as any);

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

            component.code = 'LET x = 42';
            component.onTextAreaInput({ target: { value: 'LET x = 42' } } as any);

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

            component.code = 'INVALID1\nLET x = 42\nINVALID2';
            component.onTextAreaInput({ target: { value: 'INVALID1\nLET x = 42\nINVALID2' } } as any);

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

            component.code = 'INVALID';
            component.onTextAreaInput({ target: { value: 'INVALID' } } as any);

            expect(component.errorLines.has(0)).toBe(true);

            component.code = 'LET x = 42';
            component.onTextAreaInput({ target: { value: 'LET x = 42' } } as any);

            expect(component.errorLines.has(0)).toBe(false);
        });

        it('should handle parse failures as errors', () => {
            parserService.parseLine.mockReturnValue(failure('Parse error'));

            component.code = 'INVALID';
            component.onTextAreaInput({ target: { value: 'INVALID' } } as any);

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

            expect(component.isLineError(0)).toBe(true);
            expect(component.isLineError(2)).toBe(true);
        });

        it('should return false for non-error lines', () => {
            component.errorLines.add(0);

            expect(component.isLineError(1)).toBe(false);
            expect(component.isLineError(2)).toBe(false);
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

            component.code = 'Line 1\nLine 2\nLine 3';
            component.onTextAreaInput({ target: { value: 'Line 1\nLine 2\nLine 3' } } as any);

            expect(component.lineNumbers.length).toBeGreaterThan(0);
        });

        it('should handle empty code', () => {
            component.code = '';
            component.onTextAreaInput({ target: { value: '' } } as any);

            expect(component.lineNumbers.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Component Cleanup', () => {
        it('should remove resize event listener on destroy', () => {
            fixture.detectChanges();
            component.ngAfterViewInit();

            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            component.ngOnDestroy();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        });

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
