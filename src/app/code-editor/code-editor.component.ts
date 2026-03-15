import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Subject, takeUntil } from 'rxjs';
import { LunaModalService } from 'ng-luna';
import { ConsoleService } from '../console/console.service';
import { DiskService } from '../disk/disk.service';
import { AudioService } from '../interpreter/audio.service';
import { InterpreterService, InterpreterState } from '../interpreter/interpreter.service';
import { ParserService } from '../interpreter/parser.service';
import { TabSwitchService } from '../tab-switch.service';
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
     * @param audioService Audio service; used to reset audio on music-related errors.
     * @param consoleService Console service used to print runtime errors.
     * @param diskService Disk service used for persisting program code.
     * @param interpreterService Interpreter service used to run programs.
     * @param parserService Parser service used for line validation and canonicalization.
     * @param tabSwitchService Tab switch service used to switch to console on error.
     * @param modalService Modal service for input prompts.
     */
    constructor(
        private readonly audioService: AudioService,
        private readonly consoleService: ConsoleService,
        private readonly diskService: DiskService,
        private readonly interpreterService: InterpreterService,
        private readonly parserService: ParserService,
        private readonly tabSwitchService: TabSwitchService,
        private readonly modalService: LunaModalService
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
                const currentCode = this.lines.join('\n');
                if (code === currentCode)
                {
                    return;
                }

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
            event.preventDefault();

            const lineIndex = this.textEditorRef.getCursorLineIndex();
            const cursorAtStartOfLine =
                this.textEditorRef.getCursorPosition() === this.getPositionFromLineIndex(lineIndex);

            if (cursorAtStartOfLine)
            {
                this.insertNewLineBefore(lineIndex);
                this.validateAndUpdateLines();
                this.lastCursorLineIndex = lineIndex;

                setTimeout(() => this.setCursorToEndOfIndentOnLine(lineIndex), 0);
            }
            else
            {
                this.updateLineWithCanonical(lineIndex, true);
                this.insertNewLineAfter(lineIndex);
                this.validateAndUpdateLines();
                this.lastCursorLineIndex = lineIndex + 1;

                setTimeout(() => this.setCursorToEndOfIndentOnLine(lineIndex + 1), 0);
            }
        }
        else
        {
            // Defer so we read the new cursor line after the key has moved it (e.g. Up/Down).
            setTimeout(() => this.handleCursorLineChange(), 0);
        }
    }

    /**
     * Handle editor blur by canonicalizing all lines and re-validating.
     */
    public onBlur(): void
    {
        this.canonicalizeAllLines();
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
            this.canonicalizeAllLines();

            setTimeout(() => {
                if (this.textEditorRef && current >= 0 && current < this.lines.length)
                {
                    const position = this.getPositionFromLineIndex(current);
                    this.textEditorRef.setCursorPosition(position);
                }
            }, 0);
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

            const executeProgram = async (): Promise<void> => {
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

                    if (result === ExecutionResult.WaitingForInput)
                    {
                        const req = runtime.getPendingInputRequest();
                        const modalResult = await firstValueFrom(
                            this.modalService.prompt(req?.message ?? '', {
                                title: 'Input',
                                promptDefaultValue: req?.default ?? ''
                            })
                        );

                        if (modalResult.button === 'ok')
                        {
                            runtime.setPendingInput(modalResult.promptValue ?? '');
                        }
                        else
                        {
                            runtime.setPendingInput('');
                        }

                        setTimeout(() => executeProgram(), 10);
                        return;
                    }

                    setTimeout(() => executeProgram(), 10);
                }
                catch (error)
                {
                    const message = error instanceof Error ? error.message : String(error);
                    this.consoleService.printError(message);
                    this.tabSwitchService.requestTabSwitch('console');
                    if (this.isMusicRelatedError(message))
                    {
                        this.audioService.getAudio().stop();
                    }
                    this.interpreterService.stop();
                }
            };

            setTimeout(() => executeProgram(), 10);
        }
        catch (error)
        {
            const message = error instanceof Error ? error.message : String(error);
            this.consoleService.printError(message);
            this.tabSwitchService.requestTabSwitch('console');
            if (this.isMusicRelatedError(message))
            {
                this.audioService.getAudio().stop();
            }
            this.interpreterService.stop();
        }
    }

    private isMusicRelatedError(message: string): boolean
    {
        return /music/i.test(message);
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
    private updateLineWithCanonical(lineIndex: number, skipCursorMove: boolean = false): void
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

            if (this.textEditorRef && !skipCursorMove)
            {
                setTimeout(() => {
                    const newPosition = this.getPositionFromLineIndex(lineIndex + 1);
                    this.textEditorRef.setCursorPosition(newPosition);
                }, 0);
            }
        }
    }

    /** Canonicalize every line in the program (without moving the cursor). */
    private canonicalizeAllLines(): void
    {
        for (let i = 0; i < this.lines.length; i++)
        {
            this.updateLineWithCanonical(i, true);
        }

        this.diskService.programCode = this.lines.join('\n');
        this.validateAndUpdateLines();
    }

    /** Insert a new canonical empty line before the given line index (same indent as that line). */
    private insertNewLineBefore(lineIndex: number): void
    {
        const indentLevel = this.getIndentLevelForLine(lineIndex);
        const canonicalEmpty = getCanonicalLine(indentLevel, null);

        this.lines.splice(lineIndex, 0, canonicalEmpty);
        this.diskService.programCode = this.lines.join('\n');
    }

    /** Insert a new canonical empty line after the given line index (same indent as next logical line). */
    private insertNewLineAfter(afterLineIndex: number): void
    {
        const indentLevel = this.getIndentLevelForLine(afterLineIndex + 1);
        const canonicalEmpty = getCanonicalLine(indentLevel, null);

        this.lines.splice(afterLineIndex + 1, 0, canonicalEmpty);
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
