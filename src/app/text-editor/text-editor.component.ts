import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * A single line parse/validation error for the text editor.
 */
export interface LineError
{
    /**
     * 0-based line index.
     */
    lineIndex: number;

    /**
     * Human-readable error message.
     */
    message: string;
}

/**
 * Text editor UI component used for program and file editing.
 *
 * Provides line numbering, error highlighting, line selection via gutter drag,
 * and cursor position helpers used by parent components.
 */
@Component({
    selector: 'app-text-editor',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './text-editor.component.html',
    styleUrl: './text-editor.component.scss'
})
export class TextEditorComponent implements AfterViewInit, OnDestroy, OnChanges
{
    /**
     * Reference to the underlying textarea element.
     */
    @ViewChild('codeTextarea', { static: false })
    public codeTextareaRef!: ElementRef<HTMLTextAreaElement>;

    /**
     * Reference to the code overlay element (used for per-line styling).
     */
    @ViewChild('codeOverlay', { static: false })
    public codeOverlayRef!: ElementRef<HTMLPreElement>;

    /**
     * Reference to the line-numbers gutter element.
     */
    @ViewChild('lineNumbersDiv', { static: false })
    public lineNumbersRef!: ElementRef<HTMLDivElement>;

    /**
     * Current editor contents, split into lines.
     */
    @Input()
    public lines: string[] = [''];

    /**
     * 0-based line indices that are currently considered errors.
     */
    @Input()
    public errorLines: Set<number> = new Set<number>();

    /**
     * Map of 0-based line indices to error messages.
     */
    @Input()
    public errorMessages: Map<number, string> = new Map<number, string>();

    /**
     * Placeholder text shown when the editor is empty.
     */
    @Input()
    public placeholder: string = '';

    /**
     * Whether the editor is read-only.
     */
    @Input()
    public readonly: boolean = false;

    /**
     * Emits whenever the editor content lines change.
     */
    @Output()
    public linesChange = new EventEmitter<string[]>();

    /**
     * Emits whenever the current selected line range changes.
     */
    @Output()
    public lineSelectionChange = new EventEmitter<{ start: number; end: number }>();

    /**
     * Emits keydown events from the textarea.
     */
    @Output()
    public keyDown = new EventEmitter<KeyboardEvent>();

    /**
     * Emits when the textarea loses focus.
     */
    @Output()
    public blur = new EventEmitter<void>();

    /**
     * Emits the new 0-based cursor line index when the cursor moves to a different line (e.g. after click in textarea).
     */
    @Output()
    public cursorLineChange = new EventEmitter<number>();

    /**
     * Rendered line numbers including wrapped visual lines (wrapped lines use -1).
     */
    public lineNumbers: number[] = [1];

    /**
     * Rendered overlay HTML for styled line display.
     */
    public overlayHtml: SafeHtml = '';

    /**
     * Start of the selected line range (0-based), if any.
     */
    public selectedLineStart: number | null = null;

    /**
     * End of the selected line range (0-based), if any.
     */
    public selectedLineEnd: number | null = null;

    /**
     * Whether the user is currently dragging to select lines in the gutter.
     */
    public isDragging: boolean = false;

    private textareaElement: HTMLTextAreaElement | null = null;
    private lineNumbersElement: HTMLDivElement | null = null;
    private overlayElement: HTMLPreElement | null = null;
    private resizeHandler: (() => void) | null = null;
    private mouseMoveHandler: ((event: MouseEvent) => void) | null = null;
    private mouseUpHandler: ((event: MouseEvent) => void) | null = null;
    private mouseDownLineIndex: number | null = null;

    /**
     * Create a new text editor component.
     *
     * @param cdr Change detector used to refresh line number rendering after view init.
     */
    constructor(
        private readonly cdr: ChangeDetectorRef,
        private readonly sanitizer: DomSanitizer
    )
    {
    }

    /**
     * Initialize DOM references and attach global event handlers.
     */
    public ngAfterViewInit(): void
    {
        this.textareaElement = this.codeTextareaRef?.nativeElement || null;
        this.lineNumbersElement = this.lineNumbersRef?.nativeElement || null;
        this.overlayElement = this.codeOverlayRef?.nativeElement || null;
        
        setTimeout(() => {
            this.updateLineNumbers();
            this.updateOverlayHtml();
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

    /**
     * Respond to input changes by updating line number rendering.
     *
     * @param changes Angular change set.
     */
    public ngOnChanges(changes: SimpleChanges): void
    {
        if (changes['lines'] || changes['errorLines'])
        {
            if (this.textareaElement)
            {
                this.updateLineNumbers();
            }
            else
            {
                this.lineNumbers = this.lines.map((_, i) => i + 1);
            }

            this.updateOverlayHtml();
        }
    }

    /**
     * Detach global event handlers.
     */
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

    /**
     * Handle textarea input by updating `lines` and emitting `linesChange`.
     *
     * @param event Input event from the textarea.
     */
    public onTextAreaInput(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        const newLines = textarea.value.split('\n');
        this.lines = newLines;
        this.linesChange.emit(newLines);
        this.updateLineNumbers();
        this.updateOverlayHtml();
    }

    /**
     * Keep the line-number gutter scrolled in sync with the textarea.
     *
     * @param event Scroll event from the textarea.
     */
    public onTextAreaScroll(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        
        if (this.lineNumbersElement)
        {
            this.lineNumbersElement.scrollTop = textarea.scrollTop;
        }

        if (this.overlayElement)
        {
            this.overlayElement.scrollTop = textarea.scrollTop;
        }
    }

    /**
     * Emit keydown events to parent components.
     *
     * @param event Keyboard event from the textarea.
     */
    public onKeyDown(event: KeyboardEvent): void
    {
        this.keyDown.emit(event);
    }

    /**
     * Emit blur events to parent components.
     */
    public onBlur(): void
    {
        this.blur.emit();
    }

    /**
     * Emit cursor line change when the user clicks in the textarea (cursor may have moved to a different line).
     */
    public onTextAreaMouseUp(): void
    {
        this.cursorLineChange.emit(this.getCursorLineIndex());
    }

    /**
     * Begin selecting lines by clicking the line-number gutter.
     *
     * @param event Mouse event.
     * @param lineIndex 0-based line index.
     */
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

    /**
     * Extend selection while dragging over the line-number gutter.
     *
     * @param event Mouse event.
     * @param lineIndex 0-based line index under the cursor.
     */
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

    private updateOverlayHtml(): void
    {
        const parts: string[] = [];

        for (let i = 0; i < this.lines.length; i++)
        {
            const line = this.lines[i] ?? '';
            const escaped = this.escapeHtml(line);
            const errorClass = this.errorLines.has(i) ? ' code-line-error' : '';
            parts.push(`<span class="code-line${errorClass}">${escaped}</span><br/>`);
        }

        this.overlayHtml = this.sanitizer.bypassSecurityTrustHtml(parts.join(''));
    }

    private escapeHtml(text: string): string
    {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Determine whether a given line index is marked as an error.
     *
     * @param lineIndex 0-based line index.
     */
    public isLineError(lineIndex: number): boolean
    {
        return this.errorLines.has(lineIndex);
    }

    /**
     * Get the error message for a line, if present.
     *
     * @param lineIndex 0-based line index.
     */
    public getLineErrorMessage(lineIndex: number): string | undefined
    {
        return this.errorMessages.get(lineIndex);
    }

    /**
     * Determine whether a line index is within the current selection.
     *
     * @param lineIndex 0-based line index.
     */
    public isLineSelected(lineIndex: number): boolean
    {
        if (this.selectedLineStart === null || this.selectedLineEnd === null)
        {
            return false;
        }

        return lineIndex >= this.selectedLineStart && lineIndex <= this.selectedLineEnd;
    }

    /**
     * Get the current editor contents as a single string.
     */
    public getCode(): string
    {
        return this.lines.join('\n');
    }

    /**
     * Replace editor contents with the provided code.
     *
     * @param code Full source text.
     */
    public setCode(code: string): void
    {
        this.lines = code.split('\n');
        this.linesChange.emit(this.lines);
        this.updateLineNumbers();
        this.updateOverlayHtml();
    }

    /**
     * Get the 0-based line index containing the cursor.
     */
    public getCursorLineIndex(): number
    {
        if (!this.textareaElement)
        {
            return 0;
        }

        const cursorPosition = this.textareaElement.selectionStart;
        return this.getLineIndexFromPosition(cursorPosition);
    }

    /**
     * Set the cursor position in the textarea.
     *
     * @param position Character offset.
     */
    public setCursorPosition(position: number): void
    {
        if (this.textareaElement)
        {
            this.textareaElement.setSelectionRange(position, position);
        }
    }

    /**
     * Get the current cursor position in the textarea.
     */
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
