import { ExecutionContext } from '@/lang/execution-context';
import { Program } from '@/lang/program';
import { RuntimeExecution } from '@/lang/runtime-execution';
import { Graphics } from '@/lang/graphics';
import { Audio } from '@/lang/audio';
import { FileSystemService } from '@/app/disk/filesystem.service';

import { EduBasicType } from '@/lang/edu-basic-value';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { VariableExpression } from '@/lang/expressions/special/variable-expression';

import { ExecutionResult } from '@/lang/statements/statement';
import { CallStatement } from '@/lang/statements/control-flow/call-statement';
import { EndStatement, EndType } from '@/lang/statements/control-flow/end-statement';
import { SubStatement } from '@/lang/statements/control-flow/sub-statement';
import { LetStatement, LocalStatement } from '@/lang/statements/variables';

describe('CALL/SUB statements (program execution)', () =>
{
    let context: ExecutionContext;
    let program: Program;
    let runtime: RuntimeExecution;
    let graphics: Graphics;
    let audio: Audio;
    let fileSystem: FileSystemService;

    beforeEach(() =>
    {
        context = new ExecutionContext();
        program = new Program();
        graphics = new Graphics();
        audio = new Audio();
        fileSystem = new FileSystemService();
        runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem);
        context.setProgramCounter(0);
    });

    it('should execute a SUB via CALL with BYREF and BYVAL parameters', () =>
    {
        context.setVariable('x%', { type: EduBasicType.Integer, value: 1 }, false);

        const call = new CallStatement('mysub', [
            new VariableExpression('x%'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 7 })
        ]);

        const afterCall = new LetStatement('after%', new LiteralExpression({ type: EduBasicType.Integer, value: 123 }));

        const sub = new SubStatement('MySub', [
            { name: 'p%', byRef: true },
            { name: 'q%', byRef: false }
        ], [
            new LetStatement('seen%', new VariableExpression('q%')),
            new LocalStatement('p%', new LiteralExpression({ type: EduBasicType.Integer, value: 99 })),
        ]);

        program.appendLine(call);       // 0
        program.appendLine(afterCall);  // 1
        program.appendLine(sub);        // 2 (definition, skipped in normal flow)
        program.appendLine(new LetStatement('seen%', new VariableExpression('q%'))); // 3 (sub body)
        program.appendLine(new LocalStatement('p%', new LiteralExpression({ type: EduBasicType.Integer, value: 99 }))); // 4 (sub body)
        program.appendLine(new EndStatement(EndType.Sub));            // 5 (sub body)

        // CALL executes and jumps to the first line after SUB.
        expect(runtime.executeStep()).toBe(ExecutionResult.Continue);
        expect(context.getProgramCounter()).toBe(3);

        // Execute sub body (COPYVAR + SET + END SUB).
        expect(runtime.executeStep()).toBe(ExecutionResult.Continue);
        expect(runtime.executeStep()).toBe(ExecutionResult.Continue);
        expect(runtime.executeStep()).toBe(ExecutionResult.Continue);

        // Return should land at the statement after CALL.
        expect(context.getProgramCounter()).toBe(1);

        // BYREF write should update outer x%.
        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 99 });

        // BYVAL should be visible inside SUB body and copied out.
        expect(context.getVariable('seen%')).toEqual({ type: EduBasicType.Integer, value: 7 });

        // After returning, q% should not exist globally.
        expect(context.getVariable('q%')).toEqual({ type: EduBasicType.Integer, value: 0 });

        runtime.executeStep();
        expect(context.getVariable('after%')).toEqual({ type: EduBasicType.Integer, value: 123 });
    });

    it('CALL should format toString with and without arguments', () =>
    {
        const noArgs = new CallStatement('S', []);
        expect(noArgs.toString()).toBe('CALL S');

        const withArgs = new CallStatement('S', [
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.String, value: 'hi' })
        ]);
        expect(withArgs.toString()).toBe('CALL S 1, "hi"');
    });

    it('should throw when SUB parameter count mismatches', () =>
    {
        const sub = new SubStatement('S', [{ name: 'p%', byRef: false }], []);
        program.appendLine(sub);
        program.appendLine(new EndStatement(EndType.Sub));

        const call = new CallStatement('S', []);
        expect(() =>
        {
            call.execute(context, graphics, audio, program, runtime);
        }).toThrow('SUB S expects 1 parameters, got 0');
    });

    it('should throw when BYREF argument is not a variable', () =>
    {
        const sub = new SubStatement('S', [{ name: 'p%', byRef: true }], []);
        program.appendLine(sub);
        program.appendLine(new EndStatement(EndType.Sub));

        const call = new CallStatement('S', [
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        ]);

        expect(() =>
        {
            call.execute(context, graphics, audio, program, runtime);
        }).toThrow('CALL: BYREF argument must be a variable');
    });

    it('should throw when SUB is not found', () =>
    {
        const call = new CallStatement('Missing', []);
        expect(() =>
        {
            call.execute(context, graphics, audio, program, runtime);
        }).toThrow('SUB Missing not found');
    });

    it('END SUB should behave like a return from subroutine', () =>
    {
        const endSub = new EndStatement(EndType.Sub);
        const status = endSub.execute(context, graphics, audio, program, runtime);
        expect(status.result).toBe(ExecutionResult.Return);
    });
});

