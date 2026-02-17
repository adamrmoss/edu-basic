import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `PUSH` statement.
 */
export class PushStatement extends Statement
{
    /**
     * Array variable name.
     */
    public readonly arrayVariable: string;

    /**
     * Expression producing the pushed value.
     */
    public readonly value: Expression;

    /**
     * Create a new `PUSH` statement.
     *
     * @param arrayVariable Array variable name.
     * @param value Expression producing the pushed value.
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
        
        if (array.type !== EduBasicType.Array)
        {
            throw new Error(`PUSH: ${this.arrayVariable} is not an array`);
        }

        if (array.dimensions && array.dimensions.length > 1)
        {
            throw new Error(`PUSH: ${this.arrayVariable} is multi-dimensional`);
        }

        // Append value and keep single-dimension length in sync.
        array.value.push(valueResult);

        if (array.dimensions && array.dimensions.length === 1)
        {
            array.dimensions[0].length = array.value.length;
        }
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `PUSH ${this.arrayVariable}, ${this.value.toString()}`;
    }
}
