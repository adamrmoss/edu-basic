import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LineError
{
    lineIndex: number;
    message: string;
}

@Component({
    selector: 'app-text-editor',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './text-editor.component.html',
    styleUrl: './text-editor.component.scss'
})
export class TextEditorComponent implements AfterViewInit, OnDestroy, OnChanges
{
    @ViewChild('codeTextarea', { static: false })
    public codeTextareaRef!: ElementRef<HTMLTextAreaElement>;

    @ViewChild('lineNumbersDiv', { static: false })
    public lineNumbersRef!: ElementRef<HTMLDivElement>;

    @Input()
    public lines: string[] = [''];

    @Input()
    public errorLines: Set<number> = new Set<number>();

    @Input()
    public errorMessages: Map<number, string> = new Map<number, string>();

    @Input()
    public placeholder: string = '';

    @Input()
    public readonly: boolean = false;

    @Output()
    public linesChange = new EventEmitter<string[]>();

    @Output()
    public lineSelectionChange = new EventEmitter<{ start: number; end: number }>();

    @Output()
    public keyDown = new EventEmitter<KeyboardEvent>();

    @Output()
    public blur = new EventEmitter<void>();

    public lineNumbers: number[] = [1];
    public selectedLineStart: number | null = null;
    public selectedLineEnd: number | null = null;
    public isDragging: boolean = false;

    private textareaElement: HTMLTextAreaElement | null = null;
    private lineNumbersElement: HTMLDivElement | null = null;
    private resizeHandler: (() => void) | null = null;
    private mouseMoveHandler: ((event: MouseEvent) => void) | null = null;
    private mouseUpHandler: ((event: MouseEvent) => void) | null = null;
    private mouseDownLineIndex: number | null = null;

    constructor(private readonly cdr: ChangeDetectorRef)
    {
    }

    public ngAfterViewInit(): void
    {
        this.textareaElement = this.codeTextareaRef?.nativeElement || null;
        this.lineNumbersElement = this.lineNumbersRef?.nativeElement || null;
        
        setTimeout(() => {
            this.updateLineNumbers();
            this.cdr.detectChanges();
        }, 0);
        
        this.resizeHandler = () => {
            this.updateLineNumbers();
        };
        
        this.mouseMoveHandler = (event: MouseEvent) => {
            this.onMouseMove(event);
        };
        
        this.mouseUpHandler = (event: MouseEvent) => {
            this.onMouseUp(event);
        };
        
        window.addEventListener('resize', this.resizeHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseup', this.mouseUpHandler);
    }

    public ngOnChanges(changes: SimpleChanges): void
    {
        if (changes['lines'])
        {
            if (this.textareaElement)
            {
                this.updateLineNumbers();
            }
            else
            {
                this.lineNumbers = this.lines.map((_, i) => i + 1);
            }
        }
    }

    public ngOnDestroy(): void
    {
        if (this.resizeHandler)
        {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        if (this.mouseMoveHandler)
        {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
        
        if (this.mouseUpHandler)
        {
            document.removeEventListener('mouseup', this.mouseUpHandler);
        }
    }

    public onTextAreaInput(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        const newLines = textarea.value.split('\n');
        this.lines = newLines;
        this.linesChange.emit(newLines);
        this.updateLineNumbers();
    }

    public onTextAreaScroll(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        
        if (this.lineNumbersElement)
        {
            this.lineNumbersElement.scrollTop = textarea.scrollTop;
        }
    }

    public onKeyDown(event: KeyboardEvent): void
    {
        this.keyDown.emit(event);
    }

    public onBlur(): void
    {
        this.blur.emit();
    }

    public onLineNumberMouseDown(event: MouseEvent, lineIndex: number): void
    {
        event.preventDefault();
        
        if (this.readonly)
        {
            return;
        }

        this.mouseDownLineIndex = lineIndex;
        this.isDragging = true;
        this.selectedLineStart = lineIndex;
        this.selectedLineEnd = lineIndex;
        this.selectLines(lineIndex, lineIndex);
    }

    public onLineNumberMouseEnter(event: MouseEvent, lineIndex: number): void
    {
        if (this.isDragging && this.mouseDownLineIndex !== null)
        {
            const start = Math.min(this.mouseDownLineIndex, lineIndex);
            const end = Math.max(this.mouseDownLineIndex, lineIndex);
            this.selectedLineStart = start;
            this.selectedLineEnd = end;
            this.selectLines(start, end);
        }
    }

    private onMouseMove(event: MouseEvent): void
    {
        if (!this.isDragging || !this.lineNumbersElement || this.mouseDownLineIndex === null)
        {
            return;
        }

        const rect = this.lineNumbersElement.getBoundingClientRect();
        let y = event.clientY - rect.top + this.lineNumbersElement.scrollTop;
        
        if (y < 0)
        {
            y = 0;
        }
        else if (y > this.lineNumbersElement.scrollHeight)
        {
            y = this.lineNumbersElement.scrollHeight;
        }

        const lineHeight = 20;
        const visualLineIndex = Math.floor(y / lineHeight);
        const actualLineIndex = this.getActualLineIndexFromVisual(visualLineIndex);

        if (actualLineIndex >= 0 && actualLineIndex < this.lines.length)
        {
            const start = Math.min(this.mouseDownLineIndex, actualLineIndex);
            const end = Math.max(this.mouseDownLineIndex, actualLineIndex);
            this.selectedLineStart = start;
            this.selectedLineEnd = end;
            this.selectLines(start, end);
        }
    }

    private getActualLineIndexFromVisual(visualLineIndex: number): number
    {
        if (visualLineIndex < 0 || visualLineIndex >= this.lineNumbers.length)
        {
            return -1;
        }

        for (let i = visualLineIndex; i >= 0; i--)
        {
            if (this.lineNumbers[i] > 0)
            {
                return this.lineNumbers[i] - 1;
            }
        }

        return -1;
    }

    private onMouseUp(event: MouseEvent): void
    {
        if (this.isDragging)
        {
            this.isDragging = false;
            this.mouseDownLineIndex = null;
        }
    }

    private selectLines(start: number, end: number): void
    {
        if (!this.textareaElement)
        {
            return;
        }

        const startPosition = this.getPositionFromLineIndex(start);
        const endPosition = this.getPositionFromLineIndex(end + 1);
        
        this.textareaElement.focus();
        this.textareaElement.setSelectionRange(startPosition, endPosition);
        
        this.lineSelectionChange.emit({ start, end });
    }

    private updateLineNumbers(): void
    {
        if (!this.textareaElement)
        {
            this.lineNumbers = this.lines.map((_, i) => i + 1);
            return;
        }

        const lineNumbers: number[] = [];
        const textarea = this.textareaElement;
        const style = window.getComputedStyle(textarea);
        const font = `${style.fontSize} ${style.fontFamily}`;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context)
        {
            this.lineNumbers = this.lines.map((_, i) => i + 1);
            return;
        }

        context.font = font;
        const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const textareaWidth = textarea.clientWidth - padding - 2;
        const charWidth = context.measureText('M').width;
        const charsPerLine = Math.floor(textareaWidth / charWidth);
        
        for (let i = 0; i < this.lines.length; i++)
        {
            const line = this.lines[i];
            const visualLines = Math.max(1, Math.ceil(line.length / charsPerLine));
            
            for (let j = 0; j < visualLines; j++)
            {
                if (j === 0)
                {
                    lineNumbers.push(i + 1);
                }
                else
                {
                    lineNumbers.push(-1);
                }
            }
        }

        this.lineNumbers = lineNumbers;
    }

    private getPositionFromLineIndex(lineIndex: number): number
    {
        let position = 0;
        
        for (let i = 0; i < lineIndex && i < this.lines.length; i++)
        {
            position += this.lines[i].length + 1;
        }
        
        return position;
    }

    public isLineError(lineIndex: number): boolean
    {
        return this.errorLines.has(lineIndex);
    }

    public getLineErrorMessage(lineIndex: number): string | undefined
    {
        return this.errorMessages.get(lineIndex);
    }

    public isLineSelected(lineIndex: number): boolean
    {
        if (this.selectedLineStart === null || this.selectedLineEnd === null)
        {
            return false;
        }

        return lineIndex >= this.selectedLineStart && lineIndex <= this.selectedLineEnd;
    }

    public getCode(): string
    {
        return this.lines.join('\n');
    }

    public setCode(code: string): void
    {
        this.lines = code.split('\n');
        this.linesChange.emit(this.lines);
        this.updateLineNumbers();
    }

    public getCursorLineIndex(): number
    {
        if (!this.textareaElement)
        {
            return 0;
        }

        const cursorPosition = this.textareaElement.selectionStart;
        return this.getLineIndexFromPosition(cursorPosition);
    }

    public setCursorPosition(position: number): void
    {
        if (this.textareaElement)
        {
            this.textareaElement.setSelectionRange(position, position);
        }
    }

    public getCursorPosition(): number
    {
        if (!this.textareaElement)
        {
            return 0;
        }

        return this.textareaElement.selectionStart;
    }

    private getLineIndexFromPosition(position: number): number
    {
        const code = this.getCode();
        const textBeforeCursor = code.substring(0, position);
        return textBeforeCursor.split('\n').length - 1;
    }
}
