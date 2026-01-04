import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

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

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement VOICE statement
        // - Configure audio voice with timbre and ADSR envelope
        // - Support PRESET, WITH, and ADSR options
        throw new Error('VOICE statement not yet implemented');
    }

    public toString(): string
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

