import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class TempoStatement extends Statement
{
    public constructor(
        public readonly bpm: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const bpmValue = this.bpm.evaluate(context);
        const bpm = bpmValue.type === 'integer' || bpmValue.type === 'real' ? bpmValue.value as number : 120;
        
        audio.setTempo(bpm);
        
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return `TEMPO ${this.bpm.toString()}`;
    }
}

