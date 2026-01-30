import { EduBasicType } from '../src/lang/edu-basic-value';
import { BinaryExpression, BinaryOperator, BinaryOperatorCategory, LiteralExpression, VariableExpression } from '../src/lang/expressions';

import { LetStatement } from '../src/lang/statements/variables';
import {
    ContinueStatement,
    ContinueTarget,
    ElseIfStatement,
    ElseStatement,
    EndStatement,
    EndType,
    ExitStatement,
    ExitTarget,
    ForStatement,
    IfStatement,
    NextStatement,
    WendStatement,
    WhileStatement
} from '../src/lang/statements/control-flow';

import { createLetIntStatement, createRuntimeFixture } from './statement-runtime-test-helpers';

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

describe('Control-flow statements (flat runtime)', () =>
{
    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

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

