import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ConsoleService, ConsoleEntry } from './console.service';

/**
 * Console UI component for interacting with the EduBASIC runtime.
 *
 * Displays console history and forwards user input to `ConsoleService`.
 */
@Component({
    selector: 'app-console',
    standalone: true,
    imports: [ CommonModule, FormsModule ],
    templateUrl: './console.component.html',
    styleUrl: './console.component.scss'
})
export class ConsoleComponent implements OnInit, OnDestroy
{
    /**
     * Entries displayed in the console window.
     */
    public consoleHistory: ConsoleEntry[] = [];

    /**
     * Current input line in the console prompt.
     */
    public currentInput: string = '';

    private readonly destroy$ = new Subject<void>();

    /**
     * Create a new console component.
     *
     * @param consoleService Console service backing input parsing and execution.
     */
    constructor(private readonly consoleService: ConsoleService)
    {
    }

    /**
     * Subscribe to the display history observable.
     */
    public ngOnInit(): void
    {
        this.consoleService.displayHistory$
            .pipe(takeUntil(this.destroy$))
            .subscribe(history => {
                this.consoleHistory = history;
            });
    }

    /**
     * Clean up subscriptions created by this component.
     */
    public ngOnDestroy(): void
    {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Handle key presses in the console input.
     *
     * Enter executes the command; ArrowUp/ArrowDown navigates input history.
     *
     * @param event Keyboard event from the console input.
     */
    public onKeyDown(event: KeyboardEvent): void
    {
        switch (event.key)
        {
            case 'Enter':
            {
                const input = this.currentInput.trim();
                
                if (input)
                {
                    const canonical = this.getCanonicalRepresentation(input);
                    
                    if (canonical !== null)
                    {
                        this.currentInput = canonical;
                        this.consoleService.executeCommand(canonical);
                        this.currentInput = '';
                    }
                    else
                    {
                        this.consoleService.executeCommand(input);
                        this.currentInput = '';
                    }
                }
                break;
            }

            case 'ArrowUp':
            {
                event.preventDefault();
                const previousCommand = this.consoleService.navigateHistoryUp();
                
                if (previousCommand !== null)
                {
                    this.currentInput = previousCommand;
                }
                break;
            }

            case 'ArrowDown':
            {
                event.preventDefault();
                const nextCommand = this.consoleService.navigateHistoryDown();
                
                if (nextCommand !== null)
                {
                    this.currentInput = nextCommand;
                }
                break;
            }
        }
    }

    private getCanonicalRepresentation(input: string): string | null
    {
        const parsedLine = this.consoleService.parseLine(input);
        
        if (parsedLine !== null && !parsedLine.hasError)
        {
            return parsedLine.statement.toString();
        }
        
        return null;
    }
}
