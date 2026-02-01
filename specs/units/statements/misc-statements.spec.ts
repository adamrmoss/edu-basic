import { EduBasicType } from '@/lang/edu-basic-value';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { ExecutionResult } from '@/lang/statements/statement';
import { UnparsableStatement } from '@/lang/statements/unparsable-statement';
import { ConsoleStatement, HelpStatement, SetOption, SetStatement, SleepStatement } from '@/lang/statements/misc';
import { RuntimeExecution } from '@/lang/runtime-execution';

import { MockConsoleService, TrackingGraphics } from '../mocks';
import { createRuntimeFixture } from './program-execution-test-fixtures';

describe('Misc statements', () =>
{
    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    describe('UnparsableStatement', () =>
    {
        it('should no-op for comment/empty lines', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            const stmt = new UnparsableStatement('', 'Comment or empty line');
            const status = stmt.execute(context, graphics, audio, program, runtime);
            expect(status.result).toBe(ExecutionResult.Continue);
        });

        it('should throw for real parse errors', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            const stmt = new UnparsableStatement('BAD', 'Parse error');
            expect(() =>
            {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('Parse error');
        });
    });

    describe('SET', () =>
    {
        it('should delegate to Graphics/Audio', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            new SetStatement(SetOption.LineSpacingOn).execute(context, graphics, audio, program, runtime);
            new SetStatement(SetOption.TextWrapOff).execute(context, graphics, audio, program, runtime);
            new SetStatement(SetOption.AudioOff).execute(context, graphics, audio, program, runtime);

            expect(graphics.lineSpacingCalls).toEqual([true]);
            expect(graphics.textWrapCalls).toEqual([false]);
            expect(audio.mutedCalls).toEqual([true]);
        });

        it('should support all SET options', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            new SetStatement(SetOption.LineSpacingOff).execute(context, graphics, audio, program, runtime);
            new SetStatement(SetOption.TextWrapOn).execute(context, graphics, audio, program, runtime);
            new SetStatement(SetOption.AudioOn).execute(context, graphics, audio, program, runtime);

            expect(graphics.lineSpacingCalls).toEqual([false]);
            expect(graphics.textWrapCalls).toEqual([true]);
            expect(audio.mutedCalls).toEqual([false]);

            expect(new SetStatement(SetOption.LineSpacingOff).toString()).toBe('SET LINE SPACING OFF');
            expect(new SetStatement(SetOption.TextWrapOn).toString()).toBe('SET TEXT WRAP ON');
            expect(new SetStatement(SetOption.AudioOn).toString()).toBe('SET AUDIO ON');
        });

        it('should format unknown options as SET', () =>
        {
            const stmt = new SetStatement(999 as any);
            expect(stmt.toString()).toBe('SET');
        });

        it('should toggle text wrap and line spacing in Graphics behavior', () =>
        {
            const { context, program, audio, runtime } = createRuntimeFixture();
            const graphics = new TrackingGraphics();

            new SetStatement(SetOption.TextWrapOff).execute(context, graphics, audio, program, runtime);
            new SetStatement(SetOption.LineSpacingOn).execute(context, graphics, audio, program, runtime);

            graphics.setCursorPosition(0, 0);
            graphics.printText('X'.repeat(100));
            expect(graphics.newLineCalls).toBe(0);

            graphics.setCursorPosition(0, 0);
            graphics.newLine();
            expect(graphics.lastCursor?.row).toBe(2);
        });
    });

    describe('CONSOLE', () =>
    {
        it('should no-op when console is not available', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            const stmt = new ConsoleStatement(new LiteralExpression({ type: EduBasicType.String, value: 'hi' }));
            const status = stmt.execute(context, graphics, audio, program, runtime);
            expect(status.result).toBe(ExecutionResult.Continue);
        });

        it('should write to console when available', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            const consoleService = new MockConsoleService();
            const runtimeWithConsole = new RuntimeExecution(program, context, graphics, audio, fileSystem, consoleService as any);

            const stmt = new ConsoleStatement(new LiteralExpression({ type: EduBasicType.String, value: 'hi' }));
            stmt.execute(context, graphics, audio, program, runtimeWithConsole);
            expect(consoleService.printOutput).toHaveBeenCalledWith('hi');
        });
    });

    describe('SLEEP', () =>
    {
        it('should call runtime.sleep and validate types', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            const sleep = new SleepStatement(new LiteralExpression({ type: EduBasicType.Real, value: 10.5 }));
            const sleepSpy = jest.spyOn(runtime, 'sleep');
            sleep.execute(context, graphics, audio, program, runtime);
            expect(sleepSpy).toHaveBeenCalledWith(10);

            const bad = new SleepStatement(new LiteralExpression({ type: EduBasicType.String, value: 'x' }));
            expect(() =>
            {
                bad.execute(context, graphics, audio, program, runtime);
            }).toThrow('SLEEP: milliseconds must be a number');
        });
    });

    describe('HELP', () =>
    {
        it('should write to console when available', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            const consoleService = new MockConsoleService();
            const runtimeWithConsole = new RuntimeExecution(program, context, graphics, audio, fileSystem, consoleService as any);
            const help = new HelpStatement('PRINT');
            help.execute(context, graphics, audio, program, runtimeWithConsole);
            expect(consoleService.printOutput).toHaveBeenCalled();
        });

        it('should no-op when console is not available', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            const help = new HelpStatement('PRINT');
            const status = help.execute(context, graphics, audio, program, runtime);
            expect(status.result).toBe(ExecutionResult.Continue);
        });

        it('should report unknown keyword', () =>
        {
            const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            const consoleService = new MockConsoleService();
            const runtimeWithConsole = new RuntimeExecution(program, context, graphics, audio, fileSystem, consoleService as any);
            const help = new HelpStatement('THIS_DOES_NOT_EXIST');
            help.execute(context, graphics, audio, program, runtimeWithConsole);
            expect(consoleService.printOutput).toHaveBeenCalledWith(expect.stringContaining('No help available'));
        });
    });
});

