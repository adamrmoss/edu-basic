import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Implements the `LOCAL` statement.
 */
export class LocalStatement extends Statement
{
    /**
     * Local variable name.
     */
    public readonly variableName: string;

    /**
     * Expression producing the assigned value.
     */
    public readonly value: Expression;

    /**
     * Create a new `LOCAL` statement.
     *
     * @param variableName Local variable name.
     * @param value Expression producing the assigned value.
     */
    public constructor(variableName: string, value: Expression)
    {
        super();
        this.variableName = variableName;
        this.value = value;
    }

    /**
     * Execute the statement.
     *
     * @returns Execution status.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const evaluatedValue = this.value.evaluate(context);
        context.setVariable(this.variableName, evaluatedValue, true);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `LOCAL ${this.variableName} = ${this.value.toString()}`;
    }
}
