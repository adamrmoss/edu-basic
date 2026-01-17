import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class PopStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly targetVariable: string | null
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
        const array = context.getVariable(this.arrayVariable);
        
        if (array.type !== EduBasicType.Array)
        {
            throw new Error(`POP: ${this.arrayVariable} is not an array`);
        }
        
        const arrayData = array.value as any[];
        
        if (arrayData.length === 0)
        {
            throw new Error(`POP: ${this.arrayVariable} is empty`);
        }
        
        const value = arrayData.pop();
        
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
            return `POP ${this.arrayVariable}, ${this.targetVariable}`;
        }

        return `POP ${this.arrayVariable}`;
    }
}

