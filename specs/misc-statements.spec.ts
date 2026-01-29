import { EduBasicType } from '../src/lang/edu-basic-value';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { ExecutionResult } from '../src/lang/statements/statement';
import { UnparsableStatement } from '../src/lang/statements/unparsable-statement';
import { HelpStatement, SetOption, SetStatement, SleepStatement } from '../src/lang/statements/misc';
import { RuntimeExecution } from '../src/lang/runtime-execution';

import { createRuntimeFixture, MockConsoleService } from './statement-runtime-test-helpers';

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

        it('should format unknown options as SET', () =>
        {
            const stmt = new SetStatement(999 as any);
            expect(stmt.toString()).toBe('SET');
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

