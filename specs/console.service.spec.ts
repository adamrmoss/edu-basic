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
import { success } from '../src/app/interpreter/parser/parse-result';

describe('ConsoleService', () => {
    let service: ConsoleService;
    let parserService: jest.Mocked<ParserService>;
    let interpreterService: jest.Mocked<InterpreterService>;
    let graphicsService: jest.Mocked<GraphicsService>;
    let audioService: jest.Mocked<AudioService>;

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

        TestBed.configureTestingModule({
            providers: [
                ConsoleService,
                { provide: ParserService, useValue: parserServiceMock },
                { provide: InterpreterService, useValue: interpreterServiceMock },
                { provide: GraphicsService, useValue: graphicsServiceMock },
                { provide: AudioService, useValue: audioServiceMock },
                ExpressionParserService
            ]
        });

        service = TestBed.inject(ConsoleService);
        parserService = TestBed.inject(ParserService) as jest.Mocked<ParserService>;
        interpreterService = TestBed.inject(InterpreterService) as jest.Mocked<InterpreterService>;
        graphicsService = TestBed.inject(GraphicsService) as jest.Mocked<GraphicsService>;
        audioService = TestBed.inject(AudioService) as jest.Mocked<AudioService>;
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
});
