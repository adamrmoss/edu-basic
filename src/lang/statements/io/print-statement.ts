import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class PrintStatement extends Statement
{
    public constructor(
        public readonly expressions: Expression[],
        public readonly newline: boolean = true
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const values = this.expressions.map(expr => expr.evaluate(context));

        for (let i = 0; i < values.length; i++)
        {
            const value = values[i];
            const text = value.value?.toString() ?? '';
            graphics.printText(text);

            if (i < values.length - 1)
            {
                graphics.printText(' ');
            }
        }

        if (this.newline)
        {
            graphics.newLine();
        }

        graphics.flush();

        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        let result = 'PRINT';

        if (this.expressions.length > 0)
        {
            result += ' ' + this.expressions.map(expr => expr.toString()).join('; ');
        }

        if (!this.newline)
        {
            result += ';';
        }

        return result;
    }
}
