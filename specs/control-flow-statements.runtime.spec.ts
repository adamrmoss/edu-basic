import { EduBasicType } from '../src/lang/edu-basic-value';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { VariableExpression } from '../src/lang/expressions/special/variable-expression';
import { ExecutionContext } from '../src/lang/execution-context';
import { Program } from '../src/lang/program';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { Graphics } from '../src/lang/graphics';
import { Audio } from '../src/lang/audio';

import { ExecutionResult, Statement, ExecutionStatus } from '../src/lang/statements/statement';
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

import { AssignIntStatement, createRuntimeFixture } from './statement-runtime-test-helpers';

class IncrementIntStatement extends Statement
{
    public constructor(private readonly name: string)
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
        const current = context.getVariable(this.name);
        if (current.type !== EduBasicType.Integer)
        {
            throw new Error('Expected integer');
        }

        context.setVariable(this.name, { type: EduBasicType.Integer, value: (current.value as number) + 1 }, false);
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `INC ${this.name}`;
    }
}

class StopAfterNStatement extends Statement
{
    public constructor(
        private readonly counterName: string,
        private readonly flagName: string,
        private readonly stopAt: number
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
            context.setVariable(this.flagName, { type: EduBasicType.Integer, value: 0 }, false);
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `STOPAFTER ${this.counterName} ${this.stopAt}`;
    }
}

describe('Control-flow statements (flat runtime)', () =>
{
    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    it('IF/ELSEIF/ELSE/END IF should select the first matching branch', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        program.appendLine(new IfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 0 }), [], [], null)); // 0
        program.appendLine(new AssignIntStatement('x%', 1)); // 1 (then)
        program.appendLine(new ElseIfStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }))); // 2
        program.appendLine(new AssignIntStatement('x%', 2)); // 3 (elseif)
        program.appendLine(new ElseStatement()); // 4
        program.appendLine(new AssignIntStatement('x%', 3)); // 5 (else)
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
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('count%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
            null,
            []
        )); // 0
        program.appendLine(new IncrementIntStatement('count%')); // 1
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
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('count%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new ForStatement(
            'i%',
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
            new LiteralExpression({ type: EduBasicType.Integer, value: 3 }),
            null,
            []
        )); // 0
        program.appendLine(new IncrementIntStatement('count%')); // 1
        program.appendLine(new ContinueStatement(ContinueTarget.For)); // 2
        program.appendLine(new AssignIntStatement('skipped%', 1)); // 3
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
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.setVariable('flag%', { type: EduBasicType.Integer, value: 1 }, false);
        context.setVariable('count%', { type: EduBasicType.Integer, value: 0 }, false);

        program.appendLine(new WhileStatement(new VariableExpression('flag%'), [])); // 0
        program.appendLine(new StopAfterNStatement('count%', 'flag%', 3)); // 1
        program.appendLine(new WendStatement()); // 2

        for (let i = 0; i < 50; i++)
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

    it('EXIT WHILE should jump past WEND and pop the loop frame', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        program.appendLine(new WhileStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), [])); // 0
        program.appendLine(new ExitStatement(ExitTarget.While)); // 1
        program.appendLine(new AssignIntStatement('x%', 1)); // 2
        program.appendLine(new WendStatement()); // 3

        runtime.executeStep();
        expect(context.getProgramCounter()).toBe(1);

        runtime.executeStep();
        expect(context.getProgramCounter()).toBe(4);

        expect(context.getVariable('x%')).toEqual({ type: EduBasicType.Integer, value: 0 });
    });
});

