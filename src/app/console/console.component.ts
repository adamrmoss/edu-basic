import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ConsoleService, ConsoleEntry } from './console.service';

@Component({
    selector: 'app-console',
    standalone: true,
    imports: [ CommonModule, FormsModule ],
    templateUrl: './console.component.html',
    styleUrl: './console.component.scss'
})
export class ConsoleComponent implements OnInit, OnDestroy
{
    public consoleHistory: ConsoleEntry[] = [];
    public currentInput: string = '';

    private readonly destroy$ = new Subject<void>();

    constructor(private readonly consoleService: ConsoleService)
    {
    }

    public ngOnInit(): void
    {
        this.consoleService.displayHistory$
            .pipe(takeUntil(this.destroy$))
            .subscribe(history => {
                this.consoleHistory = history;
            });
    }

    public ngOnDestroy(): void
    {
        this.destroy$.next();
        this.destroy$.complete();
    }

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
        try
        {
            const parsedLine = this.consoleService.parseLine(input);
            
            if (parsedLine && !parsedLine.hasError)
            {
                return parsedLine.statement.toString();
            }
        }
        catch (error)
        {
            // Ignore parse errors, return null to use original input
        }
        
        return null;
    }
}
