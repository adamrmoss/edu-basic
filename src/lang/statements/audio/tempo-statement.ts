import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class TempoStatement extends Statement
{
    public constructor(
        public readonly bpm: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement TEMPO statement
        // - Evaluate BPM expression
        // - Set audio tempo for PLAY commands
        throw new Error('TEMPO statement not yet implemented');
    }

    public toString(): string
    {
        return `TEMPO ${this.bpm.toString()}`;
    }
}

