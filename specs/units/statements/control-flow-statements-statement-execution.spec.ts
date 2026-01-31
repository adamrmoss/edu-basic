import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';
import { LiteralExpression } from '@/lang/expressions/literal-expression';
import { Program } from '@/lang/program';
import { ExecutionResult, Statement, ExecutionStatus } from '@/lang/statements/statement';
import { LetStatement } from '@/lang/statements/variables';
import { Audio } from '@/lang/audio';
import { Graphics } from '@/lang/graphics';
import {
    ContinueStatement,
    ContinueTarget,
    DoLoopStatement,
    DoLoopVariant,
    ElseStatement,
    ElseIfStatement,
    EndStatement,
    EndType,
    ExitStatement,
    ExitTarget,
    GosubStatement,
    GotoStatement,
    ForStatement,
    IfStatement,
    LoopStatement,
    NextStatement,
    SelectCaseStatement,
    CaseMatchType,
    SubStatement,
    TryStatement,
    ThrowStatement,
    UendStatement,
    UnlessStatement,
    UntilStatement,
    WendStatement,
    WhileStatement
} from '@/lang/statements/control-flow';

describe('Control-flow statements (unit)', () =>
{
    it('GotoStatement should throw when label is missing', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = { getLabelIndex: () => undefined } as any;
        const runtime = {} as any;

        const stmt = new GotoStatement('missing');
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow(`Label 'missing' not found`);
    });

    it('GotoStatement should return a goto target when label exists', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = { getLabelIndex: () => 7 } as any;
        const runtime = {} as any;

        const stmt = new GotoStatement('start');
        const status = stmt.execute(context, graphics, audio, program, runtime);
        expect(status.result).toBe(ExecutionResult.Goto);
        expect(status.gotoTarget).toBe(7);
    });

    it('GosubStatement should throw when label is missing', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = { getLabelIndex: () => undefined } as any;
        const runtime = {} as any;

        const stmt = new GosubStatement('missing');
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow(`Label 'missing' not found`);
    });

    it('GosubStatement should push a return address and jump', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = { getLabelIndex: () => 3 } as any;
        const runtime = {} as any;

        context.setProgramCounter(10);
        const spy = jest.spyOn(context, 'pushStackFrame');

        const stmt = new GosubStatement('sub');
        const status = stmt.execute(context, graphics, audio, program, runtime);

        expect(spy).toHaveBeenCalledWith(11);
        expect(status.result).toBe(ExecutionResult.Goto);
        expect(status.gotoTarget).toBe(3);
    });

    it('SubStatement should throw if END SUB cannot be found', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;
        const runtime = { findMatchingEndSub: () => undefined } as any;

        context.setProgramCounter(5);

        const stmt = new SubStatement('MySub', [], []);
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow('SUB MySub is missing END SUB');
    });

    it('SubStatement should skip its body by jumping past END SUB', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;
        const runtime = { findMatchingEndSub: () => 20 } as any;

        context.setProgramCounter(5);

        const stmt = new SubStatement('MySub', [], []);
        const status = stmt.execute(context, graphics, audio, program, runtime);
        expect(status.result).toBe(ExecutionResult.Goto);
        expect(status.gotoTarget).toBe(21);
    });

    it('SubStatement should format toString with and without parameters', () =>
    {
        const noParams = new SubStatement('S', [], []);
        expect(noParams.toString()).toBe('SUB S');

        const withParams = new SubStatement('S', [
            { name: 'x%', byRef: false },
            { name: 'y$', byRef: true }
        ], []);
        expect(withParams.toString()).toBe('SUB S x%, BYREF y$');
    });

    it('ContinueStatement should jump to the end of the matching control frame when present', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const findControlFrame = jest.fn().mockReturnValue({ endLine: 123 });
        const runtime = { findControlFrame } as any;

        const forStatus = new ContinueStatement(ContinueTarget.For).execute(context, graphics, audio, program, runtime);
        expect(findControlFrame).toHaveBeenCalledWith('for');
        expect(forStatus).toEqual({ result: ExecutionResult.Goto, gotoTarget: 123 });

        const whileStatus = new ContinueStatement(ContinueTarget.While).execute(context, graphics, audio, program, runtime);
        expect(findControlFrame).toHaveBeenCalledWith('while');
        expect(whileStatus).toEqual({ result: ExecutionResult.Goto, gotoTarget: 123 });

        const doStatus = new ContinueStatement(ContinueTarget.Do).execute(context, graphics, audio, program, runtime);
        expect(findControlFrame).toHaveBeenCalledWith('do');
        expect(doStatus).toEqual({ result: ExecutionResult.Goto, gotoTarget: 123 });
    });

    it('ContinueStatement should continue when no frame matches (or target is unknown)', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const runtime = { findControlFrame: () => null } as any;
        const status = new ContinueStatement(ContinueTarget.For).execute(context, graphics, audio, program, runtime);
        expect(status).toEqual({ result: ExecutionResult.Continue });

        const unknownTarget = new ContinueStatement(999 as any);
        const unknownStatus = unknownTarget.execute(context, graphics, audio, program, runtime);
        expect(unknownStatus).toEqual({ result: ExecutionResult.Continue });
        expect(unknownTarget.toString()).toBe('CONTINUE');
    });

    it('ElseIfStatement should throw without an IF frame', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;
        const runtime = { findControlFrame: () => null } as any;

        const stmt = new ElseIfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }));
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow('ELSEIF without IF');
    });

    it('ElseIfStatement should skip when branch already taken', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const frame = { branchTaken: true, endLine: 50 };
        const runtime = { findControlFrame: () => frame } as any;

        const stmt = new ElseIfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }));
        const status = stmt.execute(context, graphics, audio, program, runtime);
        expect(status).toEqual({ result: ExecutionResult.Goto, gotoTarget: 50 });
    });

    it('ElseIfStatement should validate condition type', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const frame = { branchTaken: false, endLine: 50 };
        const runtime = { findControlFrame: () => frame } as any;

        const stmt = new ElseIfStatement(new LiteralExpression({ type: EduBasicType.String, value: 'nope' }));
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow('ELSEIF condition must evaluate to an integer');
    });

    it('ElseIfStatement should take the branch when condition is non-zero, otherwise jump to next clause', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const frame = { branchTaken: false, endLine: 50 };
        const runtime = {
            findControlFrame: () => frame,
            findNextIfClauseOrEnd: () => 42
        } as any;

        const trueStmt = new ElseIfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }));
        const trueStatus = trueStmt.execute(context, graphics, audio, program, runtime);
        expect(frame.branchTaken).toBe(true);
        expect(trueStatus).toEqual({ result: ExecutionResult.Continue });

        frame.branchTaken = false;
        context.setProgramCounter(10);
        const falseStmt = new ElseIfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }));
        const falseStatus = falseStmt.execute(context, graphics, audio, program, runtime);
        expect(falseStatus).toEqual({ result: ExecutionResult.Goto, gotoTarget: 42 });
    });

    it('DoLoopStatement should throw when LOOP cannot be found', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;
        const runtime = { findMatchingLoop: () => undefined } as any;

        const stmt = new DoLoopStatement(DoLoopVariant.DoLoop, null, []);
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow('DO: missing LOOP');
    });

    it('DoLoopStatement should handle DO WHILE / DO UNTIL / DO (frame push)', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const runtime = {
            findMatchingLoop: () => 20,
            pushControlFrame: jest.fn()
        } as any;

        context.setProgramCounter(5);

        const doWhileSkip = new DoLoopStatement(
            DoLoopVariant.DoWhile,
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            []
        );
        const doWhileStatus = doWhileSkip.execute(context, graphics, audio, program, runtime);
        expect(doWhileStatus).toEqual({ result: ExecutionResult.Goto, gotoTarget: 21 });

        const doUntilSkip = new DoLoopStatement(
            DoLoopVariant.DoUntil,
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            []
        );
        const doUntilStatus = doUntilSkip.execute(context, graphics, audio, program, runtime);
        expect(doUntilStatus).toEqual({ result: ExecutionResult.Goto, gotoTarget: 21 });

        const doLoop = new DoLoopStatement(DoLoopVariant.DoLoop, null, []);
        const doLoopStatus = doLoop.execute(context, graphics, audio, program, runtime);
        expect(doLoopStatus).toEqual({ result: ExecutionResult.Continue });
        expect(runtime.pushControlFrame).toHaveBeenCalled();
    });

    it('DoLoopStatement should validate DO WHILE/UNTIL condition type', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const runtime = {
            findMatchingLoop: () => 20,
            pushControlFrame: jest.fn()
        } as any;

        const badWhile = new DoLoopStatement(
            DoLoopVariant.DoWhile,
            new LiteralExpression({ type: EduBasicType.String, value: 'nope' }),
            []
        );
        expect(() =>
        {
            badWhile.execute(context, graphics, audio, program, runtime);
        }).toThrow('DO WHILE condition must evaluate to an integer');

        const badUntil = new DoLoopStatement(
            DoLoopVariant.DoUntil,
            new LiteralExpression({ type: EduBasicType.String, value: 'nope' }),
            []
        );
        expect(() =>
        {
            badUntil.execute(context, graphics, audio, program, runtime);
        }).toThrow('DO UNTIL condition must evaluate to an integer');
    });

    it('UntilStatement should throw on invalid condition type and missing UEND', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const runtime = { pushControlFrame: jest.fn() } as any;

        const programMissingUend = new Program();
        const missingUend = new UntilStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), []);
        programMissingUend.appendLine(missingUend);
        context.setProgramCounter(0);

        expect(() =>
        {
            missingUend.execute(context, graphics, audio, programMissingUend, runtime);
        }).toThrow('UNTIL: missing UEND');

        const programBadType = new Program();
        const badType = new UntilStatement(new LiteralExpression({ type: EduBasicType.String, value: 'nope' }), []);
        programBadType.appendLine(badType);
        programBadType.appendLine(new UendStatement());
        context.setProgramCounter(0);

        expect(() =>
        {
            badType.execute(context, graphics, audio, programBadType, runtime);
        }).toThrow('UNTIL condition must evaluate to an integer');
    });

    it('UntilStatement should jump past UEND when condition is true, otherwise push a loop frame', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const pushControlFrame = jest.fn();
        const runtime = { pushControlFrame } as any;

        const program = new Program();

        const trueUntil = new UntilStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), []);
        program.appendLine(trueUntil);
        program.appendLine(new UendStatement());
        context.setProgramCounter(0);

        const trueStatus = trueUntil.execute(context, graphics, audio, program, runtime);
        expect(trueStatus).toEqual({ result: ExecutionResult.Goto, gotoTarget: 2 });

        const program2 = new Program();
        const falseUntil = new UntilStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), []);
        program2.appendLine(falseUntil);
        program2.appendLine(new UendStatement());
        context.setProgramCounter(0);

        const falseStatus = falseUntil.execute(context, graphics, audio, program2, runtime);
        expect(falseStatus).toEqual({ result: ExecutionResult.Continue });
        expect(pushControlFrame).toHaveBeenCalled();
    });

    it('ForStatement should validate types, handle missing NEXT, and decide whether to enter the loop', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const runtimeMissingNext = { findMatchingNext: () => undefined } as any;
        const missingNext = new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
            null,
            []
        );
        expect(() =>
        {
            missingNext.execute(context, graphics, audio, program, runtimeMissingNext);
        }).toThrow('FOR: missing NEXT');

        const runtime = {
            findMatchingNext: () => 10,
            pushControlFrame: jest.fn()
        } as any;

        const badStart = new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.String, value: 'x' }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
            null,
            []
        );
        expect(() =>
        {
            badStart.execute(context, graphics, audio, program, runtime);
        }).toThrow('FOR loop variable must be numeric');

        const badEnd = new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.String, value: 'x' }),
            null,
            []
        );
        expect(() =>
        {
            badEnd.execute(context, graphics, audio, program, runtime);
        }).toThrow('FOR loop end value must be numeric');

        const badStep = new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
            new LiteralExpression({ type: EduBasicType.String, value: 'x' }),
            []
        );
        expect(() =>
        {
            badStep.execute(context, graphics, audio, program, runtime);
        }).toThrow('FOR loop step value must be numeric');

        const skipForward = new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            null,
            []
        );
        const skipForwardStatus = skipForward.execute(context, graphics, audio, program, runtime);
        expect(skipForwardStatus).toEqual({ result: ExecutionResult.Goto, gotoTarget: 11 });

        const skipBackward = new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 10 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: -1 }),
            []
        );
        const skipBackwardStatus = skipBackward.execute(context, graphics, audio, program, runtime);
        expect(skipBackwardStatus).toEqual({ result: ExecutionResult.Goto, gotoTarget: 11 });

        const enter = new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            []
        );
        const enterStatus = enter.execute(context, graphics, audio, program, runtime);
        expect(enterStatus).toEqual({ result: ExecutionResult.Continue });
        expect(runtime.pushControlFrame).toHaveBeenCalled();

        const noStepString = new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
            null,
            []
        );
        expect(noStepString.toString()).toBe('FOR i% = 1 TO 2');

        expect(enter.toString()).toBe('FOR i% = 1 TO 2 STEP 1');
    });

    it('ThrowStatement should throw and format toString', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;
        const runtime = {} as any;

        const stmt = new ThrowStatement(new LiteralExpression({ type: EduBasicType.String, value: 'boom' }));
        expect(stmt.toString()).toBe('THROW "boom"');

        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow('boom');
    });

    it('ElseStatement should validate control frame and handle branchTaken', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const stmt = new ElseStatement();
        expect(stmt.getIndentAdjustment()).toBe(0);
        expect(stmt.toString()).toBe('ELSE');

        const badRuntime = { getCurrentControlFrame: () => null } as any;
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, badRuntime);
        }).toThrow('ELSE without IF/UNLESS');

        const takenFrame = { type: 'if', branchTaken: true, endLine: 123 };
        const takenRuntime = { getCurrentControlFrame: () => takenFrame } as any;
        expect(stmt.execute(context, graphics, audio, program, takenRuntime)).toEqual({ result: ExecutionResult.Goto, gotoTarget: 123 });

        const openFrame = { type: 'if', branchTaken: false, endLine: 50 };
        const openRuntime = { getCurrentControlFrame: () => openFrame } as any;
        expect(stmt.execute(context, graphics, audio, program, openRuntime)).toEqual({ result: ExecutionResult.Continue });
        expect(openFrame.branchTaken).toBe(true);
    });

    it('ExitStatement should return, jump, or continue depending on target and frames', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const exitSub = new ExitStatement(ExitTarget.Sub);
        expect(exitSub.toString()).toBe('EXIT SUB');
        expect(exitSub.execute(context, graphics, audio, program, {} as any)).toEqual({ result: ExecutionResult.Return });

        const noFrame = new ExitStatement(ExitTarget.For);
        expect(noFrame.toString()).toBe('EXIT FOR');
        expect(noFrame.execute(context, graphics, audio, program, {
            findControlFrame: () => null,
            findControlFrameWhere: () => null,
            popControlFramesToAndIncludingWhere: () => null,
        } as any)).toEqual({ result: ExecutionResult.Continue });

        const frames: any[] = [
            { type: 'if' },
            { type: 'for', endLine: 10 }
        ];
        const runtime = {
            findControlFrame: (type: string) => frames.find((f) => f.type === type) ?? null,
            findControlFrameWhere: (predicate: (frame: any) => boolean) => frames.slice().reverse().find(predicate) ?? null,
            getCurrentControlFrame: () => frames[frames.length - 1] ?? null,
            popControlFrame: () => frames.pop(),
            popControlFramesToAndIncludingWhere: (predicate: (frame: any) => boolean) =>
            {
                while (frames.length > 0)
                {
                    const popped = frames.pop();
                    if (popped && predicate(popped))
                    {
                        return popped;
                    }
                }

                return null;
            }
        } as any;

        const exitFor = new ExitStatement(ExitTarget.For);
        expect(exitFor.execute(context, graphics, audio, program, runtime)).toEqual({ result: ExecutionResult.Goto, gotoTarget: 11 });

        const framesNoEnd: any[] = [{ type: 'for' }];
        const runtimeNoEnd = {
            findControlFrame: () => framesNoEnd[0],
            findControlFrameWhere: (predicate: (frame: any) => boolean) => framesNoEnd.slice().reverse().find(predicate) ?? null,
            getCurrentControlFrame: () => framesNoEnd[framesNoEnd.length - 1] ?? null,
            popControlFrame: () => framesNoEnd.pop(),
            popControlFramesToAndIncludingWhere: (predicate: (frame: any) => boolean) =>
            {
                while (framesNoEnd.length > 0)
                {
                    const popped = framesNoEnd.pop();
                    if (popped && predicate(popped))
                    {
                        return popped;
                    }
                }

                return null;
            }
        } as any;
        expect(exitFor.execute(context, graphics, audio, program, runtimeNoEnd)).toEqual({ result: ExecutionResult.Continue });

        const unknown = new ExitStatement(999 as any);
        expect(unknown.toString()).toBe('EXIT');
        expect(unknown.execute(context, graphics, audio, program, {} as any)).toEqual({ result: ExecutionResult.Continue });
    });

    it('ExitStatement should support EXIT FOR variableName for nested loops', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const frames: any[] = [
            { type: 'for', loopVariable: 'i%', endLine: 100 },
            { type: 'for', loopVariable: 'j%', endLine: 200 },
        ];

        const runtime = {
            findControlFrameWhere: (predicate: (frame: any) => boolean) => frames.slice().reverse().find(predicate) ?? null,
            popControlFramesToAndIncludingWhere: (predicate: (frame: any) => boolean) =>
            {
                while (frames.length > 0)
                {
                    const popped = frames.pop();
                    if (popped && predicate(popped))
                    {
                        return popped;
                    }
                }

                return null;
            }
        } as any;

        const exitInner = new ExitStatement(ExitTarget.For, 'j%');
        expect(exitInner.toString()).toBe('EXIT FOR j%');
        expect(exitInner.execute(context, graphics, audio, program, runtime)).toEqual({ result: ExecutionResult.Goto, gotoTarget: 201 });
    });

    it('NextStatement should update loop variable and format toString', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = {} as any;

        const withVar = new NextStatement('i%');
        const withoutVar = new NextStatement(null);
        expect(withVar.getIndentAdjustment()).toBe(-1);
        expect(withVar.toString()).toBe('NEXT i%');
        expect(withoutVar.toString()).toBe('NEXT');

        context.setVariable('i%', { type: EduBasicType.Integer, value: 4 }, false);
        const frames: any[] = [{ type: 'for', loopVariable: 'i%', loopEndValue: 5, loopStepValue: 1, startLine: 10 }];
        const runtime = {
            findControlFrame: () => frames[0],
            findControlFrameWhere: (predicate: (frame: any) => boolean) => frames.slice().reverse().find(predicate) ?? null,
            popControlFramesToAndIncludingWhere: (predicate: (frame: any) => boolean) =>
            {
                while (frames.length > 0)
                {
                    const popped = frames.pop();
                    if (popped && predicate(popped))
                    {
                        return popped;
                    }
                }

                return null;
            }
        } as any;

        const cont = withVar.execute(context, graphics, audio, program, runtime);
        expect(cont).toEqual({ result: ExecutionResult.Goto, gotoTarget: 11 });
        expect(context.getVariable('i%')).toEqual({ type: EduBasicType.Integer, value: 5 });

        const stop = withVar.execute(context, graphics, audio, program, runtime);
        expect(stop).toEqual({ result: ExecutionResult.Continue });
    });

    it('LoopStatement should validate DO frame and handle DO variants', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();

        const loop = new LoopStatement();
        expect(loop.getIndentAdjustment()).toBe(-1);
        expect(loop.toString()).toBe('LOOP');

        expect(() =>
        {
            loop.execute(context, graphics, audio, {} as any, { getCurrentControlFrame: () => null } as any);
        }).toThrow('LOOP without DO');

        const doLoopStmt = new DoLoopStatement(DoLoopVariant.DoLoop, null, []);
        const program = { getStatement: () => doLoopStmt } as any;
        const runtime = { getCurrentControlFrame: () => ({ type: 'do', startLine: 5 }), popControlFrame: jest.fn() } as any;
        expect(loop.execute(context, graphics, audio, program, runtime)).toEqual({ result: ExecutionResult.Goto, gotoTarget: 6 });

        const missingCond = new DoLoopStatement(DoLoopVariant.DoLoopWhile, null, []);
        const missingProgram = { getStatement: () => missingCond } as any;
        expect(() =>
        {
            loop.execute(context, graphics, audio, missingProgram, runtime);
        }).toThrow('LOOP condition is missing');

        const badCond = new DoLoopStatement(
            DoLoopVariant.DoLoopWhile,
            new LiteralExpression({ type: EduBasicType.String, value: 'nope' }),
            []
        );
        const badProgram = { getStatement: () => badCond } as any;
        expect(() =>
        {
            loop.execute(context, graphics, audio, badProgram, runtime);
        }).toThrow('LOOP condition must evaluate to an integer');

        const condFalse = new DoLoopStatement(
            DoLoopVariant.DoLoopWhile,
            new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
            []
        );
        const condFalseProgram = { getStatement: () => condFalse } as any;
        const popSpy = jest.fn();
        const runtimeWithPop = { getCurrentControlFrame: () => ({ type: 'do', startLine: 1 }), popControlFrame: popSpy } as any;
        expect(loop.execute(context, graphics, audio, condFalseProgram, runtimeWithPop)).toEqual({ result: ExecutionResult.Continue });
        expect(popSpy).toHaveBeenCalled();
    });

    it('UendStatement should validate frame and UNTIL condition type', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();

        const stmt = new UendStatement();
        expect(stmt.getIndentAdjustment()).toBe(-1);
        expect(stmt.toString()).toBe('UEND');

        expect(() =>
        {
            stmt.execute(context, graphics, audio, {} as any, { getCurrentControlFrame: () => null } as any);
        }).toThrow('UEND without UNTIL');

        const until = new UntilStatement(new LiteralExpression({ type: EduBasicType.String, value: 'nope' }), []);
        const program = { getStatement: () => until } as any;
        const runtime = { getCurrentControlFrame: () => ({ type: 'while', startLine: 0 }), popControlFrame: jest.fn() } as any;
        expect(() =>
        {
            stmt.execute(context, graphics, audio, program, runtime);
        }).toThrow('UNTIL condition must evaluate to an integer');
    });

    it('WendStatement should loop while condition is true', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();

        const stmt = new WendStatement();
        expect(stmt.getIndentAdjustment()).toBe(-1);
        expect(stmt.toString()).toBe('WEND');

        expect(() =>
        {
            stmt.execute(context, graphics, audio, {} as any, { getCurrentControlFrame: () => null } as any);
        }).toThrow('WEND without WHILE');

        const whileStmt = new WhileStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), []);
        const program = { getStatement: () => whileStmt } as any;
        const popSpy = jest.fn();
        const runtime = {
            getCurrentControlFrame: () => ({ type: 'while', startLine: 0 }),
            popControlFrame: popSpy
        } as any;

        expect(stmt.execute(context, graphics, audio, program, runtime)).toEqual({ result: ExecutionResult.Goto, gotoTarget: 1 });

        const whileStop = new WhileStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), []);
        const programStop = { getStatement: () => whileStop } as any;
        expect(stmt.execute(context, graphics, audio, programStop, runtime)).toEqual({ result: ExecutionResult.Continue });
        expect(popSpy).toHaveBeenCalled();
    });

    it('TryStatement should execute body, format toString, and support private findEndTry helper', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = new Program();
        const runtime = {} as any;

        const endNow = new EndStatement(EndType.Program);
        const tryStmt = new TryStatement([endNow], [{ variableName: 'e$', body: [endNow] }], [endNow]);

        expect(tryStmt.getIndentAdjustment()).toBe(1);
        expect(tryStmt.execute(context, graphics, audio, program, runtime)).toEqual({ result: ExecutionResult.End });

        const s = tryStmt.toString();
        expect(s).toContain('TRY');
        expect(s).toContain('CATCH e$');
        expect(s).toContain('FINALLY');
        expect(s).toContain('END TRY');

        const empty = new TryStatement([], [], null);
        expect(empty.execute(context, graphics, audio, program, runtime)).toEqual({ result: ExecutionResult.Continue });

        const endTryMarker = new EndStatement(EndType.Try);
        program.appendLine(new LetStatement('nope%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 })));
        program.appendLine(endTryMarker);
        expect((tryStmt as any).findEndTry(program, 0)).toBe(1);
    });

    it('UnlessStatement should validate condition and find ELSE while skipping nested blocks', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = new Program();

        const bad = new UnlessStatement(new LiteralExpression({ type: EduBasicType.String, value: 'nope' }), [], null);
        expect(bad.getIndentAdjustment()).toBe(1);
        expect(bad.toString()).toBe('UNLESS "nope" THEN');
        expect(() =>
        {
            bad.execute(context, graphics, audio, program, { findMatchingEndUnless: () => 0 } as any);
        }).toThrow('UNLESS condition must evaluate to an integer');

        const missingEnd = new UnlessStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [], null);
        expect(() =>
        {
            missingEnd.execute(context, graphics, audio, program, { findMatchingEndUnless: () => undefined } as any);
        }).toThrow('UNLESS: missing END UNLESS');

        const runtime = {
            findMatchingEndUnless: () => 7,
            pushControlFrame: jest.fn()
        } as any;

        const taken = new UnlessStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), [], null);
        context.setProgramCounter(0);
        expect(taken.execute(context, graphics, audio, program, runtime)).toEqual({ result: ExecutionResult.Continue });
        expect(runtime.pushControlFrame).toHaveBeenCalled();

        const elseStmt = new ElseStatement();
        program.appendLine(new UnlessStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [], null));
        program.appendLine(new IfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [], [], null));
        program.appendLine(new ElseStatement());
        program.appendLine(new EndStatement(EndType.If));
        program.appendLine(new UnlessStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [], null));
        program.appendLine(new EndStatement(EndType.Unless));
        program.appendLine(elseStmt);
        program.appendLine(new EndStatement(EndType.Unless));

        const notTaken = new UnlessStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [], null);
        const status = notTaken.execute(context, graphics, audio, program, runtime);
        expect(status).toEqual({ result: ExecutionResult.Goto, gotoTarget: 6 });
    });

    it('SelectCaseStatement should match value/range/relational/else and format toString', () =>
    {
        const context = new ExecutionContext();
        const graphics = new Graphics();
        const audio = new Audio();
        const program = new Program();
        const runtime = {} as any;

        const valueMatch = new SelectCaseStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
            [
                {
                    matchType: CaseMatchType.Value,
                    values: [
                        new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                        new LiteralExpression({ type: EduBasicType.Integer, value: 5 })
                    ],
                    statements: [new LetStatement('hit%', new LiteralExpression({ type: EduBasicType.Integer, value: 1 }))]
                }
            ]
        );
        expect(valueMatch.getIndentAdjustment()).toBe(1);
        expect(valueMatch.execute(context, graphics, audio, program, runtime)).toEqual({ result: ExecutionResult.Continue });
        expect(context.getVariable('hit%')).toEqual({ type: EduBasicType.Integer, value: 1 });

        const earlyReturn = new SelectCaseStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
            [
                {
                    matchType: CaseMatchType.Value,
                    values: [new LiteralExpression({ type: EduBasicType.Integer, value: 5 })],
                    statements: [new EndStatement(EndType.Program)]
                }
            ]
        );
        expect(earlyReturn.execute(context, graphics, audio, program, runtime)).toEqual({ result: ExecutionResult.End });

        const rangeMatch = new SelectCaseStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
            [
                {
                    matchType: CaseMatchType.Range,
                    rangeStart: new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                    rangeEnd: new LiteralExpression({ type: EduBasicType.Integer, value: 7 }),
                    statements: [new LetStatement('range%', new LiteralExpression({ type: EduBasicType.Integer, value: 1 }))]
                }
            ]
        );
        rangeMatch.execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('range%')).toEqual({ type: EduBasicType.Integer, value: 1 });

        const relationalMatch = new SelectCaseStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
            [
                {
                    matchType: CaseMatchType.Relational,
                    relationalOp: '>=',
                    relationalValue: new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
                    statements: [new LetStatement('rel%', new LiteralExpression({ type: EduBasicType.Integer, value: 1 }))]
                }
            ]
        );
        relationalMatch.execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('rel%')).toEqual({ type: EduBasicType.Integer, value: 1 });

        const elseMatch = new SelectCaseStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
            [
                {
                    matchType: CaseMatchType.Value,
                    values: [new LiteralExpression({ type: EduBasicType.Integer, value: 1 })],
                    statements: []
                },
                {
                    matchType: CaseMatchType.Else,
                    statements: [new LetStatement('else%', new LiteralExpression({ type: EduBasicType.Integer, value: 1 }))]
                }
            ]
        );
        elseMatch.execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('else%')).toEqual({ type: EduBasicType.Integer, value: 1 });

        expect(() =>
        {
            new SelectCaseStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
                [
                    {
                        matchType: CaseMatchType.Relational,
                        relationalOp: '??',
                        relationalValue: new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                        statements: []
                    }
                ]
            ).execute(context, graphics, audio, program, runtime);
        }).toThrow('Unknown relational operator: ??');

        const s = new SelectCaseStatement(
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            [
                {
                    matchType: CaseMatchType.Value,
                    values: [new LiteralExpression({ type: EduBasicType.Integer, value: 1 })],
                    statements: [new LetStatement('x%', new LiteralExpression({ type: EduBasicType.Integer, value: 1 }))]
                },
                {
                    matchType: CaseMatchType.Range,
                    rangeStart: new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                    rangeEnd: new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                    statements: []
                },
                {
                    matchType: CaseMatchType.Relational,
                    relationalOp: '=',
                    relationalValue: new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                    statements: []
                },
                {
                    matchType: CaseMatchType.Else,
                    statements: []
                }
            ]
        );
        const text = s.toString();
        expect(text).toContain('SELECT CASE');
        expect(text).toContain('CASE');
        expect(text).toContain('CASE ELSE');
        expect(text).toContain('END SELECT');

        const findEnd = new SelectCaseStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), []);
        (findEnd as any).indentLevel = 1;
        const endSelect = new EndStatement(EndType.Select);
        (endSelect as any).indentLevel = 1;
        const inner = new LetStatement('inner%', new LiteralExpression({ type: EduBasicType.Integer, value: 0 }));
        (inner as any).indentLevel = 1;
        program.clear();
        program.appendLine(findEnd);
        program.appendLine(inner);
        program.appendLine(endSelect);
        expect((findEnd as any).findEndSelect(program, 0)).toBe(2);
    });
});

