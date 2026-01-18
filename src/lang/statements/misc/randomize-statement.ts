import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class RandomizeStatement extends Statement
{
    public constructor(
        public readonly seed: number | null = null
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

    public override toString(): string
    {
        if (this.seed !== null)
        {
            return `RANDOMIZE ${this.seed}`;
        }

        return 'RANDOMIZE';
    }
}
