import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

/**
 * Options supported by the `SET` statement.
 */
export enum SetOption
{
    LineSpacingOn,
    LineSpacingOff,
    TextWrapOn,
    TextWrapOff,
    AudioOn,
    AudioOff
}

/**
 * Implements the `SET` statement.
 */
export class SetStatement extends Statement
{
    /**
     * Option selected by the statement.
     */
    public readonly option: SetOption;

    /**
     * Optional numeric value for options that accept a value (currently unused).
     */
    public readonly value: number | null;

    /**
     * Create a new `SET` statement.
     *
     * @param option Option selected by the statement.
     * @param value Optional numeric value.
     */
    public constructor(option: SetOption, value: number | null = null)
    {
        super();
        this.option = option;
        this.value = value;
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
        // Dispatch option to graphics (line spacing, text wrap) or audio (muted) settings.
        switch (this.option)
        {
            case SetOption.LineSpacingOn:
                graphics.setLineSpacing(true);
                break;
            case SetOption.LineSpacingOff:
                graphics.setLineSpacing(false);
                break;
            case SetOption.TextWrapOn:
                graphics.setTextWrap(true);
                break;
            case SetOption.TextWrapOff:
                graphics.setTextWrap(false);
                break;
            case SetOption.AudioOn:
                audio.setMuted(false);
                break;
            case SetOption.AudioOff:
                audio.setMuted(true);
                break;
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        switch (this.option)
        {
            case SetOption.LineSpacingOn:
                return 'SET LINE SPACING ON';
            case SetOption.LineSpacingOff:
                return 'SET LINE SPACING OFF';
            case SetOption.TextWrapOn:
                return 'SET TEXT WRAP ON';
            case SetOption.TextWrapOff:
                return 'SET TEXT WRAP OFF';
            case SetOption.AudioOn:
                return 'SET AUDIO ON';
            case SetOption.AudioOff:
                return 'SET AUDIO OFF';
            default:
                return 'SET';
        }
    }
}
