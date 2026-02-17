import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `SHIFT` statement.
 */
export class ShiftStatement extends Statement
{
    /**
     * Array variable name.
     */
    public readonly arrayVariable: string;

    /**
     * Optional target variable name (used with `INTO`).
     */
    public readonly targetVariable: string | null;

    /**
     * Create a new `SHIFT` statement.
     *
     * @param arrayVariable Array variable name.
     * @param targetVariable Optional target variable name.
     */
    public constructor(arrayVariable: string, targetVariable: string | null)
    {
        super();
        this.arrayVariable = arrayVariable;
        this.targetVariable = targetVariable;
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
        const array = context.getVariable(this.arrayVariable);
        
        if (array.type !== EduBasicType.Array)
        {
            throw new Error(`SHIFT: ${this.arrayVariable} is not an array`);
        }

        if (array.dimensions && array.dimensions.length > 1)
        {
            throw new Error(`SHIFT: ${this.arrayVariable} is multi-dimensional`);
        }
        
        const arrayData = array.value;
        
        if (arrayData.length === 0)
        {
            throw new Error(`SHIFT: ${this.arrayVariable} is empty`);
        }
        
        const value = arrayData.shift()!;

        if (array.dimensions && array.dimensions.length === 1)
        {
            array.dimensions[0].length = arrayData.length;
        }
        
        if (this.targetVariable)
        {
            context.setVariable(this.targetVariable, value);
        }
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        if (this.targetVariable)
        {
            return `SHIFT ${this.arrayVariable} INTO ${this.targetVariable}`;
        }

        return `SHIFT ${this.arrayVariable}`;
    }
}
