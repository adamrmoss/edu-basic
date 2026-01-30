import { EduBasicType } from '../src/lang/edu-basic-value';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { VariableExpression } from '../src/lang/expressions/special/variable-expression';
import { ExecutionContext } from '../src/lang/execution-context';
import { Program } from '../src/lang/program';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { Audio } from '../src/lang/audio';
import { Graphics } from '../src/lang/graphics';
import { ExecutionResult, Statement, ExecutionStatus } from '../src/lang/statements/statement';
import {
    CaseMatchType,
    CatchClause,
    CaseClause,
    CaseStatement,
    CatchStatement,
    DoLoopStatement,
    DoLoopVariant,
    ElseStatement,
    EndStatement,
    EndType,
    FinallyStatement,
    ForStatement,
    GosubStatement,
    GotoStatement,
    IfStatement,
    LabelStatement,
    LoopStatement,
    NextStatement,
    ReturnStatement,
    SelectCaseStatement,
    SubStatement,
    TryStatement,
    UendStatement,
    UnlessStatement,
    UntilStatement,
    WendStatement,
    WhileStatement
} from '../src/lang/statements/control-flow';
import { AssignIntStatement, createRuntimeFixture } from './statement-runtime-test-helpers';

class EndNowStatement extends Statement
{
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        return { result: ExecutionResult.End };
    }

    public override toString(): string
    {
        return 'ENDNOW';
    }
}

class IncrementAndMaybeSetFlagStatement extends Statement
{
    public constructor(
        private readonly counterName: string,
        private readonly flagName: string,
        private readonly stopAt: number,
        private readonly flagValueWhenDone: number
    )
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const current = context.getVariable(this.counterName);
        if (current.type !== EduBasicType.Integer)
        {
            throw new Error('Expected integer');
        }

        const next = (current.value as number) + 1;
        context.setVariable(this.counterName, { type: EduBasicType.Integer, value: next }, false);

        if (next >= this.stopAt)
        {
            context.setVariable(this.flagName, { type: EduBasicType.Integer, value: this.flagValueWhenDone }, false);
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `INC ${this.counterName}`;
    }
}

describe('Control-flow statements (additional runtime coverage)', () =>
{
    it('GOTO should jump to a label', () =>
    {
        const { context, program, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('x%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new GotoStatement('Target'));
        program.appendLine(new AssignIntStatement('x%', 1));
        program.appendLine(new LabelStatement('Target'));
        program.appendLine(new AssignIntStatement('x%', 2));
        program.appendLine(new EndStatement(EndType.Program));

        runtime.executeStep();
        runtime.executeStep();
        runtime.executeStep();

        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 2 });
    });

    it('GOSUB/RETURN should jump to a label and return to the next statement', () =>
    {
        const { context, program, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('inSub%', { type: EduBasicType.Integer, value: 0 }, false);
        context.setVariable('after%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new GosubStatement('SubLabel'));
        program.appendLine(new AssignIntStatement('after%', 1));
        program.appendLine(new EndStatement(EndType.Program));
        program.appendLine(new LabelStatement('SubLabel'));
        program.appendLine(new AssignIntStatement('inSub%', 1));
        program.appendLine(new ReturnStatement());

        for (let i = 0; i < 50; i++)
        {
            const result = runtime.executeStep();
            if (result === ExecutionResult.End)
            {
                break;
            }
        }

        expect(context.getVariable('inSub%')).toEqual({ type: EduBasicType.Integer, value: 1 });
        expect(context.getVariable('after%')).toEqual({ type: EduBasicType.Integer, value: 1 });
    });

    it('SUB should be skipped during flat execution', () =>
    {
        const { context, program, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('inside%', { type: EduBasicType.Integer, value: 0 }, false);
        context.setVariable('after%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new SubStatement('S', [], []));
        program.appendLine(new AssignIntStatement('inside%', 1));
        program.appendLine(new EndStatement(EndType.Sub));
        program.appendLine(new AssignIntStatement('after%', 1));
        program.appendLine(new EndStatement(EndType.Program));

        for (let i = 0; i < 10; i++)
        {
            runtime.executeStep();
            if (context.getProgramCounter() >= 5)
            {
                break;
            }
        }

        expect(context.getVariable('inside%')).toEqual({ type: EduBasicType.Integer, value: 0 });
        expect(context.getVariable('after%')).toEqual({ type: EduBasicType.Integer, value: 1 });
    });

    it('FOR should skip the loop body when it should not enter', () =>
    {
        const { context, program, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('body%', { type: EduBasicType.Integer, value: 0 }, false);
        context.setVariable('after%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            []
        ));
        program.appendLine(new AssignIntStatement('body%', 1));
        program.appendLine(new NextStatement('i%'));
        program.appendLine(new AssignIntStatement('after%', 1));
        program.appendLine(new EndStatement(EndType.Program));

        runtime.executeStep();

        expect(context.getProgramCounter()).toBe(3);

        runtime.executeStep();
        expect(context.getVariable('body%')).toEqual({ type: EduBasicType.Integer, value: 0 });
        expect(context.getVariable('after%')).toEqual({ type: EduBasicType.Integer, value: 1 });
    });

    it('IF should throw if condition is not an integer', () =>
    {
        const { context, program, runtime } = createRuntimeFixture();
        program.appendLine(new IfStatement(new LiteralExpression({ type: EduBasicType.Real, value: 1.5 }), [], [], null));
        program.appendLine(new EndStatement(EndType.If));

        expect(() => runtime.executeStep()).toThrow('IF condition must evaluate to an integer');
    });

    it('IF should throw if END IF is missing', () =>
    {
        const { context, program, runtime } = createRuntimeFixture();
        program.appendLine(new IfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [], [], null));

        expect(() => runtime.executeStep()).toThrow('IF: missing END IF');
    });

    it('WHILE should throw if condition is not an integer', () =>
    {
        const { program, runtime } = createRuntimeFixture();
        program.appendLine(new WhileStatement(new LiteralExpression({ type: EduBasicType.String, value: 'x' }), []));
        program.appendLine(new WendStatement());

        expect(() => runtime.executeStep()).toThrow('WHILE condition must evaluate to an integer');
    });

    it('WHILE should throw if WEND is missing', () =>
    {
        const { program, runtime } = createRuntimeFixture();
        program.appendLine(new WhileStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), []));

        expect(() => runtime.executeStep()).toThrow('WHILE: missing WEND');
    });

    it('UNLESS should execute the THEN region when condition is 0 and skip ELSE', () =>
    {
        const { context, program, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('x%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new UnlessStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), [], null));
        program.appendLine(new AssignIntStatement('x%', 1));
        program.appendLine(new ElseStatement());
        program.appendLine(new AssignIntStatement('x%', 2));
        program.appendLine(new EndStatement(EndType.Unless));
        program.appendLine(new EndStatement(EndType.Program));

        for (let i = 0; i < 20; i++)
        {
            runtime.executeStep();
            if (context.getProgramCounter() >= 6)
            {
                break;
            }
        }

        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 1 });
    });

    it('UNLESS should jump to ELSE when condition is non-zero', () =>
    {
        const { context, program, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('x%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new UnlessStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [], null));
        program.appendLine(new AssignIntStatement('x%', 1));
        program.appendLine(new ElseStatement());
        program.appendLine(new AssignIntStatement('x%', 2));
        program.appendLine(new EndStatement(EndType.Unless));
        program.appendLine(new EndStatement(EndType.Program));

        for (let i = 0; i < 20; i++)
        {
            runtime.executeStep();
            if (context.getProgramCounter() >= 6)
            {
                break;
            }
        }

        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 2 });
    });

    it('UNLESS should throw if END UNLESS is missing', () =>
    {
        const { program, runtime } = createRuntimeFixture();
        program.appendLine(new UnlessStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), [], null));

        expect(() => runtime.executeStep()).toThrow('UNLESS: missing END UNLESS');
    });

    it('UNTIL/UEND should loop until condition becomes non-zero', () =>
    {
        const { context, program, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('flag%', { type: EduBasicType.Integer, value: 0 }, false);
        context.setVariable('count%', { type: EduBasicType.Integer, value: 0 }, false);
        context.setVariable('after%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new UntilStatement(new VariableExpression('flag%'), []));
        program.appendLine(new IncrementAndMaybeSetFlagStatement('count%', 'flag%', 3, 1));
        program.appendLine(new UendStatement());
        program.appendLine(new AssignIntStatement('after%', 1));
        program.appendLine(new EndStatement(EndType.Program));

        for (let i = 0; i < 100; i++)
        {
            runtime.executeStep();
            if (context.getProgramCounter() >= 5)
            {
                break;
            }
        }

        expect(context.getVariable('count%')).toEqual({ type: EduBasicType.Integer, value: 3 });
        expect(context.getVariable('after%')).toEqual({ type: EduBasicType.Integer, value: 1 });
    });

    it('UEND should throw without an UNTIL frame', () =>
    {
        const { program, runtime } = createRuntimeFixture();
        program.appendLine(new UendStatement());

        expect(() => runtime.executeStep()).toThrow('UEND without UNTIL');
    });

    it('DO WHILE ... LOOP should enter and then stop when condition becomes false', () =>
    {
        const { context, program, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('flag%', { type: EduBasicType.Integer, value: 1 }, false);
        context.setVariable('count%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new DoLoopStatement(DoLoopVariant.DoWhile, new VariableExpression('flag%'), []));
        program.appendLine(new IncrementAndMaybeSetFlagStatement('count%', 'flag%', 1, 0));
        program.appendLine(new LoopStatement());
        program.appendLine(new EndStatement(EndType.Program));

        for (let i = 0; i < 50; i++)
        {
            runtime.executeStep();
            if (context.getProgramCounter() >= 4)
            {
                break;
            }
        }

        expect(context.getVariable('count%')).toEqual({ type: EduBasicType.Integer, value: 1 });
    });

    it('LOOP should throw without a DO frame', () =>
    {
        const { program, runtime } = createRuntimeFixture();
        program.appendLine(new LoopStatement());

        expect(() => runtime.executeStep()).toThrow('LOOP without DO');
    });

    it('SelectCaseStatement should execute the first matching case (Value, Range, Relational, Else)', () =>
    {
        const { context, program, runtime, graphics, audio } = createRuntimeFixture();
        context.setVariable('x%', { type: EduBasicType.Integer, value: 0 }, false);

        const cases: CaseClause[] = [
            {
                matchType: CaseMatchType.Value,
                values: [new LiteralExpression({ type: EduBasicType.Integer, value: 1 })],
                statements: [new AssignIntStatement('x%', 10)]
            },
            {
                matchType: CaseMatchType.Range,
                rangeStart: new LiteralExpression({ type: EduBasicType.Integer, value: 2 }),
                rangeEnd: new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                statements: [new AssignIntStatement('x%', 20)]
            },
            {
                matchType: CaseMatchType.Relational,
                relationalOp: '>=',
                relationalValue: new LiteralExpression({ type: EduBasicType.Integer, value: 99 }),
                statements: [new AssignIntStatement('x%', 30)]
            },
            {
                matchType: CaseMatchType.Else,
                statements: [new AssignIntStatement('x%', 40)]
            }
        ];

        const select = new SelectCaseStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 2 }), cases);
        const status = select.execute(context, graphics, audio, program, runtime);

        expect(status.result).toBe(ExecutionResult.Continue);
        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 20 });
        expect(select.toString()).toContain('SELECT CASE');
        expect(select.toString()).toContain('CASE');
        expect(select.toString()).toContain('END SELECT');
    });

    it('SelectCaseStatement should return a non-Continue status from a case body', () =>
    {
        const { context, program, runtime, graphics, audio } = createRuntimeFixture();

        const cases: CaseClause[] = [
            {
                matchType: CaseMatchType.Else,
                statements: [new EndNowStatement()]
            }
        ];

        const select = new SelectCaseStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), cases);
        const status = select.execute(context, graphics, audio, program, runtime);

        expect(status.result).toBe(ExecutionResult.End);
    });

    it('SelectCaseStatement should throw on unknown relational operator', () =>
    {
        const { context, program, runtime, graphics, audio } = createRuntimeFixture();

        const cases: CaseClause[] = [
            {
                matchType: CaseMatchType.Relational,
                relationalOp: '??',
                relationalValue: new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                statements: []
            }
        ];

        const select = new SelectCaseStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), cases);
        expect(() => select.execute(context, graphics, audio, program, runtime)).toThrow('Unknown relational operator');
    });

    it('TryStatement should execute tryBody and render catch/finally in toString', () =>
    {
        const { context, program, runtime, graphics, audio } = createRuntimeFixture();

        const catches: CatchClause[] = [
            { variableName: null, body: [new CaseStatement()] }
        ];

        const stmt = new TryStatement(
            [new AssignIntStatement('x%', 1)],
            catches,
            [new FinallyStatement()]
        );

        const status = stmt.execute(context, graphics, audio, program, runtime);
        expect(status.result).toBe(ExecutionResult.Continue);
        expect(stmt.toString()).toContain('TRY');
        expect(stmt.toString()).toContain('CATCH');
        expect(stmt.toString()).toContain('FINALLY');
        expect(stmt.toString()).toContain('END TRY');
    });

    it('TryStatement should return early on non-Continue statement', () =>
    {
        const { context, program, runtime, graphics, audio } = createRuntimeFixture();
        const stmt = new TryStatement([new EndNowStatement()], [], null);
        const status = stmt.execute(context, graphics, audio, program, runtime);
        expect(status.result).toBe(ExecutionResult.End);
    });

    it('Basic marker statements should execute and stringify', () =>
    {
        const { context, program, runtime, graphics, audio } = createRuntimeFixture();

        expect(new CaseStatement().execute(context, graphics, audio, program, runtime).result).toBe(ExecutionResult.Continue);
        expect(new CatchStatement().execute(context, graphics, audio, program, runtime).result).toBe(ExecutionResult.Continue);
        expect(new FinallyStatement().execute(context, graphics, audio, program, runtime).result).toBe(ExecutionResult.Continue);

        expect(new CaseStatement().toString()).toBe('CASE');
        expect(new CatchStatement().toString()).toBe('CATCH');
        expect(new FinallyStatement().toString()).toBe('FINALLY');
    });
});

