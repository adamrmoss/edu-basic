import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DiskService } from '../disk/disk.service';
import { InterpreterService, InterpreterState } from '../interpreter/interpreter.service';
import { ParserService } from '../interpreter/parser.service';
import { getCanonicalLine } from '../../lang/canonical-line';
import { Program } from '../../lang/program';
import { ProgramSyntaxAnalyzer } from '../../lang/program-syntax-analysis';
import { ExecutionResult } from '../../lang/statements/statement';
import { UnparsableStatement } from '../../lang/statements/unparsable-statement';
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

    /**
     * Whether the current editor content is executable (no static errors).
     */
    public isExecutable: boolean = false;

    private readonly syntaxAnalyzer = new ProgramSyntaxAnalyzer();
    private readonly destroy$ = new Subject<void>();
    private lastBuiltProgram: Program | null = null;
    private hasRunnableStatements: boolean = false;

    /** Last line index the cursor was on; used to canonicalize the line we leave when cursor moves (key or click). */
    private lastCursorLineIndex: number | undefined = undefined;

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
                if (this.interpreterService.isRunning)
                {
                    this.interpreterService.stop();
                }

                this.lines = code.split('\n');
                if (this.lines.length === 0)
                {
                    this.lines = [''];
                }

                this.validateAndUpdateLines();
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
     * Stops the running program if one is executing.
     *
     * @param lines Updated editor content, split into lines.
     */
    public onLinesChange(lines: string[]): void
    {
        if (this.interpreterService.isRunning)
        {
            this.interpreterService.stop();
        }

        this.lines = lines;
        const code = lines.join('\n');
        this.diskService.programCode = code;
        this.validateAndUpdateLines();
    }

    /**
     * Handle keydown events from the text editor.
     *
     * @param event Keyboard event from the editor.
     */
    public onKeyDown(event: KeyboardEvent): void
    {
        if (this.lastCursorLineIndex === undefined && this.textEditorRef)
        {
            this.lastCursorLineIndex = this.textEditorRef.getCursorLineIndex();
        }

        if (event.key === 'Enter')
        {
            const lineIndex = this.textEditorRef.getCursorLineIndex();

            // Defer so the browser inserts the newline first; then input/onLinesChange runs and we see the new empty line.
            setTimeout(() => {
                this.updateLineWithCanonical(lineIndex);
                this.insertCanonicalEmptyLine(lineIndex);
                this.validateAndUpdateLines();
                this.lastCursorLineIndex = this.textEditorRef.getCursorLineIndex();

                // Second tick: Angular has bound the updated lines to the textarea (which resets cursor). Set cursor after indent.
                setTimeout(() => this.setCursorToEndOfIndentOnLine(lineIndex + 1), 0);
            }, 0);
        }
        else
        {
            // Defer so we read the new cursor line after the key has moved it (e.g. Up/Down).
            setTimeout(() => this.handleCursorLineChange(), 0);
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

    /** Cursor moved to another line (e.g. from click); canonicalize the line we left. newLineIndex from click, or read from editor when from keyboard. */
    public onCursorLineChange(newLineIndex?: number): void
    {
        this.handleCursorLineChange(newLineIndex);
    }

    private handleCursorLineChange(newLineIndex?: number): void
    {
        if (!this.textEditorRef)
        {
            return;
        }

        const current = newLineIndex ?? this.textEditorRef.getCursorLineIndex();

        if (this.lastCursorLineIndex !== undefined && this.lastCursorLineIndex !== current)
        {
            this.updateLineWithCanonical(this.lastCursorLineIndex);
            this.validateAndUpdateLines();
        }

        this.lastCursorLineIndex = current;
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

        try
        {
            this.interpreterService.reset();

            const build = this.buildProgramFromSource(sourceCode);
            this.errorLines = build.errorLines;
            this.errorMessages = build.errorMessages;
            this.hasRunnableStatements = build.hasRunnableStatements;
            this.isExecutable = build.errorLines.size === 0 && build.hasRunnableStatements;

            if (!this.isExecutable)
            {
                return;
            }

            this.lastBuiltProgram = build.program;
            this.interpreterService.program = build.program;

            const context = this.interpreterService.getExecutionContext();
            context.setProgramCounter(0);

            const runtime = this.interpreterService.getRuntimeExecution();

            this.interpreterService.run();

            // Step loop: run one step, then schedule next after 10ms so UI stays responsive.
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
            this.interpreterService.stop();
        }
    }

    private validateAndUpdateLines(): void
    {
        const build = this.buildProgramFromLines(this.lines);

        this.errorLines = build.errorLines;
        this.errorMessages = build.errorMessages;
        this.lastBuiltProgram = build.program;
        this.hasRunnableStatements = build.hasRunnableStatements;
        this.isExecutable = build.errorLines.size === 0 && build.hasRunnableStatements;
    }

    public get canRun(): boolean
    {
        return this.isExecutable;
    }

    /**
     * Whether a program is currently running.
     */
    public get isRunning(): boolean
    {
        return this.interpreterService.isRunning;
    }

    /**
     * Label for the run/stop toolbar button.
     */
    public get runButtonLabel(): string
    {
        return this.isRunning ? 'Stop' : 'Run';
    }

    /**
     * Run the current program, or stop it if already running.
     */
    public onRunOrStop(): void
    {
        if (this.isRunning)
        {
            this.interpreterService.stop();
            return;
        }

        this.onRun();
    }

    /** Replace the line at lineIndex with its canonical form (block indent + keyword casing/spacing); skip empty and comment lines. */
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

        const canonical = this.getCanonicalRepresentation(lineIndex);

        if (canonical !== null && canonical !== originalLine)
        {
            this.lines[lineIndex] = canonical;
            const newCode = this.lines.join('\n');
            this.diskService.programCode = newCode;

            if (this.textEditorRef)
            {
                // Defer cursor move so the text editor has applied the new line content to the textarea.
                setTimeout(() => {
                    const newPosition = this.getPositionFromLineIndex(lineIndex + 1);
                    this.textEditorRef.setCursorPosition(newPosition);
                }, 0);
            }
        }
    }

    /** Replace the new line (after Enter) with canonical empty form: indent spaces only, via getCanonicalLine(level, null). */
    private insertCanonicalEmptyLine(afterLineIndex: number): void
    {
        const newLineIndex = afterLineIndex + 1;

        if (newLineIndex >= this.lines.length)
        {
            return;
        }

        const indentLevel = this.getIndentLevelForLine(newLineIndex);
        const canonicalEmpty = getCanonicalLine(indentLevel, null);

        this.lines[newLineIndex] = canonicalEmpty;
        this.diskService.programCode = this.lines.join('\n');
    }

    /** Place cursor at end of indent on the given line (so user types after the spaces). Run in second setTimeout after Enter so binding has updated textarea. */
    private setCursorToEndOfIndentOnLine(lineIndex: number): void
    {
        if (!this.textEditorRef || lineIndex < 0 || lineIndex >= this.lines.length)
        {
            return;
        }

        const startOfLine = this.getPositionFromLineIndex(lineIndex);
        const endOfIndent = startOfLine + this.lines[lineIndex].length;
        this.textEditorRef.setCursorPosition(endOfIndent);
    }

    /** Indent level for a line: parse all lines above with stateful parser and return currentIndentLevel (block structure). */
    private getIndentLevelForLine(lineIndex: number): number
    {
        this.parserService.clear();

        for (let i = 0; i < lineIndex; i++)
        {
            this.parserService.parseLine(i + 1, this.lines[i]);
        }

        return this.parserService.currentIndentLevel;
    }

    /** Full canonical line (indent + body) for the given line; closing and clause statements use display adjustment so they outdent. */
    private getCanonicalRepresentation(lineIndex: number): string | null
    {
        const indentLevel = this.getIndentLevelForLine(lineIndex);
        const trimmedLine = this.lines[lineIndex].trim();
        const parseResult = this.parserService.parseLineStateless(trimmedLine);

        if (!parseResult.success)
        {
            return null;
        }

        const statement = parseResult.value;
        const adjustment = statement.getDisplayIndentAdjustment();
        const effectiveLevel = adjustment < 0 ? indentLevel + adjustment : indentLevel;

        return getCanonicalLine(effectiveLevel, statement);
    }

    /** Character offset of the start of the given line (0-based) in the joined source string. */
    private getPositionFromLineIndex(lineIndex: number): number
    {
        let position = 0;

        for (let i = 0; i < lineIndex && i < this.lines.length; i++)
        {
            position += this.lines[i].length + 1;
        }

        return position;
    }

    private buildProgramFromSource(sourceCode: string): {
        program: Program;
        errorLines: Set<number>;
        errorMessages: Map<number, string>;
        hasRunnableStatements: boolean;
    }
    {
        const lines = sourceCode.split(/\r?\n/);
        return this.buildProgramFromLines(lines);
    }

    /** Parse all lines with stateful parser, build Program, run syntax analysis and link control flow; return program and error info. */
    private buildProgramFromLines(lines: string[]): {
        program: Program;
        errorLines: Set<number>;
        errorMessages: Map<number, string>;
        hasRunnableStatements: boolean;
    }
    {
        this.parserService.clear();

        const program = new Program();
        const errorLines = new Set<number>();
        const errorMessages = new Map<number, string>();
        let hasRunnableStatements = false;

        for (let i = 0; i < lines.length; i++)
        {
            const lineText = lines[i];
            const parseResult = this.parserService.parseLine(i + 1, lineText);

            if (!parseResult.success)
            {
                errorLines.add(i);
                errorMessages.set(i, parseResult.error || 'Parse error');
                program.appendLine(new UnparsableStatement(lineText, parseResult.error || 'Parse error'));
                continue;
            }

            const parsed = parseResult.value;
            program.appendLine(parsed.statement);

            if (parsed.hasError)
            {
                errorLines.add(i);
                errorMessages.set(i, parsed.errorMessage || 'Parse error');
            }
            else
            {
                const stmt = parsed.statement;
                if (!(stmt instanceof UnparsableStatement && stmt.errorMessage === 'Comment or empty line'))
                {
                    hasRunnableStatements = true;
                }
            }
        }

        const analysis = this.syntaxAnalyzer.analyzeAndLink(program);
        for (const error of analysis.errors)
        {
            errorLines.add(error.lineNumber);
            if (!errorMessages.has(error.lineNumber))
            {
                errorMessages.set(error.lineNumber, error.message);
            }
        }

        program.rebuildLabelMap();
        return { program, errorLines, errorMessages, hasRunnableStatements };
    }
}
