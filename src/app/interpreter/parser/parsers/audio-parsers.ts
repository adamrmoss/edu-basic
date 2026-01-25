import { Expression } from '../../../../lang/expressions/expression';
import { PlayStatement, TempoStatement, VoiceStatement, VolumeStatement } from '../../../../lang/statements/audio';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';

export class AudioParsers
{
    public static parseTempo(context: ParserContext): TempoStatement
    {
        context.consume(TokenType.Keyword, 'TEMPO');
        
        const bpm = context.parseExpression();
        
        return new TempoStatement(bpm);
    }

    public static parseVolume(context: ParserContext): VolumeStatement
    {
        context.consume(TokenType.Keyword, 'VOLUME');
        
        const level = context.parseExpression();
        
        return new VolumeStatement(level);
    }

    public static parseVoice(context: ParserContext): VoiceStatement
    {
        context.consume(TokenType.Keyword, 'VOICE');
        
        const voiceNumber = context.parseExpression();
        
        let preset: Expression | null = null;
        let noiseCode: Expression | null = null;
        let adsrPreset: number | null = null;
        let adsrCustom: Expression[] | null = null;
        
        if (context.matchKeyword('PRESET'))
        {
            preset = context.parseExpression();
        }
        else if (context.matchKeyword('WITH'))
        {
            noiseCode = context.parseExpression();
        }
        
        if (context.matchKeyword('ADSR'))
        {
            if (context.matchKeyword('PRESET'))
            {
                adsrPreset = parseInt(context.consume(TokenType.Integer, 'ADSR preset number').value);
            }
            else
            {
                adsrCustom = [];
                for (let i = 0; i < 4; i++)
                {
                    adsrCustom.push(context.parseExpression());
                }
            }
        }
        
        return new VoiceStatement(voiceNumber, preset, noiseCode, adsrPreset, adsrCustom);
    }

    public static parsePlay(context: ParserContext): PlayStatement
    {
        context.consume(TokenType.Keyword, 'PLAY');
        
        const voiceNumber = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const mml = context.parseExpression();
        
        return new PlayStatement(voiceNumber, mml);
    }
}
