import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class VoiceStatement extends Statement
{
    public constructor(
        public readonly voiceNumber: Expression,
        public readonly preset: Expression | null,
        public readonly noiseCode: Expression | null,
        public readonly adsrPreset: number | null,
        public readonly adsrCustom: Expression[] | null
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
        const voiceValue = this.voiceNumber.evaluate(context);
        const voice = voiceValue.type === 'integer' || voiceValue.type === 'real' ? Math.floor(voiceValue.value as number) : 0;
        
        audio.setVoice(voice);
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = `VOICE ${this.voiceNumber.toString()}`;

        if (this.preset)
        {
            result += ` PRESET ${this.preset.toString()}`;
        }

        if (this.noiseCode)
        {
            result += ` WITH ${this.noiseCode.toString()}`;
        }

        if (this.adsrPreset !== null)
        {
            result += ` ADSR PRESET ${this.adsrPreset}`;
        }
        else if (this.adsrCustom)
        {
            result += ` ADSR ${this.adsrCustom.map(e => e.toString()).join(' ')}`;
        }

        return result;
    }
}

