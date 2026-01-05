import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class LocalStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly value: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const evaluatedValue = this.value.evaluate(context);
        context.setVariable(this.variableName, evaluatedValue, true);

        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return `LOCAL ${this.variableName} = ${this.value.toString()}`;
    }
}

