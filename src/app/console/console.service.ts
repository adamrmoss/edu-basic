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

export interface ConsoleEntry
{
    type: 'input' | 'output' | 'error';
    text: string;
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

    public readonly displayHistory$: Observable<ConsoleEntry[]> = this.displayHistorySubject.asObservable();
    public readonly inputHistory$: Observable<string[]> = this.inputHistorySubject.asObservable();
    public readonly historyIndex$: Observable<number> = this.historyIndexSubject.asObservable();
    public readonly currentInput$: Observable<string> = this.currentInputSubject.asObservable();

    constructor(
        private readonly parserService: ParserService,
        private readonly interpreterService: InterpreterService,
        private readonly graphicsService: GraphicsService,
        private readonly audioService: AudioService
    )
    {
    }

    private readonly expressionParser: ExpressionParser = new ExpressionParser();

    public get displayHistory(): ConsoleEntry[]
    {
        return this.displayHistorySubject.value;
    }

    public get inputHistory(): string[]
    {
        return this.inputHistorySubject.value;
    }

    public get historyIndex(): number
    {
        return this.historyIndexSubject.value;
    }

    public get currentInput(): string
    {
        return this.currentInputSubject.value;
    }

    public set currentInput(input: string)
    {
        this.currentInputSubject.next(input);
    }

    public parseLine(command: string): ParsedLine | null
    {
        const parseResult = this.parserService.parseLine(0, command);
        
        if (!parseResult.success)
        {
            return null;
        }
        
        return parseResult.value;
    }

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


    public printOutput(message: string): void
    {
        this.addToDisplay({
            type: 'output',
            text: message,
            timestamp: new Date()
        });
    }

    public printError(message: string): void
    {
        this.addToDisplay({
            type: 'error',
            text: `ERROR: ${message}`,
            timestamp: new Date()
        });
    }

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

    public clear(): void
    {
        this.displayHistorySubject.next([]);
    }

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
