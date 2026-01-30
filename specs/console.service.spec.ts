import { TestBed } from '@angular/core/testing';
import { ConsoleService } from '../src/app/console/console.service';
import { ParserService, ParsedLine } from '../src/app/interpreter/parser';
import { InterpreterService } from '../src/app/interpreter/interpreter.service';
import { GraphicsService } from '../src/app/interpreter/graphics.service';
import { AudioService } from '../src/app/interpreter/audio.service';
import { ExpressionParserService } from '../src/app/interpreter/expression-parser.service';
import { LetStatement } from '../src/lang/statements/variables';
import { PrintStatement } from '../src/lang/statements/io';
import { UnparsableStatement } from '../src/lang/statements/unparsable-statement';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { EduBasicType } from '../src/lang/edu-basic-value';
import { failure, success } from '../src/app/interpreter/parser/parse-result';
import { ExecutionContext } from '../src/lang/execution-context';
import { Program } from '../src/lang/program';
import { Graphics } from '../src/lang/graphics';
import { Audio } from '../src/lang/audio';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { FileSystemService } from '../src/app/disk/filesystem.service';
import { ThrowStatement } from '../src/lang/statements/control-flow';

describe('ConsoleService', () => {
    let service: ConsoleService;
    let parserService: jest.Mocked<ParserService>;
    let interpreterService: jest.Mocked<InterpreterService>;
    let graphicsService: jest.Mocked<GraphicsService>;
    let audioService: jest.Mocked<AudioService>;
    let expressionParserService: jest.Mocked<ExpressionParserService>;

    beforeEach(() => {
        const parserServiceMock = {
            parseLine: jest.fn()
        } as any;

        const interpreterServiceMock = {
            getExecutionContext: jest.fn(),
            getSharedProgram: jest.fn(),
            getRuntimeExecution: jest.fn()
        } as any;

        const graphicsServiceMock = {
            getGraphics: jest.fn()
        } as any;

        const audioServiceMock = {
            getAudio: jest.fn()
        } as any;

        const expressionParserServiceMock = {
            parseExpression: jest.fn()
        } as any;

        TestBed.configureTestingModule({
            providers: [
                ConsoleService,
                { provide: ParserService, useValue: parserServiceMock },
                { provide: InterpreterService, useValue: interpreterServiceMock },
                { provide: GraphicsService, useValue: graphicsServiceMock },
                { provide: AudioService, useValue: audioServiceMock },
                { provide: ExpressionParserService, useValue: expressionParserServiceMock }
            ]
        });

        service = TestBed.inject(ConsoleService);
        parserService = TestBed.inject(ParserService) as jest.Mocked<ParserService>;
        interpreterService = TestBed.inject(InterpreterService) as jest.Mocked<InterpreterService>;
        graphicsService = TestBed.inject(GraphicsService) as jest.Mocked<GraphicsService>;
        audioService = TestBed.inject(AudioService) as jest.Mocked<AudioService>;
        expressionParserService = TestBed.inject(ExpressionParserService) as jest.Mocked<ExpressionParserService>;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('parseLine', () => {
        it('should parse a valid command and return ParsedLine', () => {
            const statement = new LetStatement('x', new LiteralExpression({ type: EduBasicType.Integer, value: 42 }));
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'LET x = 42',
                statement,
                hasError: false
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            const result = service.parseLine('LET x = 42');

            expect(result).toBe(parsedLine);
            expect(parserService.parseLine).toHaveBeenCalledWith(0, 'LET x = 42');
        });

        it('should return null when parsing fails', () => {
            parserService.parseLine.mockReturnValue({ success: false, error: 'Parse error' });

            const result = service.parseLine('INVALID COMMAND');

            expect(result).toBeNull();
        });

        it('should handle commands with different statement types', () => {
            const printStatement = new PrintStatement([new LiteralExpression({ type: EduBasicType.String, value: 'Hello' })]);
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'PRINT "Hello"',
                statement: printStatement,
                hasError: false
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            const result = service.parseLine('PRINT "Hello"');

            expect(result).toBe(parsedLine);
        });

        it('should handle commands with parse errors', () => {
            const unparsableStatement = new UnparsableStatement('INVALID', 'Syntax error');
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'INVALID',
                statement: unparsableStatement,
                hasError: true,
                errorMessage: 'Syntax error'
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            const result = service.parseLine('INVALID');

            expect(result).toBe(parsedLine);
            expect(result?.hasError).toBe(true);
        });

        it('should handle empty strings', () => {
            const unparsableStatement = new UnparsableStatement('', 'Comment or empty line');
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: '',
                statement: unparsableStatement,
                hasError: false
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            const result = service.parseLine('');

            expect(result).toBe(parsedLine);
        });

        it('should handle whitespace-only strings', () => {
            const unparsableStatement = new UnparsableStatement('   ', 'Comment or empty line');
            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: '   ',
                statement: unparsableStatement,
                hasError: false
            };

            parserService.parseLine.mockReturnValue(success(parsedLine));

            const result = service.parseLine('   ');

            expect(result).toBe(parsedLine);
        });
    });

    describe('executeCommand', () => {
        it('should ignore empty/whitespace-only commands', () => {
            service.executeCommand('');
            service.executeCommand('   ');

            expect(service.inputHistory.length).toBe(0);
            expect(service.displayHistory.length).toBe(0);
        });

        it('should execute expressions by wrapping them as CONSOLE statements', () => {
            const context = new ExecutionContext();
            const program = new Program();
            const graphics = new Graphics();
            const audio = new Audio();
            const fileSystem = new FileSystemService();
            const runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem, service);

            interpreterService.getExecutionContext.mockReturnValue(context as any);
            interpreterService.getSharedProgram.mockReturnValue(program as any);
            interpreterService.getRuntimeExecution.mockReturnValue(runtime as any);
            graphicsService.getGraphics.mockReturnValue(graphics as any);
            audioService.getAudio.mockReturnValue(audio as any);

            expressionParserService.parseExpression.mockReturnValue(success(
                new LiteralExpression({ type: EduBasicType.String, value: 'hello' })
            ));

            service.executeCommand('"hello"');

            expect(service.inputHistory).toEqual(['"hello"']);
            expect(service.displayHistory.length).toBe(2);
            expect(service.displayHistory[0].type).toBe('input');
            expect(service.displayHistory[1].type).toBe('output');
            expect(service.displayHistory[1].text).toBe('hello');
        });

        it('should execute parsed statements when expression parsing fails', () => {
            const context = new ExecutionContext();
            const program = new Program();
            const graphics = new Graphics();
            const audio = new Audio();
            const fileSystem = new FileSystemService();
            const runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem, service);

            interpreterService.getExecutionContext.mockReturnValue(context as any);
            interpreterService.getSharedProgram.mockReturnValue(program as any);
            interpreterService.getRuntimeExecution.mockReturnValue(runtime as any);
            graphicsService.getGraphics.mockReturnValue(graphics as any);
            audioService.getAudio.mockReturnValue(audio as any);

            expressionParserService.parseExpression.mockReturnValue(failure('not an expression'));

            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'TOUCH',
                statement: new LetStatement('x%', new LiteralExpression({ type: EduBasicType.Integer, value: 1 })),
                hasError: false
            };
            parserService.parseLine.mockReturnValue(success(parsedLine));

            service.executeCommand('TOUCH');

            expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 1 });
            expect(service.displayHistory[0].text).toBe('> TOUCH');
        });

        it('should print error when parsing fails', () => {
            expressionParserService.parseExpression.mockReturnValue(failure('not an expression'));
            parserService.parseLine.mockReturnValue({ success: false, error: 'Parse error' } as any);

            service.executeCommand('BAD');

            expect(service.displayHistory.length).toBe(2);
            expect(service.displayHistory[1].type).toBe('error');
            expect(service.displayHistory[1].text).toBe('ERROR: Parse error');
        });

        it('should print error when parsed line hasError is true', () => {
            expressionParserService.parseExpression.mockReturnValue(failure('not an expression'));

            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'BAD',
                statement: new UnparsableStatement('BAD', 'Oops'),
                hasError: true,
                errorMessage: 'Oops'
            };
            parserService.parseLine.mockReturnValue(success(parsedLine));

            service.executeCommand('BAD');

            expect(service.displayHistory[1].text).toBe('ERROR: Oops');
        });

        it('should catch exceptions during execution and print error', () => {
            const context = new ExecutionContext();
            const program = new Program();
            const graphics = new Graphics();
            const audio = new Audio();
            const fileSystem = new FileSystemService();
            const runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem, service);

            interpreterService.getExecutionContext.mockReturnValue(context as any);
            interpreterService.getSharedProgram.mockReturnValue(program as any);
            interpreterService.getRuntimeExecution.mockReturnValue(runtime as any);
            graphicsService.getGraphics.mockReturnValue(graphics as any);
            audioService.getAudio.mockReturnValue(audio as any);

            expressionParserService.parseExpression.mockReturnValue(failure('not an expression'));

            const parsedLine: ParsedLine = {
                lineNumber: 0,
                sourceText: 'THROW',
                statement: new ThrowStatement(new LiteralExpression({ type: EduBasicType.String, value: 'Boom' })),
                hasError: false
            };
            parserService.parseLine.mockReturnValue(success(parsedLine));

            jest.spyOn(console, 'error').mockImplementation(() => undefined);

            service.executeCommand('THROW');

            expect(service.displayHistory[1].text).toBe('ERROR: Boom');
        });
    });

    describe('history and output helpers', () => {
        it('should navigate input history up and down', () => {
            expressionParserService.parseExpression.mockReturnValue(failure('not an expression'));
            parserService.parseLine.mockReturnValue(success({
                lineNumber: 0,
                sourceText: 'X',
                statement: new LetStatement('x%', new LiteralExpression({ type: EduBasicType.Integer, value: 1 })),
                hasError: false
            }));

            interpreterService.getExecutionContext.mockReturnValue(new ExecutionContext() as any);
            interpreterService.getSharedProgram.mockReturnValue(new Program() as any);
            interpreterService.getRuntimeExecution.mockReturnValue(new RuntimeExecution(new Program(), new ExecutionContext(), new Graphics(), new Audio(), new FileSystemService()) as any);
            graphicsService.getGraphics.mockReturnValue(new Graphics() as any);
            audioService.getAudio.mockReturnValue(new Audio() as any);

            service.executeCommand('X');
            service.executeCommand('Y');

            expect(service.navigateHistoryUp()).toBe('Y');
            expect(service.navigateHistoryUp()).toBe('X');
            expect(service.navigateHistoryDown()).toBe('Y');
            expect(service.navigateHistoryDown()).toBe('');
            expect(service.navigateHistoryDown()).toBeNull();
        });

        it('should clear display and input history', () => {
            service.printOutput('hi');
            service.printError('no');
            service.currentInput = 'something';

            expect(service.displayHistory.length).toBe(2);
            expect(service.currentInput).toBe('something');

            service.clear();
            expect(service.displayHistory.length).toBe(0);

            // Add some input history via private path (executeCommand).
            expressionParserService.parseExpression.mockReturnValue(failure('not an expression'));
            parserService.parseLine.mockReturnValue({ success: false, error: 'Parse error' } as any);
            service.executeCommand('A');
            service.executeCommand('B');

            expect(service.inputHistory).toEqual(['A', 'B']);

            service.clearInputHistory();
            expect(service.inputHistory).toEqual([]);
            expect(service.historyIndex).toBe(-1);
        });
    });
});
