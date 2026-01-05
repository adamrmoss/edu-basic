import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class InputStatement extends Statement
{
    public constructor(
        public readonly variableName: string
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('INPUT statement not yet implemented');
    }

    public toString(): string
    {
        return `INPUT ${this.variableName}`;
    }
}

