import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ConsoleComponent } from '../src/app/console/console.component';
import { ConsoleService, ConsoleEntry } from '../src/app/console/console.service';
import { BehaviorSubject } from 'rxjs';
import { ParsedLine } from '../src/app/interpreter/parser.service';
import { LetStatement } from '../src/lang/statements/variables/let-statement';
import { PrintStatement } from '../src/lang/statements/io/print-statement';
import { UnparsableStatement } from '../src/lang/statements/unparsable-statement';
import { LiteralExpression } from '../src/lang/expressions/literals/literal-expression';
import { EduBasicType } from '../src/lang/edu-basic-value';

describe('ConsoleComponent', () => {
    let component: ConsoleComponent;
    let fixture: ComponentFixture<ConsoleComponent>;
    let consoleService: jest.Mocked<ConsoleService>;

    let displayHistorySubject: BehaviorSubject<ConsoleEntry[]>;
    let inputHistorySubject: BehaviorSubject<string[]>;
    let historyIndexSubject: BehaviorSubject<number>;
    let currentInputSubject: BehaviorSubject<string>;

    beforeEach(async () => {
        displayHistorySubject = new BehaviorSubject<ConsoleEntry[]>([]);
        inputHistorySubject = new BehaviorSubject<string[]>([]);
        historyIndexSubject = new BehaviorSubject<number>(-1);
        currentInputSubject = new BehaviorSubject<string>('');

        const consoleServiceMock = {
            displayHistory$: displayHistorySubject.asObservable(),
            inputHistory$: inputHistorySubject.asObservable(),
            historyIndex$: historyIndexSubject.asObservable(),
            currentInput$: currentInputSubject.asObservable(),
            displayHistory: [],
            inputHistory: [],
            historyIndex: -1,
            currentInput: '',
            parseLine: jest.fn(),
            executeCommand: jest.fn(),
            navigateHistoryUp: jest.fn(),
            navigateHistoryDown: jest.fn()
        } as any;

        await TestBed.configureTestingModule({
            imports: [ConsoleComponent, FormsModule],
            providers: [
                { provide: ConsoleService, useValue: consoleServiceMock }
            ]
        }).compileComponents();

        consoleService = TestBed.inject(ConsoleService) as jest.Mocked<ConsoleService>;
        fixture = TestBed.createComponent(ConsoleComponent);
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

        it('should initialize with empty console history', () => {
            fixture.detectChanges();
            expect(component.consoleHistory).toEqual([]);
        });

        it('should initialize with empty current input', () => {
            fixture.detectChanges();
            expect(component.currentInput).toBe('');
        });

        it('should subscribe to display history changes', () => {
            fixture.detectChanges();

            const entry: ConsoleEntry = {
                type: 'output',
                text: 'Test output',
                timestamp: new Date()
            };

            displayHistorySubject.next([entry]);

            expect(component.consoleHistory).toEqual([entry]);
        });
    });

    describe('Canonical Representation Replacement', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should replace input with canonical representation on Enter', () => {
            const statement = new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'let x=42',
                statement,
                hasError: false
            };

            consoleService.parseLine.mockReturnValue(parsedLine);

            component.currentInput = 'let x=42';

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            component.onKeyDown(event);

            expect(consoleService.parseLine).toHaveBeenCalledWith('let x=42');
            expect(component.currentInput).toBe('LET x = 42');
            expect(consoleService.executeCommand).toHaveBeenCalledWith('LET x = 42');
        });

        it('should replace PRINT statement with canonical representation', () => {
            const statement = new PrintStatement([new LiteralExpression({ type: EduBasicType.String, value: 'Hello' })]);
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'print "Hello"',
                statement,
                hasError: false
            };

            consoleService.parseLine.mockReturnValue(parsedLine);

            component.currentInput = 'print "Hello"';

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            component.onKeyDown(event);

            expect(component.currentInput).toBe('PRINT "Hello"');
            expect(consoleService.executeCommand).toHaveBeenCalledWith('PRINT "Hello"');
        });

        it('should not replace input if parsing fails', () => {
            const unparsableStatement = new UnparsableStatement('INVALID', 'Syntax error');
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'INVALID',
                statement: unparsableStatement,
                hasError: true,
                errorMessage: 'Syntax error'
            };

            consoleService.parseLine.mockReturnValue(parsedLine);

            component.currentInput = 'INVALID';

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            component.onKeyDown(event);

            expect(consoleService.executeCommand).toHaveBeenCalledWith('INVALID');
        });

        it('should not replace input if parseLine returns null', () => {
            consoleService.parseLine.mockReturnValue(null);

            component.currentInput = 'INVALID';

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            component.onKeyDown(event);

            expect(consoleService.executeCommand).toHaveBeenCalledWith('INVALID');
        });

        it('should handle empty input', () => {
            component.currentInput = '';

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            component.onKeyDown(event);

            expect(consoleService.executeCommand).not.toHaveBeenCalled();
        });

        it('should handle whitespace-only input', () => {
            component.currentInput = '   ';

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            component.onKeyDown(event);

            expect(consoleService.executeCommand).not.toHaveBeenCalled();
        });

        it('should clear input after execution', () => {
            const statement = new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'LET x = 42',
                statement,
                hasError: false
            };

            consoleService.parseLine.mockReturnValue(parsedLine);

            component.currentInput = 'LET x = 42';

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            component.onKeyDown(event);

            expect(component.currentInput).toBe('');
        });
    });

    describe('History Navigation', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should navigate history up on ArrowUp', () => {
            consoleService.navigateHistoryUp.mockReturnValue('previous command');

            const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            event.preventDefault = jest.fn();
            component.onKeyDown(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(consoleService.navigateHistoryUp).toHaveBeenCalled();
            expect(component.currentInput).toBe('previous command');
        });

        it('should navigate history down on ArrowDown', () => {
            consoleService.navigateHistoryDown.mockReturnValue('next command');

            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            event.preventDefault = jest.fn();
            component.onKeyDown(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(consoleService.navigateHistoryDown).toHaveBeenCalled();
            expect(component.currentInput).toBe('next command');
        });

        it('should not update input if history navigation returns null', () => {
            consoleService.navigateHistoryUp.mockReturnValue(null);

            component.currentInput = 'current input';

            const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            component.onKeyDown(event);

            expect(component.currentInput).toBe('current input');
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
