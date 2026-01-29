import { ExecutionContext } from '../src/lang/execution-context';
import { Program } from '../src/lang/program';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { Graphics } from '../src/lang/graphics';
import { Audio } from '../src/lang/audio';
import { FileSystemService } from '../src/app/disk/filesystem.service';

import { EduBasicType } from '../src/lang/edu-basic-value';
import { ExecutionResult, Statement, ExecutionStatus } from '../src/lang/statements/statement';

export class AssignIntStatement extends Statement
{
    public constructor(private readonly name: string, private readonly value: number)
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        context.setVariable(this.name, { type: EduBasicType.Integer, value: this.value }, false);
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `LET ${this.name} = ${this.value}`;
    }
}

export class MockConsoleService
{
    public printOutput = jest.fn();
}

export class TrackingGraphics extends Graphics
{
    public lineSpacingCalls: boolean[] = [];
    public textWrapCalls: boolean[] = [];

    public override setLineSpacing(enabled: boolean): void
    {
        this.lineSpacingCalls.push(enabled);
        super.setLineSpacing(enabled);
    }

    public override setTextWrap(enabled: boolean): void
    {
        this.textWrapCalls.push(enabled);
        super.setTextWrap(enabled);
    }
}

export class TrackingAudio extends Audio
{
    public mutedCalls: boolean[] = [];

    public override setMuted(muted: boolean): void
    {
        this.mutedCalls.push(muted);
        super.setMuted(muted);
    }
}

export interface RuntimeFixture
{
    context: ExecutionContext;
    program: Program;
    graphics: TrackingGraphics;
    audio: TrackingAudio;
    fileSystem: FileSystemService;
    runtime: RuntimeExecution;
}

export function createRuntimeFixture(): RuntimeFixture
{
    const context = new ExecutionContext();
    const program = new Program();
    const graphics = new TrackingGraphics();
    const audio = new TrackingAudio();
    const fileSystem = new FileSystemService();
    const runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem);
    context.setProgramCounter(0);

    return {
        context,
        program,
        graphics,
        audio,
        fileSystem,
        runtime,
    };
}

