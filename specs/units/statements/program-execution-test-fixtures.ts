import { ExecutionContext } from '../../../src/lang/execution-context';
import { Program } from '../../../src/lang/program';
import { RuntimeExecution } from '../../../src/lang/runtime-execution';
import { Graphics } from '../../../src/lang/graphics';
import { Audio } from '../../../src/lang/audio';
import { FileSystemService } from '../../../src/app/disk/filesystem.service';

import { EduBasicType } from '../../../src/lang/edu-basic-value';
import { LiteralExpression } from '../../../src/lang/expressions/literal-expression';
import { LetStatement } from '../../../src/lang/statements/variables';

export function createLetIntStatement(variableName: string, value: number): LetStatement
{
    return new LetStatement(variableName, new LiteralExpression({ type: EduBasicType.Integer, value }));
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

