import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class RandomizeStatement extends Statement
{
    public constructor(
        public readonly seed: Expression | null = null
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
        let seed: number = Date.now();

        if (this.seed !== null)
        {
            const seedValue = this.seed.evaluate(context);
            if (seedValue.type !== EduBasicType.Integer && seedValue.type !== EduBasicType.Real)
            {
                throw new Error('RANDOMIZE: seed must be a number');
            }

            seed = Math.floor(seedValue.value as number);
        }

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
            return `RANDOMIZE ${this.seed.toString()}`;
        }

        return 'RANDOMIZE';
    }
}
