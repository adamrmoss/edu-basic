import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { valueToString } from '../../edu-basic-value';

export class ConsoleStatement extends Statement
{
    public constructor(
        public readonly expression: Expression
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
        const consoleService = runtime.getConsoleService();

        if (!consoleService)
        {
            return { result: ExecutionResult.Continue };
        }

        const value = this.expression.evaluate(context);
        const text = valueToString(value);

        consoleService.printOutput(text);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `CONSOLE ${this.expression.toString()}`;
    }
}
