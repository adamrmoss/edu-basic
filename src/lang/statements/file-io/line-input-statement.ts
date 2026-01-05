import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class LineInputStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly fileHandle: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('LINE INPUT statement not yet implemented');
    }

    public toString(): string
    {
        return `LINE INPUT ${this.variableName} FROM #${this.fileHandle.toString()}`;
    }
}

