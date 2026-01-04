import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class RandomizeStatement extends Statement
{
    public constructor(
        public readonly seed: number | null = null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement RANDOMIZE statement
        // - Initialize random number generator with optional seed
        // - If no seed provided, use current time
        throw new Error('RANDOMIZE statement not yet implemented');
    }

    public toString(): string
    {
        if (this.seed !== null)
        {
            return `RANDOMIZE ${this.seed}`;
        }

        return 'RANDOMIZE';
    }
}

