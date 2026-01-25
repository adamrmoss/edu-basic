import { RuntimeExecution } from '../src/lang/runtime-execution';
import { Program } from '../src/lang/program';
import { ExecutionContext } from '../src/lang/execution-context';
import { Graphics } from '../src/lang/graphics';
import { Audio } from '../src/lang/audio';
import { FileSystemService } from '../src/app/files/filesystem.service';
import { IfStatement } from '../src/lang/statements/control-flow/if-statement';
import { WhileStatement } from '../src/lang/statements/control-flow/while-statement';
import { DoLoopStatement, DoLoopVariant } from '../src/lang/statements/control-flow/do-loop-statement';
import { EndStatement, EndType } from '../src/lang/statements/control-flow/end-statement';
import { WendStatement } from '../src/lang/statements/control-flow/wend-statement';
import { LoopStatement } from '../src/lang/statements/control-flow/loop-statement';
import { PrintStatement } from '../src/lang/statements/io/print-statement';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { EduBasicType, EduBasicValue } from '../src/lang/edu-basic-value';
import { ExecutionResult } from '../src/lang/statements/statement';

describe('Control Flow Execution', () =>
{
    let program: Program;
    let context: ExecutionContext;
    let graphics: Graphics;
    let audio: Audio;
    let fileSystem: FileSystemService;
    let runtime: RuntimeExecution;

    beforeEach(() =>
    {
        program = new Program();
        context = new ExecutionContext();
        graphics = new Graphics();
        audio = new Audio();
        fileSystem = new FileSystemService();
        runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem);
        context.setProgramCounter(0);
    });

    describe('IF Statement', () =>
    {
        it('should execute THEN branch when condition is true', () =>
        {
            const printStmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'true' })
            ]);
            const ifStmt = new IfStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                [printStmt],
                [],
                null
            );
            const endIfStmt = new EndStatement(EndType.If);

            program.appendLine(ifStmt);
            program.appendLine(endIfStmt);

            const result1 = runtime.executeStep();
            expect(result1).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(0);

            const result2 = runtime.executeStep();
            expect(result2).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(1);
        });

        it('should skip THEN branch when condition is false', () =>
        {
            const printStmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'true' })
            ]);
            const ifStmt = new IfStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                [printStmt],
                [],
                null
            );
            const endIfStmt = new EndStatement(EndType.If);

            program.appendLine(ifStmt);
            program.appendLine(endIfStmt);

            const result1 = runtime.executeStep();
            expect(result1).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(1);
        });

        it('should execute ELSE branch when condition is false', () =>
        {
            const printThen = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'then' })
            ]);
            const printElse = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'else' })
            ]);
            const ifStmt = new IfStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                [printThen],
                [],
                [printElse]
            );
            const endIfStmt = new EndStatement(EndType.If);

            program.appendLine(ifStmt);
            program.appendLine(endIfStmt);

            const result1 = runtime.executeStep();
            expect(result1).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(0);
        });
    });

    describe('WHILE Statement', () =>
    {
        it('should loop while condition is true', () =>
        {
            const counterVar = 'counter%';
            context.setVariable(counterVar, { type: EduBasicType.Integer, value: 0 });

            const incrementExpr = new LiteralExpression({ type: EduBasicType.Integer, value: 1 });
            const printStmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'loop' })
            ]);
            const whileStmt = new WhileStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                [printStmt]
            );
            const wendStmt = new WendStatement();

            program.appendLine(whileStmt);
            program.appendLine(wendStmt);

            const result1 = runtime.executeStep();
            expect(result1).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(0);

            const result2 = runtime.executeStep();
            expect(result2).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(0);
        });

        it('should exit loop when condition becomes false', () =>
        {
            const whileStmt = new WhileStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                []
            );
            const wendStmt = new WendStatement();

            program.appendLine(whileStmt);
            program.appendLine(wendStmt);

            const result1 = runtime.executeStep();
            expect(result1).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(1);
        });
    });

    describe('DO Loop Statement', () =>
    {
        it('should execute DO LOOP body', () =>
        {
            const printStmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'loop' })
            ]);
            const doStmt = new DoLoopStatement(
                DoLoopVariant.DoLoop,
                null,
                [printStmt]
            );
            const loopStmt = new LoopStatement();

            program.appendLine(doStmt);
            program.appendLine(loopStmt);

            const result1 = runtime.executeStep();
            expect(result1).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(0);

            const result2 = runtime.executeStep();
            expect(result2).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(0);
        });

        it('should execute DO WHILE when condition is true', () =>
        {
            const printStmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'loop' })
            ]);
            const doStmt = new DoLoopStatement(
                DoLoopVariant.DoWhile,
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                [printStmt]
            );
            const loopStmt = new LoopStatement();

            program.appendLine(doStmt);
            program.appendLine(loopStmt);

            const result1 = runtime.executeStep();
            expect(result1).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(0);
        });

        it('should skip DO WHILE when condition is false', () =>
        {
            const printStmt = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: 'loop' })
            ]);
            const doStmt = new DoLoopStatement(
                DoLoopVariant.DoWhile,
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                [printStmt]
            );
            const loopStmt = new LoopStatement();

            program.appendLine(doStmt);
            program.appendLine(loopStmt);

            const result1 = runtime.executeStep();
            expect(result1).toBe(ExecutionResult.Continue);
            expect(context.getProgramCounter()).toBe(1);
        });
    });

    describe('Program Counter Management', () =>
    {
        it('should increment program counter after each statement', () =>
        {
            const print1 = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: '1' })
            ]);
            const print2 = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: '2' })
            ]);

            program.appendLine(print1);
            program.appendLine(print2);

            expect(context.getProgramCounter()).toBe(0);

            runtime.executeStep();
            expect(context.getProgramCounter()).toBe(1);

            runtime.executeStep();
            expect(context.getProgramCounter()).toBe(2);
        });

        it('should handle GOTO correctly', () =>
        {
            const print1 = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: '1' })
            ]);
            const print2 = new PrintStatement([
                new LiteralExpression({ type: EduBasicType.String, value: '2' })
            ]);

            program.appendLine(print1);
            program.appendLine(print2);

            context.setProgramCounter(1);
            runtime.executeStep();
            expect(context.getProgramCounter()).toBe(2);
        });
    });
});

