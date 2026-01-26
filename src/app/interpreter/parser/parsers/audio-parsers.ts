import { Expression } from '../../../../lang/expressions/expression';
import { PlayStatement, TempoStatement, VoiceStatement, VolumeStatement } from '../../../../lang/statements/audio';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';
import { ParseResult, success } from '../parse-result';

export class AudioParsers
{
    public static parseTempo(context: ParserContext): ParseResult<TempoStatement>
    {
        const tempoTokenResult = context.consume(TokenType.Keyword, 'TEMPO');
        if (!tempoTokenResult.success)
        {
            return tempoTokenResult;
        }
        
        const bpmResult = context.parseExpression();
        if (!bpmResult.success)
        {
            return bpmResult;
        }
        
        return success(new TempoStatement(bpmResult.value));
    }

    public static parseVolume(context: ParserContext): ParseResult<VolumeStatement>
    {
        const volumeTokenResult = context.consume(TokenType.Keyword, 'VOLUME');
        if (!volumeTokenResult.success)
        {
            return volumeTokenResult;
        }
        
        const levelResult = context.parseExpression();
        if (!levelResult.success)
        {
            return levelResult;
        }
        
        return success(new VolumeStatement(levelResult.value));
    }

    public static parseVoice(context: ParserContext): ParseResult<VoiceStatement>
    {
        const voiceTokenResult = context.consume(TokenType.Keyword, 'VOICE');
        if (!voiceTokenResult.success)
        {
            return voiceTokenResult;
        }
        
        const voiceNumberResult = context.parseExpression();
        if (!voiceNumberResult.success)
        {
            return voiceNumberResult;
        }
        
        let preset: Expression | null = null;
        let noiseCode: Expression | null = null;
        let adsrPreset: number | null = null;
        let adsrCustom: Expression[] | null = null;
        
        if (context.matchKeyword('PRESET'))
        {
            const presetResult = context.parseExpression();
            if (!presetResult.success)
            {
                return presetResult;
            }
            preset = presetResult.value;
        }
        else if (context.matchKeyword('WITH'))
        {
            const noiseCodeResult = context.parseExpression();
            if (!noiseCodeResult.success)
            {
                return noiseCodeResult;
            }
            noiseCode = noiseCodeResult.value;
        }
        
        if (context.matchKeyword('ADSR'))
        {
            if (context.matchKeyword('PRESET'))
            {
                const presetTokenResult = context.consume(TokenType.Integer, 'ADSR preset number');
                if (!presetTokenResult.success)
                {
                    return presetTokenResult;
                }
                adsrPreset = parseInt(presetTokenResult.value.value);
            }
            else
            {
                adsrCustom = [];
                for (let i = 0; i < 4; i++)
                {
                    const exprResult = context.parseExpression();
                    if (!exprResult.success)
                    {
                        return exprResult;
                    }
                    adsrCustom.push(exprResult.value);
                }
            }
        }
        
        return success(new VoiceStatement(voiceNumberResult.value, preset, noiseCode, adsrPreset, adsrCustom));
    }

    public static parsePlay(context: ParserContext): ParseResult<PlayStatement>
    {
        const playTokenResult = context.consume(TokenType.Keyword, 'PLAY');
        if (!playTokenResult.success)
        {
            return playTokenResult;
        }
        
        const voiceNumberResult = context.parseExpression();
        if (!voiceNumberResult.success)
        {
            return voiceNumberResult;
        }
        
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const mmlResult = context.parseExpression();
        if (!mmlResult.success)
        {
            return mmlResult;
        }
        
        return success(new PlayStatement(voiceNumberResult.value, mmlResult.value));
    }
}
