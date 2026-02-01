import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { valueToString } from '../../edu-basic-value';

export class PrintStatement extends Statement
{
    public constructor(
        public readonly expressions: Expression[],
        public readonly newline: boolean = true
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
        const values = this.expressions.map(expr => expr.evaluate(context));

        for (let i = 0; i < values.length; i++)
        {
            const value = values[i];
            const text = valueToString(value);
            graphics.printText(text);
        }

        if (this.newline)
        {
            graphics.newLine();
        }

        graphics.flush();
        runtime.requestTabSwitch('output');

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = 'PRINT';

        if (this.expressions.length > 0)
        {
            result += ' ' + this.expressions.map(expr => expr.toString()).join(', ');
        }

        if (!this.newline)
        {
            result += ';';
        }

        return result;
    }
}
