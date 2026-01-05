import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class PlayStatement extends Statement
{
    public constructor(
        public readonly voiceNumber: Expression,
        public readonly mml: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const voiceValue = this.voiceNumber.evaluate(context);
        const mmlValue = this.mml.evaluate(context);
        
        const voice = voiceValue.type === 'integer' || voiceValue.type === 'real' ? Math.floor(voiceValue.value as number) : 0;
        const mmlString = mmlValue.type === 'string' ? mmlValue.value as string : '';
        
        audio.playSequence(mmlString);
        
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return `PLAY ${this.voiceNumber.toString()}, ${this.mml.toString()}`;
    }
}

