import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class VolumeStatement extends Statement
{
    public constructor(
        public readonly level: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement VOLUME statement
        // - Evaluate volume level (0.0 to 1.0)
        // - Set global audio volume
        throw new Error('VOLUME statement not yet implemented');
    }

    public toString(): string
    {
        return `VOLUME ${this.level.toString()}`;
    }
}

