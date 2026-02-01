import { EduBasicType } from '@/lang/edu-basic-value';
import { BinaryExpression, BinaryOperator, BinaryOperatorCategory, LiteralExpression, VariableExpression } from '@/lang/expressions';
import { ExecutionResult } from '@/lang/statements/statement';

import { LetStatement } from '@/lang/statements/variables';
import {
    CaseStatement,
    CatchClause,
    CatchStatement,
    ContinueStatement,
    ContinueTarget,
    DoLoopStatement,
    DoLoopVariant,
    ElseIfStatement,
    ElseStatement,
    EndStatement,
    EndType,
    ExitStatement,
    ExitTarget,
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
    WhileStatement,
    FinallyStatement
} from '@/lang/statements/control-flow';

import { createLetIntStatement, createRuntimeFixture } from './program-execution-test-fixtures';

function createIncrementIntStatement(variableName: string): LetStatement
{
    return new LetStatement(
        variableName,
        new BinaryExpression(
            new VariableExpression(variableName),
            BinaryOperator.Add,
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            BinaryOperatorCategory.Arithmetic
        )
    );
}

describe('Control-flow statements (program execution)', () =>
{
    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    describe('Flat program stepping', () =>
    {
        it('IF/ELSEIF/ELSE/END IF should select the first matching branch', () =>
        {
            const { context, program, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            program.appendLine(new IfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), [], [], null)); // 0
            program.appendLine(createLetIntStatement('x%', 1)); // 1 (then)
            program.appendLine(new ElseIfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }))); // 2
            program.appendLine(createLetIntStatement('x%', 2)); // 3 (elseif)
            program.appendLine(new ElseStatement()); // 4
            program.appendLine(createLetIntStatement('x%', 3)); // 5 (else)
            program.appendLine(new EndStatement(EndType.If)); // 6

            for (let i = 0; i < 10; i++)
            {
                runtime.executeStep();
                if (context.getProgramCounter() >= 7)
                {
                    break;
                }
            }

            expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 2 });
        });

        it('FOR/NEXT should iterate in a flat program', () =>
        {
            const { context, program, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            context.setVariable('count%', { type: EduBasicType.Integer, value: 0 }, false);

            program.appendLine(new ForStatement(
                'i%',
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                null,
                []
            )); // 0
            program.appendLine(createIncrementIntStatement('count%')); // 1
            program.appendLine(new NextStatement('i%')); // 2

            for (let i = 0; i < 20; i++)
            {
                runtime.executeStep();
                if (context.getProgramCounter() >= 3)
                {
                    break;
                }
            }

            expect(context.getVariable('count%')).toEqual({ type: EduBasicType.Integer, value: 3 });
            expect(context.getProgramCounter()).toBe(3);
        });

        it('CONTINUE FOR should jump to NEXT', () =>
        {
            const { context, program, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            context.setVariable('count%', { type: EduBasicType.Integer, value: 0 }, false);

            program.appendLine(new ForStatement(
                'i%',
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                null,
                []
            )); // 0
            program.appendLine(createIncrementIntStatement('count%')); // 1
            program.appendLine(new ContinueStatement(ContinueTarget.For)); // 2
            program.appendLine(createLetIntStatement('skipped%', 1)); // 3
            program.appendLine(new NextStatement('i%')); // 4

            for (let i = 0; i < 30; i++)
            {
                runtime.executeStep();
                if (context.getProgramCounter() >= 5)
                {
                    break;
                }
            }

            expect(context.getVariable('count%')).toEqual({ type: EduBasicType.Integer, value: 3 });
            expect(context.getVariable('skipped%')).toEqual({ type: EduBasicType.Integer, value: 0 });
        });

        it('EXIT FOR should exit only the innermost FOR in nested loops', () =>
        {
            const { context, program, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            context.setVariable('outerCount%', { type: EduBasicType.Integer, value: 0 }, false);
            context.setVariable('innerCount%', { type: EduBasicType.Integer, value: 0 }, false);

            program.appendLine(new ForStatement(
                'i%',
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                null,
                []
            )); // 0

            program.appendLine(new ForStatement(
                'j%',
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.Integer, value: 5 }),
                null,
                []
            )); // 1

            program.appendLine(createIncrementIntStatement('innerCount%')); // 2
            program.appendLine(new ExitStatement(ExitTarget.For)); // 3 (exit inner loop)
            program.appendLine(new NextStatement('j%')); // 4

            program.appendLine(createIncrementIntStatement('outerCount%')); // 5 (runs after inner loop)
            program.appendLine(new NextStatement('i%')); // 6

            for (let step = 0; step < 200; step++)
            {
                runtime.executeStep();
                if (context.getProgramCounter() >= 7)
                {
                    break;
                }
            }

            expect(context.getVariable('innerCount%')).toEqual({ type: EduBasicType.Integer, value: 3 });
            expect(context.getVariable('outerCount%')).toEqual({ type: EduBasicType.Integer, value: 3 });
            expect(context.getProgramCounter()).toBe(7);
        });

        it('WHILE/WEND should loop and stop when condition becomes false', () =>
        {
            const { context, program, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            context.setVariable('flag%', { type: EduBasicType.Integer, value: 1 }, false);
            context.setVariable('count%', { type: EduBasicType.Integer, value: 0 }, false);

            program.appendLine(new WhileStatement(new VariableExpression('flag%'), [])); // 0
            program.appendLine(createIncrementIntStatement('count%')); // 1
            program.appendLine(new IfStatement(
                new BinaryExpression(
                    new VariableExpression('count%'),
                    BinaryOperator.GreaterThanOrEqual,
                    new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                    BinaryOperatorCategory.Comparison
                ),
                [],
                [],
                null
            )); // 2
            program.appendLine(createLetIntStatement('flag%', 0)); // 3
            program.appendLine(new EndStatement(EndType.If)); // 4
            program.appendLine(new WendStatement()); // 5

            for (let i = 0; i < 50; i++)
            {
                runtime.executeStep();
                if (context.getProgramCounter() >= 6)
                {
                    break;
                }
            }

            expect(context.getVariable('count%')).toEqual({ type: EduBasicType.Integer, value: 3 });
            expect(context.getProgramCounter()).toBe(6);
        });

        it('EXIT WHILE should jump past WEND and pop the loop frame', () =>
        {
            const { context, program, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            program.appendLine(new WhileStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [])); // 0
            program.appendLine(new ExitStatement(ExitTarget.While)); // 1
            program.appendLine(createLetIntStatement('x%', 1)); // 2
            program.appendLine(new WendStatement()); // 3

            runtime.executeStep();
            expect(context.getProgramCounter()).toBe(1);

            runtime.executeStep();
            expect(context.getProgramCounter()).toBe(4);

            expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 0 });
        });
    });

    describe('Additional program execution coverage', () =>
    {
        it('GOTO should jump to a label', () =>
        {
            const { context, program, runtime, fileSystem } = createRuntimeFixture();
            fileSystem.clear();

            context.setVariable('x%', { type: EduBasicType.Integer, value: 0 }, false);

            program.appendLine(new GotoStatement('Target'));
            program.appendLine(createLetIntStatement('x%', 1));
            program.appendLine(new LabelStatement('Target'));
            program.appendLine(createLetIntStatement('x%', 2));
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
            program.appendLine(createLetIntStatement('after%', 1));
            program.appendLine(new EndStatement(EndType.Program));
            program.appendLine(new LabelStatement('SubLabel'));
            program.appendLine(createLetIntStatement('inSub%', 1));
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
            program.appendLine(createLetIntStatement('inside%', 1));
            program.appendLine(new EndStatement(EndType.Sub));
            program.appendLine(createLetIntStatement('after%', 1));
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
            program.appendLine(createLetIntStatement('body%', 1));
            program.appendLine(new NextStatement('i%'));
            program.appendLine(createLetIntStatement('after%', 1));
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
            const { program, runtime } = createRuntimeFixture();
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
            program.appendLine(createLetIntStatement('x%', 1));
            program.appendLine(new ElseStatement());
            program.appendLine(createLetIntStatement('x%', 2));
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
            program.appendLine(createLetIntStatement('x%', 1));
            program.appendLine(new ElseStatement());
            program.appendLine(createLetIntStatement('x%', 2));
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
            program.appendLine(createIncrementIntStatement('count%'));
            program.appendLine(new IfStatement(
                new BinaryExpression(
                    new VariableExpression('count%'),
                    BinaryOperator.GreaterThanOrEqual,
                    new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
                    BinaryOperatorCategory.Comparison
                ),
                [],
                [],
                null
            ));
            program.appendLine(createLetIntStatement('flag%', 1));
            program.appendLine(new EndStatement(EndType.If));
            program.appendLine(new UendStatement());
            program.appendLine(createLetIntStatement('after%', 1));
            program.appendLine(new EndStatement(EndType.Program));

            for (let i = 0; i < 100; i++)
            {
                runtime.executeStep();
                if (context.getProgramCounter() >= 8)
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
            program.appendLine(createIncrementIntStatement('count%'));
            program.appendLine(new IfStatement(
                new BinaryExpression(
                    new VariableExpression('count%'),
                    BinaryOperator.GreaterThanOrEqual,
                    new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                    BinaryOperatorCategory.Comparison
                ),
                [],
                [],
                null
            ));
            program.appendLine(createLetIntStatement('flag%', 0));
            program.appendLine(new EndStatement(EndType.If));
            program.appendLine(new LoopStatement());
            program.appendLine(new EndStatement(EndType.Program));

            for (let i = 0; i < 50; i++)
            {
                runtime.executeStep();
                if (context.getProgramCounter() >= 7)
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

        it('SELECT CASE / CASE / END SELECT should route to the first matching CASE and skip the rest', () =>
        {
            const { context, program, runtime } = createRuntimeFixture();

            program.appendLine(createLetIntStatement('x%', 0)); // 0
            program.appendLine(new SelectCaseStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 2 }))); // 1
            program.appendLine(new CaseStatement(false, [{ type: 'value', value: new LiteralExpression({ type: EduBasicType.Integer, value: 1 }) }])); // 2
            program.appendLine(createLetIntStatement('x%', 10)); // 3
            program.appendLine(new CaseStatement(false, [
                { type: 'value', value: new LiteralExpression({ type: EduBasicType.Integer, value: 2 }) },
                { type: 'value', value: new LiteralExpression({ type: EduBasicType.Integer, value: 3 }) }
            ])); // 4
            program.appendLine(createLetIntStatement('x%', 20)); // 5
            program.appendLine(new CaseStatement(false, [{ type: 'relational', op: '>=', value: new LiteralExpression({ type: EduBasicType.Integer, value: 99 }) }])); // 6
            program.appendLine(createLetIntStatement('x%', 30)); // 7
            program.appendLine(new CaseStatement(true, [])); // 8
            program.appendLine(createLetIntStatement('x%', 40)); // 9
            program.appendLine(new EndStatement(EndType.Select)); // 10
            program.appendLine(new EndStatement(EndType.Program)); // 11

            for (let i = 0; i < 50; i++)
            {
                const result = runtime.executeStep();
                if (result === ExecutionResult.End)
                {
                    break;
                }
            }

            expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 20 });
        });

        it('SELECT CASE should fall through to CASE ELSE when nothing matches', () =>
        {
            const { context, program, runtime } = createRuntimeFixture();

            program.appendLine(createLetIntStatement('x%', 0)); // 0
            program.appendLine(new SelectCaseStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }))); // 1
            program.appendLine(new CaseStatement(false, [{ type: 'value', value: new LiteralExpression({ type: EduBasicType.Integer, value: 1 }) }])); // 2
            program.appendLine(createLetIntStatement('x%', 10)); // 3
            program.appendLine(new CaseStatement(false, [{ type: 'range', start: new LiteralExpression({ type: EduBasicType.Integer, value: 2 }), end: new LiteralExpression({ type: EduBasicType.Integer, value: 3 }) }])); // 4
            program.appendLine(createLetIntStatement('x%', 20)); // 5
            program.appendLine(new CaseStatement(true, [])); // 6
            program.appendLine(createLetIntStatement('x%', 99)); // 7
            program.appendLine(new EndStatement(EndType.Select)); // 8
            program.appendLine(new EndStatement(EndType.Program)); // 9

            for (let i = 0; i < 50; i++)
            {
                const result = runtime.executeStep();
                if (result === ExecutionResult.End)
                {
                    break;
                }
            }

            expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 99 });
        });

        it('CaseStatement should throw on unknown relational operator', () =>
        {
            const { context, program, runtime, graphics, audio } = createRuntimeFixture();

            const caseStmt = new CaseStatement(false, [{ type: 'relational', op: '??', value: new LiteralExpression({ type: EduBasicType.Integer, value: 1 }) }]);
            expect(() => caseStmt.execute(context, graphics, audio, program, {
                findControlFrame: () => ({
                    type: 'select',
                    startLine: 0,
                    endLine: 1,
                    selectTestValue: { type: EduBasicType.Integer, value: 1 },
                    selectMatched: false
                })
            } as any)).toThrow('Unknown relational operator: ??');
        });

        it('TryStatement should execute tryBody and render catch/finally in toString', () =>
        {
            const { context, program, runtime, graphics, audio } = createRuntimeFixture();

            const catches: CatchClause[] = [
                { variableName: null, body: [createLetIntStatement('caught%', 1)] }
            ];

            const stmt = new TryStatement(
                [createLetIntStatement('x%', 1)],
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
            const stmt = new TryStatement([new EndStatement(EndType.Program)], [], null);
            const status = stmt.execute(context, graphics, audio, program, runtime);
            expect(status.result).toBe(ExecutionResult.End);
        });

        it('Basic marker statements should execute and stringify', () =>
        {
            const { context, program, runtime, graphics, audio } = createRuntimeFixture();

            expect(new CatchStatement().execute(context, graphics, audio, program, runtime).result).toBe(ExecutionResult.Continue);
            expect(new FinallyStatement().execute(context, graphics, audio, program, runtime).result).toBe(ExecutionResult.Continue);

            expect(new CatchStatement().toString()).toBe('CATCH');
            expect(new FinallyStatement().toString()).toBe('FINALLY');
        });
    });
});

