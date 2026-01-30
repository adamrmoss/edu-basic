import { EduBasicType } from '../../src/lang/edu-basic-value';
import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { LocalStatement } from '../../src/lang/statements/variables';

import { createRuntimeFixture } from './program-execution-test-fixtures';

describe('Variable statements', () =>
{
    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    it('LOCAL should set local variable when stack frame exists', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        context.pushStackFrame(0);

        const local = new LocalStatement('temp%', new LiteralExpression({ type: EduBasicType.Integer, value: 7 }));
        local.execute(context, graphics, audio, program, runtime);

        expect(context.getVariable('temp%')).toEqual({ type: EduBasicType.Integer, value: 7 });

        context.popStackFrame();
        expect(context.getVariable('temp%')).toEqual({ type: EduBasicType.Integer, value: 0 });
    });
}

