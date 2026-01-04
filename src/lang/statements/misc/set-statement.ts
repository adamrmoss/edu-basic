import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export enum SetOption
{
    LineSpacingOn,
    LineSpacingOff,
    TextWrapOn,
    TextWrapOff,
    AudioOn,
    AudioOff
}

export class SetStatement extends Statement
{
    public constructor(
        public readonly option: SetOption,
        public readonly value: number | null = null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement SET statement
        // - Apply system settings like line spacing, text wrap, audio, volume
        throw new Error('SET statement not yet implemented');
    }

    public toString(): string
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

