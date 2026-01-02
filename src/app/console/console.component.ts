import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-console',
    imports: [ CommonModule, FormsModule ],
    templateUrl: './console.component.html',
    styleUrl: './console.component.scss'
})
export class ConsoleComponent
{
    public consoleHistory: string[] = [];
    public currentInput: string = '';

    public onKeyDown(event: KeyboardEvent): void
    {
        if (event.key === 'Enter')
        {
            this.executeCommand(this.currentInput);
            this.currentInput = '';
        }
    }

    private executeCommand(command: string): void
    {
        if (command.trim())
        {
            this.consoleHistory.push(`> ${command}`);
        }
    }

    public printError(message: string): void
    {
        this.consoleHistory.push(`ERROR: ${message}`);
    }

    public printOutput(message: string): void
    {
        this.consoleHistory.push(message);
    }
}
