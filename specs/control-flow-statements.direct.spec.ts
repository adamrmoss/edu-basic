import { ExecutionContext } from '../src/lang/execution-context';
import { EduBasicType } from '../src/lang/edu-basic-value';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { Program } from '../src/lang/program';
import { ExecutionResult } from '../src/lang/statements/statement';
import { Audio } from '../src/lang/audio';
import { Graphics } from '../src/lang/graphics';
import {
    ContinueStatement,
    ContinueTarget,
    DoLoopStatement,
    DoLoopVariant,
    ElseIfStatement,
    GosubStatement,
    GotoStatement,
    ForStatement,
    SubStatement,
    UendStatement,
    UntilStatement
} from '../src/lang/statements/control-flow';

describe('Control flow statements (direct execution)', () =>
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
});

