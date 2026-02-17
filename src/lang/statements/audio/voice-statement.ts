import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `VOICE` statement.
 */
export class VoiceStatement extends Statement
{
    /**
     * Voice number expression.
     */
    public readonly voiceNumber: Expression;

    /**
     * Instrument expression (program number or name).
     */
    public readonly instrument: Expression;

    /**
     * Create a new `VOICE` statement.
     *
     * @param voiceNumber Voice number expression.
     * @param instrument Instrument expression.
     */
    public constructor(voiceNumber: Expression, instrument: Expression)
    {
        super();
        this.voiceNumber = voiceNumber;
        this.instrument = instrument;
    }

    /**
     * Execute the statement.
     *
     * @returns Execution status.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        // Resolve voice index; set instrument by number or name, then set active voice.
        const voiceValue = this.voiceNumber.evaluate(context);
        const voice = voiceValue.type === EduBasicType.Integer || voiceValue.type === EduBasicType.Real ? Math.floor(voiceValue.value as number) : 0;

        const instrumentValue = this.instrument.evaluate(context);

        switch (instrumentValue.type)
        {
            case EduBasicType.Integer:
            case EduBasicType.Real:
            {
                const programNum = Math.floor(instrumentValue.value as number);
                audio.setVoiceInstrument(voice, programNum);
                break;
            }
            case EduBasicType.String:
            {
                const name = String(instrumentValue.value ?? '').trim();
                audio.setVoiceInstrumentByName(voice, name);
                break;
            }
            default:
                audio.setVoiceInstrument(voice, 0);
                break;
        }

        audio.setVoice(voice);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `VOICE ${this.voiceNumber.toString()} INSTRUMENT ${this.instrument.toString()}`;
    }
}
