import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class PlayStatement extends Statement
{
    public constructor(
        public readonly voiceNumber: Expression,
        public readonly mml: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement PLAY statement
        // - Evaluate voice number and MML string
        // - Parse and queue MML notes for playback
        throw new Error('PLAY statement not yet implemented');
    }

    public toString(): string
    {
        return `PLAY ${this.voiceNumber.toString()}, ${this.mml.toString()}`;
    }
}

