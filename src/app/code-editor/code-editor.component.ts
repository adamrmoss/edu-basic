import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DiskService } from '../disk/disk.service';
import { InterpreterService, InterpreterState } from '../interpreter/interpreter.service';
import { ParserService } from '../interpreter/parser.service';
import { Program } from '../../lang/program';
import { ExecutionResult } from '../../lang/statements/statement';
import { TextEditorComponent } from '../text-editor/text-editor.component';

/**
 * Code editor UI component for authoring and running EduBASIC programs.
 *
 * Keeps the editor text in sync with `DiskService`, validates lines via `ParserService`,
 * and can run the current program using `InterpreterService`.
 */
@Component({
    selector: 'app-code-editor',
    standalone: true,
    imports: [ CommonModule, TextEditorComponent ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent implements OnInit, OnDestroy
{
    /**
     * Reference to the embedded text editor component.
     */
    @ViewChild('textEditor', { static: false })
    public textEditorRef!: TextEditorComponent;

    /**
     * Current editor contents, split into lines.
     */
    public lines: string[] = [''];

    /**
     * 0-based line indices that currently have parse errors.
     */
    public errorLines: Set<number> = new Set<number>();

    /**
     * Map of 0-based line indices to parse error messages.
     */
    public errorMessages: Map<number, string> = new Map<number, string>();

    private readonly destroy$ = new Subject<void>();

    /**
     * Create a new code editor component.
     *
     * @param diskService Disk service used for persisting program code.
     * @param interpreterService Interpreter service used to run programs.
     * @param parserService Parser service used for line validation and canonicalization.
     */
    constructor(
        private readonly diskService: DiskService,
        private readonly interpreterService: InterpreterService,
        private readonly parserService: ParserService
    )
    {
    }

    /**
     * Subscribe to program code changes from `DiskService`.
     */
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

    /**
     * Clean up subscriptions created by this component.
     */
    public ngOnDestroy(): void
    {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Handle editor text changes from the text editor component.
     *
     * Updates the disk program contents and re-validates all lines.
     *
     * @param lines Updated editor content, split into lines.
     */
    public onLinesChange(lines: string[]): void
    {
        this.lines = lines;
        const code = lines.join('\n');
        this.diskService.programCode = code;
        this.validateAndUpdateLines();
    }

    /**
     * Handle keydown events from the text editor.
     *
     * When the user presses Enter, the current line is canonicalized (if possible)
     * and the editor content is re-validated.
     *
     * @param event Keyboard event from the editor.
     */
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

    /**
     * Handle editor blur by canonicalizing the current line and re-validating.
     */
    public onBlur(): void
    {
        const lineIndex = this.textEditorRef.getCursorLineIndex();
        this.updateLineWithCanonical(lineIndex);
        this.validateAndUpdateLines();
    }

    /**
     * Parse and run the current program.
     *
     * Builds a `Program` from the current source text, resets the interpreter, and
     * schedules repeated single-step execution until completion or error.
     */
    public onRun(): void
    {
        const sourceCode = this.diskService.getProgramCodeFromFile();
        
        if (!sourceCode.trim())
        {
            return;
        }

        const lines = sourceCode.split('\n');

        try
        {
            this.interpreterService.reset();
            
            const program = this.interpreterService.getSharedProgram();
            program.clear();
            
            let lineIndex = 0;
            let hasStatements = false;

            for (let i = 0; i < lines.length; i++)
            {
                const line = lines[i].trim();
                
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
