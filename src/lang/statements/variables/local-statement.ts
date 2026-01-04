import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class LocalStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly value: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement local scope tracking when SUB procedures are added
        // For now, behaves like LET
        const evaluatedValue = this.value.evaluate(context);
        context.setVariable(this.variableName, evaluatedValue, true);

        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return `LOCAL ${this.variableName} = ${this.value.toString()}`;
    }
}

