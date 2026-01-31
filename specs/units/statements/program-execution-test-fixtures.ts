import { ExecutionContext } from '@/lang/execution-context';
import { Program } from '@/lang/program';
import { RuntimeExecution } from '@/lang/runtime-execution';
import { Audio } from '@/lang/audio';
import { FileSystemService } from '@/app/disk/filesystem.service';

import { EduBasicType } from '@/lang/edu-basic-value';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { LetStatement } from '@/lang/statements/variables';

import { TrackingGraphics } from '../../mocks';

export function createLetIntStatement(variableName: string, value: number): LetStatement
{
    return new LetStatement(variableName, new LiteralExpression({ type: EduBasicType.Integer, value }));
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

