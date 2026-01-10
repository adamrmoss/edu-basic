import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ParserService } from '../interpreter/parser.service';
import { InterpreterService } from '../interpreter/interpreter.service';
import { GraphicsService } from '../interpreter/graphics.service';
import { AudioService } from '../interpreter/audio.service';
import { Statement } from '../../lang/statements/statement';

export interface ConsoleEntry
{
    type: 'input' | 'output' | 'error';
    text: string;
    timestamp: Date;
}

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

    public setCurrentInput(input: string): void
    {
        this.currentInputSubject.next(input);
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

        try
        {
            const parsedLine = this.parserService.parseLine(0, command);

            if (parsedLine.hasError)
            {
                this.printError(parsedLine.errorMessage || 'Parse error');
                return;
            }

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
