import * as fs from 'fs';
import * as path from 'path';

import { ExecutionContext } from '@/lang/execution-context';
import { Program } from '@/lang/program';
import { RuntimeExecution } from '@/lang/runtime-execution';
import { ExecutionResult } from '@/lang/statements/statement';
import { FileSystemService } from '@/app/disk/filesystem.service';
import { ExpressionParserService } from '@/app/interpreter/expression-parser.service';
import { ParserService } from '@/app/interpreter/parser';

import { MockConsoleService, TrackingAudio, TrackingGraphics } from '../mocks';

export interface BasProgramRunResult
{
    sourceCode: string;
    parseErrors: string[];

    context: ExecutionContext;
    program: Program;
    graphics: TrackingGraphics;
    audio: TrackingAudio;
    fileSystem: FileSystemService;
    consoleService: MockConsoleService;
    runtime: RuntimeExecution;
    tabSwitches: string[];

    stepsExecuted: number;
    ended: boolean;
}

export interface RunBasProgramOptions
{
    maxSteps?: number;
}

export class BasProgramTestRunner
{
    public static runFile(programFileName: string, options?: RunBasProgramOptions): BasProgramRunResult
    {
        const programsDir = path.resolve(__dirname, '../../programs');
        const programPath = this.resolveProgramPath(programsDir, programFileName);
        const sourceCode = fs.readFileSync(programPath, 'utf8');

        return this.runSource(sourceCode, options);
    }

    public static runSource(sourceCode: string, options?: RunBasProgramOptions): BasProgramRunResult
    {
        const maxSteps = options?.maxSteps ?? 10_000;

        const expressionParser = new ExpressionParserService();
        const parserService = new ParserService(expressionParser);
        parserService.clear();

        const program = new Program();
        const parseErrors: string[] = [];

        const lines = sourceCode.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++)
        {
            const lineText = lines[i];
            const parseLineResult = parserService.parseLine(i + 1, lineText);

            if (!parseLineResult.success)
            {
                parseErrors.push(parseLineResult.error || `Line ${i + 1}: Parse error`);
                continue;
            }

            const parsedLine = parseLineResult.value;
            program.appendLine(parsedLine.statement);

            if (parsedLine.hasError && parsedLine.errorMessage)
            {
                parseErrors.push(`Line ${i + 1}: ${parsedLine.errorMessage}`);
            }
        }

        const context = new ExecutionContext();
        context.setProgramCounter(0);

        const graphics = new TrackingGraphics();
        const audio = new TrackingAudio();
        const fileSystem = new FileSystemService();
        const consoleService = new MockConsoleService();
        const runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem, consoleService as any);
        const tabSwitches: string[] = [];
        runtime.setTabSwitchCallback((tabId: string) =>
        {
            tabSwitches.push(tabId);
        });

        let stepsExecuted = 0;
        let ended = false;

        for (; stepsExecuted < maxSteps; stepsExecuted++)
        {
            const result = runtime.executeStep();
            if (result === ExecutionResult.End)
            {
                ended = true;
                break;
            }
        }

        if (!ended)
        {
            throw new Error(`Program did not terminate within ${maxSteps} steps`);
        }

        return {
            sourceCode,
            parseErrors,

            context,
            program,
            graphics,
            audio,
            fileSystem,
            consoleService,
            runtime,
            tabSwitches,

            stepsExecuted,
            ended
        };
    }

    private static resolveProgramPath(programsDir: string, programFileName: string): string
    {
        const directPath = path.resolve(programsDir, programFileName);
        if (fs.existsSync(directPath))
        {
            return directPath;
        }

        const target = programFileName.toLowerCase();
        const entries = fs.readdirSync(programsDir);
        const match = entries.find(e => e.toLowerCase() === target);

        if (!match)
        {
            throw new Error(`Program file not found: ${programFileName}`);
        }

        return path.resolve(programsDir, match);
    }
}

