import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DiskService } from '../disk/disk.service';
import { InterpreterService, InterpreterState } from '../interpreter/interpreter.service';
import { ParserService, ParsedLine } from '../interpreter/parser.service';
import { Program } from '../../lang/program';
import { ExecutionResult } from '../../lang/statements/statement';

@Component({
    selector: 'app-code-editor',
    imports: [ CommonModule ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild('codeTextarea', { static: false })
    public codeTextareaRef!: ElementRef<HTMLTextAreaElement>;

    @ViewChild('lineNumbersDiv', { static: false })
    public lineNumbersRef!: ElementRef<HTMLDivElement>;

    public code: string = '';
    public lineNumbers: number[] = [];
    public errorLines: Set<number> = new Set<number>();

    private readonly destroy$ = new Subject<void>();
    private textareaElement: HTMLTextAreaElement | null = null;
    private lineNumbersElement: HTMLDivElement | null = null;
    private resizeHandler: (() => void) | null = null;

    constructor(
        private readonly diskService: DiskService,
        private readonly interpreterService: InterpreterService,
        private readonly parserService: ParserService
    )
    {
    }

    public ngOnInit(): void
    {
        this.diskService.programCode$
            .pipe(takeUntil(this.destroy$))
            .subscribe((code: string) => {
                this.code = code;
                this.updateLineNumbers();
            });
    }

    public ngAfterViewInit(): void
    {
        this.textareaElement = this.codeTextareaRef?.nativeElement || null;
        this.lineNumbersElement = this.lineNumbersRef?.nativeElement || null;
        this.updateLineNumbers();
        
        this.resizeHandler = () => {
            this.updateLineNumbers();
        };
        
        window.addEventListener('resize', this.resizeHandler);
    }

    public ngOnDestroy(): void
    {
        if (this.resizeHandler)
        {
            window.removeEventListener('resize', this.resizeHandler);
        }
        this.destroy$.next();
        this.destroy$.complete();
    }

    public onTextAreaInput(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        this.code = textarea.value;
        this.diskService.programCode = this.code;
        this.updateLineNumbers();
        this.validateAndUpdateLines();
    }

    public onTextAreaKeyDown(event: KeyboardEvent): void
    {
        if (event.key === 'Enter')
        {
            const textarea = event.target as HTMLTextAreaElement;
            const cursorPosition = textarea.selectionStart;
            const lineIndex = this.getLineIndexFromPosition(cursorPosition);
            
            setTimeout(() => {
                this.updateLineWithCanonical(lineIndex);
                this.validateAndUpdateLines();
            }, 0);
        }
    }

    public onTextAreaBlur(): void
    {
        if (this.textareaElement)
        {
            const cursorPosition = this.textareaElement.selectionStart;
            const lineIndex = this.getLineIndexFromPosition(cursorPosition);
            this.updateLineWithCanonical(lineIndex);
        }
        
        this.validateAndUpdateLines();
    }

    public onTextAreaScroll(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        
        if (this.lineNumbersElement)
        {
            this.lineNumbersElement.scrollTop = textarea.scrollTop;
        }
    }

    public onRun(): void
    {
        const sourceCode = this.code;
        
        if (!sourceCode.trim())
        {
            return;
        }

        try
        {
            this.interpreterService.reset();
            
            const program = this.interpreterService.getSharedProgram();
            program.clear();
            
            const lines = sourceCode.split('\n');
            let lineIndex = 0;
            let hasStatements = false;

            for (let i = 0; i < lines.length; i++)
            {
                const line = lines[i].trim();
                
                if (line.length === 0 || line.startsWith("'"))
                {
                    continue;
                }

                const parsed = this.parserService.parseLine(lineIndex, line);
                
                if (parsed.hasError)
                {
                    console.error(`Parse error on line ${i + 1}:`, parsed.errorMessage || 'Unknown parse error');
                    return;
                }

                program.appendLine(parsed.statement);
                lineIndex++;
                hasStatements = true;
            }

            if (!hasStatements)
            {
                return;
            }

            program.rebuildLabelMap();
            this.interpreterService.program = program;
            
            const context = this.interpreterService.getExecutionContext();
            context.setProgramCounter(0);
            
            const runtime = this.interpreterService.getRuntimeExecution();
            
            this.interpreterService.run();
            
            const executeProgram = () => {
                try
                {
                    if (this.interpreterService.state !== InterpreterState.Running)
                    {
                        return;
                    }

                    const result = runtime.executeStep();
                    
                    if (result === ExecutionResult.End)
                    {
                        this.interpreterService.stop();
                        return;
                    }

                    setTimeout(executeProgram, 10);
                }
                catch (error)
                {
                    console.error('Error executing step:', error);
                    this.interpreterService.stop();
                }
            };

            setTimeout(executeProgram, 10);
        }
        catch (error)
        {
            console.error('Error running program:', error);
            this.interpreterService.stop();
        }
    }

    private updateLineNumbers(): void
    {
        const lines = this.code.split('\n');
        
        if (!this.textareaElement)
        {
            this.lineNumbers = lines.map((_, i) => i + 1);
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
            this.lineNumbers = lines.map((_, i) => i + 1);
            return;
        }

        context.font = font;
        const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const textareaWidth = textarea.clientWidth - padding - 2;
        const charWidth = context.measureText('M').width;
        const charsPerLine = Math.floor(textareaWidth / charWidth);
        
        for (let i = 0; i < lines.length; i++)
        {
            const line = lines[i];
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

    private validateAndUpdateLines(): void
    {
        const lines = this.code.split('\n');
        const newErrorLines = new Set<number>();
        let lineIndex = 0;
        
        for (let i = 0; i < lines.length; i++)
        {
            const line = lines[i].trim();
            
            if (line.length === 0 || line.startsWith("'"))
            {
                continue;
            }
            
            try
            {
                const parsed = this.parserService.parseLine(lineIndex, line);
                
                if (parsed.hasError)
                {
                    newErrorLines.add(i);
                }
                
                lineIndex++;
            }
            catch (error)
            {
                newErrorLines.add(i);
            }
        }
        
        this.errorLines = newErrorLines;
    }

    private updateLineWithCanonical(lineIndex: number): void
    {
        const lines = this.code.split('\n');
        
        if (lineIndex < 0 || lineIndex >= lines.length)
        {
            return;
        }
        
        const originalLine = lines[lineIndex];
        const trimmedLine = originalLine.trim();
        
        if (trimmedLine.length === 0 || trimmedLine.startsWith("'"))
        {
            return;
        }
        
        const canonical = this.getCanonicalRepresentation(trimmedLine);
        
        if (canonical !== null && canonical !== trimmedLine)
        {
            const leadingWhitespace = originalLine.match(/^\s*/)?.[0] || '';
            lines[lineIndex] = leadingWhitespace + canonical;
            const newCode = lines.join('\n');
            this.code = newCode;
            this.diskService.programCode = newCode;
            
            if (this.textareaElement)
            {
                setTimeout(() => {
                    const newPosition = this.getPositionFromLineIndex(lineIndex + 1);
                    this.textareaElement?.setSelectionRange(newPosition, newPosition);
                }, 0);
            }
        }
    }

    private getCanonicalRepresentation(line: string): string | null
    {
        try
        {
            const parsed = this.parserService.parseLine(0, line);
            
            if (!parsed.hasError)
            {
                return parsed.statement.toString();
            }
        }
        catch (error)
        {
            // Ignore parse errors
        }
        
        return null;
    }

    private getLineIndexFromPosition(position: number): number
    {
        const textBeforeCursor = this.code.substring(0, position);
        return textBeforeCursor.split('\n').length - 1;
    }

    private getPositionFromLineIndex(lineIndex: number): number
    {
        const lines = this.code.split('\n');
        let position = 0;
        
        for (let i = 0; i < lineIndex && i < lines.length; i++)
        {
            position += lines[i].length + 1;
        }
        
        return position;
    }

    public isLineError(lineIndex: number): boolean
    {
        return this.errorLines.has(lineIndex);
    }
}
