import { Program } from '@/lang/program';
import { ExecutionContext } from '@/lang/execution-context';
import { RuntimeExecution } from '@/lang/runtime-execution';
import { Graphics } from '@/lang/graphics';
import { Audio } from '@/lang/audio';
import { FileSystemService } from '@/app/disk/filesystem.service';

import { EduBasicType } from '@/lang/edu-basic-value';
import { BinaryExpression, BinaryOperator, BinaryOperatorCategory, LiteralExpression, VariableExpression } from '@/lang/expressions';
import { ProgramSyntaxAnalyzer } from '@/lang/program-syntax-analysis';
import { LetStatement } from '@/lang/statements/variables';
import { LabelStatement } from '@/lang/statements/control-flow/label-statement';
import { EndStatement, EndType } from '@/lang/statements/control-flow/end-statement';
import { IfStatement } from '@/lang/statements/control-flow/if-statement';
import { WhileStatement } from '@/lang/statements/control-flow/while-statement';
import { DoLoopStatement, DoLoopVariant } from '@/lang/statements/control-flow/do-loop-statement';
import { ForStatement } from '@/lang/statements/control-flow/for-statement';
import { LoopStatement } from '@/lang/statements/control-flow/loop-statement';
import { NextStatement } from '@/lang/statements/control-flow/next-statement';
import { WendStatement } from '@/lang/statements/control-flow/wend-statement';

describe('Core language coverage', () =>
{
    describe('Program', () =>
    {
        it('should return undefined for out-of-range getStatement', () =>
        {
            const program = new Program();
            program.appendLine(new LetStatement('noop%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 })));

            expect(program.getStatement(-1)).toBeUndefined();
            expect(program.getStatement(1)).toBeUndefined();
        });

        it('should update label indices on insert and delete', () =>
        {
            const program = new Program();
            program.appendLine(new LabelStatement('Start'));
            program.appendLine(new LetStatement('a%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 })));
            program.appendLine(new LabelStatement('Middle'));

            expect(program.getLabelIndex('START')).toBe(0);
            expect(program.getLabelIndex('middle')).toBe(2);

            program.insertLine(0, new LetStatement('inserted%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 })));

            expect(program.getLabelIndex('Start')).toBe(1);
            expect(program.getLabelIndex('Middle')).toBe(3);

            program.deleteLine(1);

            expect(program.hasLabel('start')).toBe(false);
            expect(program.getLabelIndex('Middle')).toBe(2);
        });

        it('should update label map on replaceLine', () =>
        {
            const program = new Program();
            program.appendLine(new LabelStatement('A'));
            program.appendLine(new LetStatement('b%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 })));

            expect(program.hasLabel('A')).toBe(true);

            program.replaceLine(0, new LetStatement('notALabel%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 })));
            expect(program.hasLabel('A')).toBe(false);

            program.replaceLine(1, new LabelStatement('NewLabel'));
            expect(program.getLabelIndex('newlabel')).toBe(1);
        });

        it('should clear statements and labels', () =>
        {
            const program = new Program();
            program.appendLine(new LabelStatement('A'));
            program.appendLine(new LetStatement('b%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 })));

            expect(program.getLineCount()).toBe(2);
            expect(program.hasLabel('A')).toBe(true);

            program.clear();

            expect(program.getLineCount()).toBe(0);
            expect(program.hasLabel('A')).toBe(false);
        });

        it('should rebuild label map from current statements', () =>
        {
            const program = new Program();
            program.appendLine(new LabelStatement('A'));
            program.appendLine(new LabelStatement('B'));

            program.clear();
            program.appendLine(new LetStatement('x%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 })));
            program.appendLine(new LabelStatement('C'));

            program.rebuildLabelMap();
            expect(program.getLabelIndex('C')).toBe(1);
        });
    });

    describe('ExecutionContext', () =>
    {
        it('should provide default values by variable sigil', () =>
        {
            const context = new ExecutionContext();

            expect(context.getVariable('i%')).toEqual({ type: EduBasicType.Integer, value: 0 });
            expect(context.getVariable('r#')).toEqual({ type: EduBasicType.Real, value: 0.0 });
            expect(context.getVariable('s$')).toEqual({ type: EduBasicType.String, value: '' });
            expect(context.getVariable('z&')).toEqual({ type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } });

            const arr = context.getVariable('a%[]');
            expect(arr.type).toBe(EduBasicType.Array);
            if (arr.type !== EduBasicType.Array)
            {
                throw new Error('Expected array');
            }
            expect(arr.elementType).toBe(EduBasicType.Integer);
            expect(arr.value).toEqual([]);
        });

        it('should scope local variables to stack frames', () =>
        {
            const context = new ExecutionContext();
            context.setVariable('x%', { type: EduBasicType.Integer, value: 1 }, false);

            context.pushStackFrame(123);
            context.setVariable('x%', { type: EduBasicType.Integer, value: 2 }, true);

            expect(context.getVariable('x%').value).toBe(2);
            expect(context.getStackDepth()).toBe(1);
            expect(context.getCurrentReturnAddress()).toBe(123);

            const popped = context.popStackFrame();
            expect(popped).toBe(123);
            expect(context.getVariable('x%').value).toBe(1);
        });

        it('should route BYREF bound parameter reads/writes to outer scope', () =>
        {
            const context = new ExecutionContext();
            context.setVariable('outer%', { type: EduBasicType.Integer, value: 10 }, false);

            const byRefBindings = new Map<string, string>();
            byRefBindings.set('P%'.toUpperCase(), 'outer%');

            context.pushStackFrame(0, byRefBindings);

            expect(context.getVariable('p%')).toEqual({ type: EduBasicType.Integer, value: 10 });

            context.setVariable('p%', { type: EduBasicType.Integer, value: 42 }, true);
            expect(context.getVariable('outer%')).toEqual({ type: EduBasicType.Integer, value: 42 });

            context.popStackFrame();
            expect(context.getVariable('outer%')).toEqual({ type: EduBasicType.Integer, value: 42 });
        });

        it('should track key state for INKEY$', () =>
        {
            const context = new ExecutionContext();
            expect(context.getInkey()).toBe('');

            context.setKeyDown('A');
            expect(context.getInkey()).toBe('A');

            context.setKeyUp('A');
            expect(context.getInkey()).toBe('');
        });
    });

    describe('RuntimeExecution', () =>
    {
        it('should call tab switch callback when requested', () =>
        {
            const program = new Program();
            const context = new ExecutionContext();
            const graphics = new Graphics();
            const audio = new Audio();
            const fileSystem = new FileSystemService();
            const runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem);

            const callback = jest.fn();
            runtime.setTabSwitchCallback(callback);
            runtime.requestTabSwitch('output');

            expect(callback).toHaveBeenCalledWith('output');
        });

        it('should delay execution while sleeping', () =>
        {
            const program = new Program();
            program.appendLine(new LetStatement(
                'touched%',
                new BinaryExpression(
                    new VariableExpression('touched%'),
                    BinaryOperator.Add,
                    new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                    BinaryOperatorCategory.Arithmetic
                )
            ));

            const context = new ExecutionContext();
            context.setProgramCounter(0);

            const graphics = new Graphics();
            const audio = new Audio();
            const fileSystem = new FileSystemService();
            const runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem);

            const nowSpy = jest.spyOn(Date, 'now');
            nowSpy
                .mockReturnValueOnce(1000)
                .mockReturnValueOnce(1200)
                .mockReturnValueOnce(1500);
            runtime.sleep(500);

            runtime.executeStep();
            expect(context.getVariable('touched%').value).toBe(0);
            expect(context.getProgramCounter()).toBe(0);

            runtime.executeStep();
            expect(context.getVariable('touched%').value).toBe(1);
        });

        it('should link IF/WHILE/DO/FOR using static syntax analysis', () =>
        {
            const program = new Program();

            const ifStmt = new IfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [], [], null);
            const endIf = new EndStatement(EndType.If);

            const whileStmt = new WhileStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), []);
            const wend = new WendStatement();

            const doStmt = new DoLoopStatement(DoLoopVariant.DoLoop, null, []);
            const loop = new LoopStatement();

            const forStmt = new ForStatement(
                'i%',
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                null,
                []
            );
            const next = new NextStatement(null);

            program.appendLine(ifStmt);     // 0
            program.appendLine(endIf);      // 1
            program.appendLine(whileStmt);  // 2
            program.appendLine(wend);       // 3
            program.appendLine(doStmt);     // 4
            program.appendLine(loop);       // 5
            program.appendLine(forStmt);    // 6
            program.appendLine(next);       // 7

            const analysis = new ProgramSyntaxAnalyzer().analyzeAndLink(program);
            expect(analysis.errors).toEqual([]);

            expect(ifStmt.endIfLine).toBe(1);
            expect(ifStmt.nextClauseLine).toBe(1);

            expect(whileStmt.wendLine).toBe(3);
            expect(doStmt.loopLine).toBe(5);
            expect(forStmt.nextLine).toBe(7);
        });
    });
});

