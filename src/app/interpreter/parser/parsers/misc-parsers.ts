import { ConsoleStatement, HelpStatement, RandomizeStatement, SetOption, SetStatement, SleepStatement } from '../../../../lang/statements/misc';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';

export class MiscParsers
{
    public static parseSleep(context: ParserContext): SleepStatement
    {
        context.consume(TokenType.Keyword, 'SLEEP');
        
        const milliseconds = context.parseExpression();
        
        return new SleepStatement(milliseconds);
    }

    public static parseSet(context: ParserContext): SetStatement
    {
        context.consume(TokenType.Keyword, 'SET');
        
        const token = context.consume(TokenType.Keyword, 'SET option');
        const option1 = token.value.toUpperCase();
        
        if (option1 === 'LINE')
        {
            context.consume(TokenType.Keyword, 'SPACING');
            const onOff = context.consume(TokenType.Keyword, 'ON or OFF').value.toUpperCase();
            
            return new SetStatement(
                onOff === 'ON' ? SetOption.LineSpacingOn : SetOption.LineSpacingOff
            );
        }
        else if (option1 === 'TEXT')
        {
            context.consume(TokenType.Keyword, 'WRAP');
            const onOff = context.consume(TokenType.Keyword, 'ON or OFF').value.toUpperCase();
            
            return new SetStatement(
                onOff === 'ON' ? SetOption.TextWrapOn : SetOption.TextWrapOff
            );
        }
        else if (option1 === 'AUDIO')
        {
            const onOff = context.consume(TokenType.Keyword, 'ON or OFF').value.toUpperCase();
            
            return new SetStatement(
                onOff === 'ON' ? SetOption.AudioOn : SetOption.AudioOff
            );
        }
        
        throw new Error(`Unknown SET option: ${option1}`);
    }

    public static parseRandomize(context: ParserContext): RandomizeStatement
    {
        context.consume(TokenType.Keyword, 'RANDOMIZE');
        
        let seed: number | null = null;
        if (!context.isAtEnd() && context.peek().type !== TokenType.EOF)
        {
            const expr = context.parseExpression();
            seed = 0;
        }
        
        return new RandomizeStatement(seed);
    }

    public static parseHelp(context: ParserContext): HelpStatement
    {
        context.consume(TokenType.Keyword, 'HELP');
        
        const keyword = context.consume(TokenType.Keyword, 'statement keyword').value;
        
        return new HelpStatement(keyword);
    }

    public static parseConsole(context: ParserContext): ConsoleStatement
    {
        context.consume(TokenType.Keyword, 'CONSOLE');
        
        const expression = context.parseExpression();
        
        return new ConsoleStatement(expression);
    }
}
