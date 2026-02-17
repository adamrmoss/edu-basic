import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `UNSHIFT` statement.
 */
export class UnshiftStatement extends Statement
{
    /**
     * Array variable name.
     */
    public readonly arrayVariable: string;

    /**
     * Expression producing the value inserted at the front.
     */
    public readonly value: Expression;

    /**
     * Create a new `UNSHIFT` statement.
     *
     * @param arrayVariable Array variable name.
     * @param value Expression producing the inserted value.
     */
    public constructor(arrayVariable: string, value: Expression)
    {
        super();
        this.arrayVariable = arrayVariable;
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
        const valueResult = this.value.evaluate(context);
        const array = context.getVariable(this.arrayVariable);

        // Validate single-dimension array; insert at front and keep length in sync.
        if (array.type !== EduBasicType.Array)
        {
            throw new Error(`UNSHIFT: ${this.arrayVariable} is not an array`);
        }

        if (array.dimensions && array.dimensions.length > 1)
        {
            throw new Error(`UNSHIFT: ${this.arrayVariable} is multi-dimensional`);
        }

        array.value.unshift(valueResult);

        if (array.dimensions && array.dimensions.length === 1)
        {
            array.dimensions[0].length = array.value.length;
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `UNSHIFT ${this.arrayVariable}, ${this.value.toString()}`;
    }
}
