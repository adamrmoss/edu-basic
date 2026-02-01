import { Expression } from '../../expressions/expression';
import { PlayStatement, TempoStatement, VoiceStatement, VolumeStatement } from '../../statements/audio';
import { TokenType } from '../tokenizer';
import { ParserContext } from './parser-context';
import { ParseResult, success } from '../parse-result';

export class AudioParsers
{
    public static parseTempo(context: ParserContext): ParseResult<TempoStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // TEMPO bpmExpr
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
        // Spec: docs/edu-basic-language.md
        //
        // VOLUME levelExpr
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
        // Spec: docs/edu-basic-language.md
        //
        // VOICE voiceNumberExpr INSTRUMENT instrumentExpr
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

        const instrumentKeywordResult = context.consume(TokenType.Keyword, 'INSTRUMENT');
        if (!instrumentKeywordResult.success)
        {
            return instrumentKeywordResult;
        }

        const instrumentResult = context.parseExpression();
        if (!instrumentResult.success)
        {
            return instrumentResult;
        }

        return success(new VoiceStatement(voiceNumberResult.value, instrumentResult.value));
    }

    public static parsePlay(context: ParserContext): ParseResult<PlayStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // PLAY voiceNumberExpr, mmlStringExpr
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
