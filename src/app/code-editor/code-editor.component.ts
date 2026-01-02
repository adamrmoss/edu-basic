import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-code-editor',
    imports: [ CommonModule ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent
{
    public lines: string[] = [''];
    public currentLine: number = 0;

    public getLineNumbers(): number[]
    {
        return Array.from({ length: this.lines.length }, (_, i) => i + 1);
    }

    public onTextAreaInput(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        this.lines = textarea.value.split('\n');
    }

    public onTextAreaScroll(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        const lineNumbers = document.querySelector('.line-numbers') as HTMLElement;
        
        if (lineNumbers)
        {
            lineNumbers.scrollTop = textarea.scrollTop;
        }
    }
}

