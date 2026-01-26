import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DiskService } from '../disk/disk.service';
import { InterpreterService, InterpreterState } from '../interpreter/interpreter.service';
import { ParserService } from '../interpreter/parser';
import { Program } from '../../lang/program';
import { ExecutionResult } from '../../lang/statements/statement';
import { TextEditorComponent } from '../text-editor/text-editor.component';

@Component({
    selector: 'app-code-editor',
    standalone: true,
    imports: [ CommonModule, TextEditorComponent ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent implements OnInit, OnDestroy
{
    @ViewChild('textEditor', { static: false })
    public textEditorRef!: TextEditorComponent;

    public lines: string[] = [''];
    public errorLines: Set<number> = new Set<number>();
    public errorMessages: Map<number, string> = new Map<number, string>();

    private readonly destroy$ = new Subject<void>();

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

    public onLinesChange(lines: string[]): void
    {
        this.lines = lines;
        const code = lines.join('\n');
        this.diskService.programCode = code;
        this.validateAndUpdateLines();
    }

    public onKeyDown(event: KeyboardEvent): void
    {
        if (event.key === 'Enter')
        {
            const lineIndex = this.textEditorRef.getCursorLineIndex();
            
            setTimeout(() => {
                this.updateLineWithCanonical(lineIndex);
                this.validateAndUpdateLines();
            }, 0);
        }
    }

    public onBlur(): void
    {
        const lineIndex = this.textEditorRef.getCursorLineIndex();
        this.updateLineWithCanonical(lineIndex);
        this.validateAndUpdateLines();
    }

    public onRun(): void
    {
        const sourceCode = this.lines.join('\n');
        
        if (!sourceCode.trim())
        {
            return;
        }

        try
        {
            this.interpreterService.reset();
            
            const program = this.interpreterService.getSharedProgram();
            program.clear();
            
            let lineIndex = 0;
            let hasStatements = false;

            for (let i = 0; i < this.lines.length; i++)
            {
                const line = this.lines[i].trim();
                
                if (line.length === 0 || line.startsWith("'"))
                {
                    continue;
                }

                const parseResult = this.parserService.parseLine(lineIndex, line);
                
                if (!parseResult.success)
                {
                    console.error(`Parse error on line ${i + 1}:`, parseResult.error || 'Unable to parse line');
                    return;
                }
                
                const parsed = parseResult.value;
                
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

    private validateAndUpdateLines(): void
    {
        const newErrorLines = new Set<number>();
        const newErrorMessages = new Map<number, string>();
        let lineIndex = 0;
        
        for (let i = 0; i < this.lines.length; i++)
        {
            const line = this.lines[i].trim();
            
            if (line.length === 0 || line.startsWith("'"))
            {
                continue;
            }
            
            const parseResult = this.parserService.parseLine(lineIndex, line);
            
            if (!parseResult.success)
            {
                newErrorLines.add(i);
                newErrorMessages.set(i, parseResult.error || 'Parse error');
            }
            else if (parseResult.value.hasError)
            {
                newErrorLines.add(i);
                newErrorMessages.set(i, parseResult.value.errorMessage || 'Parse error');
            }
            
            lineIndex++;
        }
        
        this.errorLines = newErrorLines;
        this.errorMessages = newErrorMessages;
    }

    private updateLineWithCanonical(lineIndex: number): void
    {
        if (lineIndex < 0 || lineIndex >= this.lines.length)
        {
            return;
        }
        
        const originalLine = this.lines[lineIndex];
        const trimmedLine = originalLine.trim();
        
        if (trimmedLine.length === 0 || trimmedLine.startsWith("'"))
        {
            return;
        }
        
        const canonical = this.getCanonicalRepresentation(trimmedLine);
        
        if (canonical !== null && canonical !== trimmedLine)
        {
            const leadingWhitespace = originalLine.match(/^\s*/)?.[0] || '';
            this.lines[lineIndex] = leadingWhitespace + canonical;
            const newCode = this.lines.join('\n');
            this.diskService.programCode = newCode;
            
            if (this.textEditorRef)
            {
                setTimeout(() => {
                    const newPosition = this.getPositionFromLineIndex(lineIndex + 1);
                    this.textEditorRef.setCursorPosition(newPosition);
                }, 0);
            }
        }
    }

    private getCanonicalRepresentation(line: string): string | null
    {
        const parseResult = this.parserService.parseLine(0, line);
        
        if (parseResult.success && !parseResult.value.hasError)
        {
            return parseResult.value.statement.toString();
        }
        
        return null;
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
}
