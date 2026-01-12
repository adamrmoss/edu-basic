import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DiskService } from '../disk.service';

@Component({
    selector: 'app-code-editor',
    imports: [ CommonModule ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent implements OnInit, OnDestroy
{
    public lines: string[] = [''];
    public currentLine: number = 0;

    private readonly destroy$ = new Subject<void>();

    constructor(private readonly diskService: DiskService)
    {
    }

    public ngOnInit(): void
    {
        this.diskService.programCode$
            .pipe(takeUntil(this.destroy$))
            .subscribe(code => {
                this.lines = code.split('\n');
                
                if (this.lines.length === 0)
                {
                    this.lines = [''];
                }
            });
    }

    public ngOnDestroy(): void
    {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public getLineNumbers(): number[]
    {
        return Array.from({ length: this.lines.length }, (_, i) => i + 1);
    }

    public onTextAreaInput(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        this.lines = textarea.value.split('\n');
        this.diskService.setProgramCode(textarea.value);
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

