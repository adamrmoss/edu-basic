import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class LetStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly value: Expression
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
        const evaluatedValue = this.value.evaluate(context);
        context.setVariable(this.variableName, evaluatedValue, false);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `LET ${this.variableName} = ${this.value.toString()}`;
    }
}
