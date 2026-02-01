import { ConsoleStatement, HelpStatement, RandomizeStatement, SetOption, SetStatement, SleepStatement } from '../../statements/misc';
import { Expression } from '../../expressions/expression';
import { TokenType } from '../tokenizer';
import { ParserContext } from './parser-context';
import { ParseResult, success, failure } from '../parse-result';
import { Statement } from '../../statements/statement';

export class MiscParsers
{
    public static parseSleep(context: ParserContext): ParseResult<SleepStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // SLEEP millisecondsExpr
        const sleepTokenResult = context.consume(TokenType.Keyword, 'SLEEP');
        if (!sleepTokenResult.success)
        {
            return sleepTokenResult;
        }
        
        const millisecondsResult = context.parseExpression();
        if (!millisecondsResult.success)
        {
            return millisecondsResult;
        }
        
        return success(new SleepStatement(millisecondsResult.value));
    }

    public static parseSet(context: ParserContext): ParseResult<SetStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // Implemented forms:
        // - SET LINE SPACING ON|OFF
        // - SET TEXT WRAP ON|OFF
        // - SET AUDIO ON|OFF
        //
        // Note: The language reference also documents `SET VOLUME volume#`. That is not currently
        // implemented here (volume is handled by the VOLUME statement).
        const setTokenResult = context.consume(TokenType.Keyword, 'SET');
        if (!setTokenResult.success)
        {
            return setTokenResult;
        }
        
        const tokenResult = context.consume(TokenType.Keyword, 'SET option');
        if (!tokenResult.success)
        {
            return tokenResult;
        }
        const option1 = tokenResult.value.value.toUpperCase();
        
        switch (option1)
        {
            case 'LINE':
            {
                const spacingTokenResult = context.consume(TokenType.Keyword, 'SPACING');
                if (!spacingTokenResult.success)
                {
                    return spacingTokenResult;
                }
                const onOffTokenResult = context.consume(TokenType.Keyword, 'ON or OFF');
                if (!onOffTokenResult.success)
                {
                    return onOffTokenResult;
                }
                const onOff = onOffTokenResult.value.value.toUpperCase();
                
                return success(new SetStatement(
                    onOff === 'ON' ? SetOption.LineSpacingOn : SetOption.LineSpacingOff
                ));
            }
            case 'TEXT':
            {
                const wrapTokenResult = context.consume(TokenType.Keyword, 'WRAP');
                if (!wrapTokenResult.success)
                {
                    return wrapTokenResult;
                }
                const onOffTokenResult = context.consume(TokenType.Keyword, 'ON or OFF');
                if (!onOffTokenResult.success)
                {
                    return onOffTokenResult;
                }
                const onOff = onOffTokenResult.value.value.toUpperCase();
                
                return success(new SetStatement(
                    onOff === 'ON' ? SetOption.TextWrapOn : SetOption.TextWrapOff
                ));
            }
            case 'AUDIO':
            {
                const onOffTokenResult = context.consume(TokenType.Keyword, 'ON or OFF');
                if (!onOffTokenResult.success)
                {
                    return onOffTokenResult;
                }
                const onOff = onOffTokenResult.value.value.toUpperCase();
                
                return success(new SetStatement(
                    onOff === 'ON' ? SetOption.AudioOn : SetOption.AudioOff
                ));
            }
            default:
                return failure(`Unknown SET option: ${option1}`);
        }
    }

    public static parseRandomize(context: ParserContext): ParseResult<RandomizeStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // RANDOMIZE
        // RANDOMIZE seedExpr
        const randomizeTokenResult = context.consume(TokenType.Keyword, 'RANDOMIZE');
        if (!randomizeTokenResult.success)
        {
            return randomizeTokenResult;
        }
        
        let seedExpression: Expression | null = null;
        if (!context.isAtEnd() && context.peek().type !== TokenType.EOF)
        {
            const exprResult = context.parseExpression();
            if (!exprResult.success)
            {
                return failure(`RANDOMIZE: ${exprResult.error || 'Failed to parse seed expression'}`);
            }
            seedExpression = exprResult.value;
        }
        
        return success(new RandomizeStatement(seedExpression));
    }

    public static parseHelp(context: ParserContext): ParseResult<HelpStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // HELP statementKeyword
        const helpTokenResult = context.consume(TokenType.Keyword, 'HELP');
        if (!helpTokenResult.success)
        {
            return helpTokenResult;
        }
        
        const keywordTokenResult = context.consume(TokenType.Keyword, 'statement keyword');
        if (!keywordTokenResult.success)
        {
            return keywordTokenResult;
        }
        
        return success(new HelpStatement(keywordTokenResult.value.value));
    }

    public static parseConsole(context: ParserContext): ParseResult<ConsoleStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // CONSOLE expression
        const consoleTokenResult = context.consume(TokenType.Keyword, 'CONSOLE');
        if (!consoleTokenResult.success)
        {
            return consoleTokenResult;
        }
        
        const expressionResult = context.parseExpression();
        if (!expressionResult.success)
        {
            return expressionResult;
        }
        
        return success(new ConsoleStatement(expressionResult.value));
    }
}
