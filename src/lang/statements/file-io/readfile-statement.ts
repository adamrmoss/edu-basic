import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class ReadfileStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly filename: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        throw new Error('READFILE statement not yet implemented');
    }

    public toString(): string
    {
        return `READFILE ${this.variableName} FROM ${this.filename.toString()}`;
    }
}

