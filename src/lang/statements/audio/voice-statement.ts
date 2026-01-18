import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

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
        const voice = voiceValue.type === EduBasicType.Integer || voiceValue.type === EduBasicType.Real ? Math.floor(voiceValue.value as number) : 0;
        
        let preset: number | null = null;
        let noiseCode: number | null = null;

        if (this.preset)
        {
            const presetValue = this.preset.evaluate(context);
            preset = presetValue.type === EduBasicType.Integer || presetValue.type === EduBasicType.Real ? Math.floor(presetValue.value as number) : null;
        }

        if (this.noiseCode)
        {
            const noiseCodeValue = this.noiseCode.evaluate(context);
            noiseCode = noiseCodeValue.type === EduBasicType.Integer || noiseCodeValue.type === EduBasicType.Real ? Math.floor(noiseCodeValue.value as number) : null;
        }

        let adsrCustom: number[] | null = null;

        if (this.adsrCustom)
        {
            adsrCustom = this.adsrCustom.map(expr =>
            {
                const value = expr.evaluate(context);
                return value.type === EduBasicType.Integer || value.type === EduBasicType.Real ? (value.value as number) : 0;
            });
        }

        audio.configureVoice(voice, preset, noiseCode, this.adsrPreset, adsrCustom);
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
