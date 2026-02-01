import { ParserService } from '@/app/interpreter/parser.service';

import { EduBasicType } from '@/lang/edu-basic-value';
import {
    CallStatement,
    ContinueStatement,
    DoLoopStatement,
    DoLoopVariant,
    EndStatement,
    EndType,
    ExitStatement,
    ExitTarget,
    SubStatement,
    ThrowStatement
} from '@/lang/statements/control-flow';
import { UnparsableStatement } from '@/lang/statements/unparsable-statement';

describe('ControlFlowParsers (via ParserService)', () =>
{
    let parser: ParserService;

    beforeEach(() =>
    {
        parser = new ParserService();
    });

    it('should parse DO variants', () =>
    {
        const doLoop = parser.parseLine(1, 'DO');
        expect(doLoop.success).toBe(true);
        if (!doLoop.success) { return; }
        expect(doLoop.value.hasError).toBe(false);
        expect(doLoop.value.statement).toBeInstanceOf(DoLoopStatement);
        expect((doLoop.value.statement as DoLoopStatement).variant).toBe(DoLoopVariant.DoLoop);

        const doWhile = parser.parseLine(2, 'DO WHILE 1');
        expect(doWhile.success).toBe(true);
        if (!doWhile.success) { return; }
        expect(doWhile.value.hasError).toBe(false);
        expect((doWhile.value.statement as DoLoopStatement).variant).toBe(DoLoopVariant.DoWhile);

        const doUntil = parser.parseLine(3, 'DO UNTIL 0');
        expect(doUntil.success).toBe(true);
        if (!doUntil.success) { return; }
        expect(doUntil.value.hasError).toBe(false);
        expect((doUntil.value.statement as DoLoopStatement).variant).toBe(DoLoopVariant.DoUntil);
    });

    it('should produce a parse error for malformed DO WHILE/UNTIL', () =>
    {
        const doWhile = parser.parseLine(1, 'DO WHILE');
        expect(doWhile.success).toBe(true);
        if (!doWhile.success) { return; }
        expect(doWhile.value.hasError).toBe(true);
        expect(doWhile.value.statement).toBeInstanceOf(UnparsableStatement);
    });

    it('should parse SUB parameters including BYREF', () =>
    {
        const result = parser.parseLine(1, 'SUB MySub BYREF x%, y%');
        expect(result.success).toBe(true);
        if (!result.success) { return; }
        expect(result.value.hasError).toBe(false);
        expect(result.value.statement).toBeInstanceOf(SubStatement);

        const stmt = result.value.statement as SubStatement;
        expect(stmt.name).toBe('MySub');
        expect(stmt.parameters.length).toBe(2);
        expect(stmt.parameters[0]).toEqual({ name: 'x%', byRef: true });
        expect(stmt.parameters[1]).toEqual({ name: 'y%', byRef: false });
    });

    it('should parse CALL with multiple arguments', () =>
    {
        const result = parser.parseLine(1, 'CALL MySub 1, 2, 3');
        expect(result.success).toBe(true);
        if (!result.success) { return; }
        expect(result.value.hasError).toBe(false);
        expect(result.value.statement).toBeInstanceOf(CallStatement);

        const stmt = result.value.statement as CallStatement;
        expect(stmt.subroutineName).toBe('MySub');
        expect(stmt.args.length).toBe(3);
    });

    it('should parse END variants', () =>
    {
        const endSub = parser.parseLine(1, 'END SUB');
        expect(endSub.success).toBe(true);
        if (!endSub.success) { return; }
        expect(endSub.value.hasError).toBe(false);
        expect(endSub.value.statement).toBeInstanceOf(EndStatement);
        expect((endSub.value.statement as EndStatement).endType).toBe(EndType.Sub);

        const endTry = parser.parseLine(2, 'END TRY');
        expect(endTry.success).toBe(true);
        if (!endTry.success) { return; }
        expect((endTry.value.statement as EndStatement).endType).toBe(EndType.Try);
    });

    it('should parse EXIT/CONTINUE targets and fail without a target', () =>
    {
        const exitFor = parser.parseLine(1, 'EXIT FOR');
        expect(exitFor.success).toBe(true);
        if (!exitFor.success) { return; }
        expect(exitFor.value.hasError).toBe(false);
        expect(exitFor.value.statement).toBeInstanceOf(ExitStatement);
        expect((exitFor.value.statement as ExitStatement).target).toBe(ExitTarget.For);
        expect((exitFor.value.statement as ExitStatement).forVariableName).toBeNull();

        const exitForVar = parser.parseLine(2, 'EXIT FOR i%');
        expect(exitForVar.success).toBe(true);
        if (!exitForVar.success) { return; }
        expect(exitForVar.value.hasError).toBe(false);
        expect(exitForVar.value.statement).toBeInstanceOf(ExitStatement);
        expect((exitForVar.value.statement as ExitStatement).target).toBe(ExitTarget.For);
        expect((exitForVar.value.statement as ExitStatement).forVariableName).toBe('i%');

        const contDo = parser.parseLine(3, 'CONTINUE DO');
        expect(contDo.success).toBe(true);
        if (!contDo.success) { return; }
        expect(contDo.value.hasError).toBe(false);
        expect(contDo.value.statement).toBeInstanceOf(ContinueStatement);

        const badExit = parser.parseLine(4, 'EXIT');
        expect(badExit.success).toBe(true);
        if (!badExit.success) { return; }
        expect(badExit.value.hasError).toBe(true);
        expect(badExit.value.statement).toBeInstanceOf(UnparsableStatement);
    });

    it('should parse THROW with an expression', () =>
    {
        const result = parser.parseLine(1, 'THROW "Boom"');
        expect(result.success).toBe(true);
        if (!result.success) { return; }
        expect(result.value.hasError).toBe(false);
        expect(result.value.statement).toBeInstanceOf(ThrowStatement);

        // Sanity-check the expression is a string literal.
        const stmt = result.value.statement as ThrowStatement;
        const value = stmt.message.evaluate({
            getVariable: () => ({ type: EduBasicType.Integer, value: 0 }),
        } as any);
        expect(value.type).toBe(EduBasicType.String);
    });
});

