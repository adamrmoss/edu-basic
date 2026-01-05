import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class ShiftStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly targetVariable: string | null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const array = context.getVariable(this.arrayVariable);
        
        if (array.type !== 'array')
        {
            throw new Error(`SHIFT: ${this.arrayVariable} is not an array`);
        }
        
        const arrayData = array.value as any[];
        
        if (arrayData.length === 0)
        {
            throw new Error(`SHIFT: ${this.arrayVariable} is empty`);
        }
        
        const value = arrayData.shift();
        
        if (this.targetVariable)
        {
            context.setVariable(this.targetVariable, value);
        }
        
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        if (this.targetVariable)
        {
            return `SHIFT ${this.arrayVariable}, ${this.targetVariable}`;
        }

        return `SHIFT ${this.arrayVariable}`;
    }
}

