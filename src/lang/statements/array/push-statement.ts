import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class PushStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly value: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const valueResult = this.value.evaluate(context);
        const array = context.getVariable(this.arrayVariable);
        
        if (array.type !== 'array')
        {
            throw new Error(`PUSH: ${this.arrayVariable} is not an array`);
        }
        
        (array.value as any[]).push(valueResult);
        
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return `PUSH ${this.arrayVariable}, ${this.value.toString()}`;
    }
}

