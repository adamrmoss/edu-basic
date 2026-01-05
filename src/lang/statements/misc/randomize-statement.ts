import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class RandomizeStatement extends Statement
{
    public constructor(
        public readonly seed: number | null = null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const seed = this.seed ?? Date.now();
        Math.random = this.seededRandom(seed);
        
        return { result: ExecutionResult.Continue };
    }
    
    private seededRandom(seed: number): () => number
    {
        let state = seed;
        
        return () =>
        {
            state = (state * 1103515245 + 12345) & 0x7fffffff;
            return state / 0x7fffffff;
        };
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

