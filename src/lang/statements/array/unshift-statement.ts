import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class UnshiftStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
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
        const valueResult = this.value.evaluate(context);
        const array = context.getVariable(this.arrayVariable);
        
        if (array.type !== EduBasicType.Array)
        {
            throw new Error(`UNSHIFT: ${this.arrayVariable} is not an array`);
        }
        
        (array.value as any[]).unshift(valueResult);
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `UNSHIFT ${this.arrayVariable}, ${this.value.toString()}`;
    }
}

