import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ParserService, ParsedLine } from '../interpreter/parser.service';
import { InterpreterService } from '../interpreter/interpreter.service';
import { GraphicsService } from '../interpreter/graphics.service';
import { AudioService } from '../interpreter/audio.service';
import { ExpressionParser } from '../../lang/parsing/expression-parser';
import { Expression } from '../../lang/expressions/expression';
import { Statement } from '../../lang/statements/statement';
import { ConsoleStatement } from '../../lang/statements/misc';

/**
 * An entry in the console display history.
 */
export interface ConsoleEntry
{
    /**
     * Category of the entry (user input, program output, or error output).
     */
    type: 'input' | 'output' | 'error';

    /**
     * Text to display.
     */
    text: string;

    /**
     * Timestamp when the entry was recorded.
     */
    timestamp: Date;
}

/**
 * Implements the interactive console (REPL-like) experience.
 *
 * Responsibilities:
 * - Maintains console display history (input/output/error) and input recall history.
 * - Parses user input as either an expression or a statement.
 * - Executes the resulting statement against the shared runtime objects from `InterpreterService`.
 */
@Injectable({
    providedIn: 'root'
})
export class ConsoleService
{
    private readonly displayHistorySubject = new BehaviorSubject<ConsoleEntry[]>([]);
    private readonly inputHistorySubject = new BehaviorSubject<string[]>([]);
    private readonly historyIndexSubject = new BehaviorSubject<number>(-1);
    private readonly currentInputSubject = new BehaviorSubject<string>('');

    /**
     * Observable stream of console display entries.
     */
    public readonly displayHistory$: Observable<ConsoleEntry[]> = this.displayHistorySubject.asObservable();

    /**
     * Observable stream of input history entries (commands previously executed).
     */
    public readonly inputHistory$: Observable<string[]> = this.inputHistorySubject.asObservable();

    /**
     * Observable stream of the current history cursor index for navigation.
     */
    public readonly historyIndex$: Observable<number> = this.historyIndexSubject.asObservable();

    /**
     * Observable stream of the current input string.
     */
    public readonly currentInput$: Observable<string> = this.currentInputSubject.asObservable();

    /**
     * Create a new console service.
     *
     * @param parserService Statement parser service used for command parsing.
     * @param interpreterService Interpreter service providing shared runtime objects.
     * @param graphicsService Graphics service used by runtime execution.
     * @param audioService Audio service used by runtime execution.
     */
    constructor(
        private readonly parserService: ParserService,
        private readonly interpreterService: InterpreterService,
        private readonly graphicsService: GraphicsService,
        private readonly audioService: AudioService
    )
    {
    }

    private readonly expressionParser: ExpressionParser = new ExpressionParser();

    /**
     * Current display history snapshot.
     */
    public get displayHistory(): ConsoleEntry[]
    {
        return this.displayHistorySubject.value;
    }

    /**
     * Current input history snapshot.
     */
    public get inputHistory(): string[]
    {
        return this.inputHistorySubject.value;
    }

    /**
     * Current history navigation index.
     */
    public get historyIndex(): number
    {
        return this.historyIndexSubject.value;
    }

    /**
     * Current input string snapshot.
     */
    public get currentInput(): string
    {
        return this.currentInputSubject.value;
    }

    /**
     * Update the current input string.
     */
    public set currentInput(input: string)
    {
        this.currentInputSubject.next(input);
    }

    /**
     * Parse a single console input line into a statement wrapper.
     *
     * @param command User-entered command line.
     * @returns The parsed line, or `null` if parsing fails.
     */
    public parseLine(command: string): ParsedLine | null
    {
        const parseResult = this.parserService.parseLine(0, command);
        
        if (!parseResult.success)
        {
            return null;
        }
        
        return parseResult.value;
    }

    /**
     * Execute a console command.
     *
     * The command is parsed as either an expression (displayed via `ConsoleStatement`)
     * or a statement, then executed against the shared runtime objects.
     *
     * @param command Raw user input command.
     */
    public executeCommand(command: string): void
    {
        if (!command.trim())
        {
            return;
        }

        this.addToInputHistory(command);
        
        this.addToDisplay({
            type: 'input',
            text: `> ${command}`,
            timestamp: new Date()
        });
        
        this.historyIndexSubject.next(-1);

        const trimmedCommand = command.trim();
        
        let parsedLine: ParsedLine | null = null;
        
        const expressionResult = this.expressionParser.parseExpression(trimmedCommand);
        
        if (expressionResult.success)
        {
            const consoleStatement = new ConsoleStatement(expressionResult.value);
            parsedLine = {
                lineNumber: 0,
                sourceText: command,
                statement: consoleStatement,
                hasError: false
            };
        }
        else
        {
            const parseResult = this.parserService.parseLine(0, trimmedCommand);
            
            if (!parseResult.success)
            {
                this.printError(parseResult.error || 'Parse error');
                return;
            }
            
            parsedLine = parseResult.value;
        }

        if (parsedLine === null)
        {
            this.printError('Parse error');
            return;
        }

        if (parsedLine.hasError)
        {
            this.printError(parsedLine.errorMessage || 'Parse error');
            return;
        }

        try
        {
            const statement = parsedLine.statement;
            const context = this.interpreterService.getExecutionContext();
            const program = this.interpreterService.getSharedProgram();
            const runtime = this.interpreterService.getRuntimeExecution();
            const graphics = this.graphicsService.getGraphics();
            const audio = this.audioService.getAudio();

            statement.execute(context, graphics, audio, program, runtime);
        }
        catch (error)
        {
            console.error('Error executing command:', error);
            this.printError(error instanceof Error ? error.message : String(error));
        }
    }

    /**
     * Add an output entry to the display history.
     *
     * @param message Message text to display.
     */
    public printOutput(message: string): void
    {
        this.addToDisplay({
            type: 'output',
            text: message,
            timestamp: new Date()
        });
    }

    /**
     * Add an error entry to the display history.
     *
     * @param message Error message text to display.
     */
    public printError(message: string): void
    {
        this.addToDisplay({
            type: 'error',
            text: `ERROR: ${message}`,
            timestamp: new Date()
        });
    }

    /**
     * Navigate up through the input history.
     *
     * @returns The previous command, or `null` when no history exists.
     */
    public navigateHistoryUp(): string | null
    {
        const history = this.inputHistory;
        
        if (history.length === 0)
        {
            return null;
        }

        let newIndex = this.historyIndex;
        
        if (newIndex === -1)
        {
            newIndex = history.length - 1;
        }
        else if (newIndex > 0)
        {
            newIndex--;
        }

        this.historyIndexSubject.next(newIndex);
        return history[newIndex];
    }

    /**
     * Navigate down through the input history.
     *
     * @returns The next command, an empty string when reaching the end, or `null` when no history exists.
     */
    public navigateHistoryDown(): string | null
    {
        const history = this.inputHistory;
        let newIndex = this.historyIndex;

        if (newIndex === -1)
        {
            return null;
        }

        newIndex++;

        if (newIndex >= history.length)
        {
            this.historyIndexSubject.next(-1);
            return '';
        }

        this.historyIndexSubject.next(newIndex);
        return history[newIndex];
    }

    /**
     * Clear the console display history.
     */
    public clear(): void
    {
        this.displayHistorySubject.next([]);
    }

    /**
     * Clear the input history and reset navigation state.
     */
    public clearInputHistory(): void
    {
        this.inputHistorySubject.next([]);
        this.historyIndexSubject.next(-1);
    }

    private addToDisplay(entry: ConsoleEntry): void
    {
        const currentDisplay = this.displayHistorySubject.value;
        this.displayHistorySubject.next([...currentDisplay, entry]);
    }

    private addToInputHistory(command: string): void
    {
        const currentHistory = this.inputHistorySubject.value;
        this.inputHistorySubject.next([...currentHistory, command]);
    }
}
