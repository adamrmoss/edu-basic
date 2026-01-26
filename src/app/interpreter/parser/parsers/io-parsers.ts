import { Expression } from '../../../../lang/expressions/expression';
import { ClsStatement, ColorStatement, InputStatement, LocateStatement, PrintStatement } from '../../../../lang/statements/io';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';
import { ParseResult, success, failure } from '../parse-result';

export class IoParsers
{
    public static parsePrint(context: ParserContext): ParseResult<PrintStatement>
    {
        const printTokenResult = context.consume(TokenType.Keyword, 'PRINT');
        if (!printTokenResult.success)
        {
            return printTokenResult;
        }
        
        const expressions: Expression[] = [];
        let hasNewline = true;
        
        while (!context.isAtEnd() && context.peek().type !== TokenType.EOF)
        {
            const exprResult = context.parseExpression();
            if (!exprResult.success)
            {
                return exprResult;
            }
            expressions.push(exprResult.value);
            
            if (context.match(TokenType.Semicolon))
            {
                if (context.isAtEnd() || context.peek().type === TokenType.EOF)
                {
                    hasNewline = false;
                    break;
                }
            }
            else if (context.match(TokenType.Comma))
            {
                continue;
            }
            else
            {
                break;
            }
        }
        
        return success(new PrintStatement(expressions, hasNewline));
    }

    public static parseInput(context: ParserContext): ParseResult<InputStatement>
    {
        const inputTokenResult = context.consume(TokenType.Keyword, 'INPUT');
        if (!inputTokenResult.success)
        {
            return inputTokenResult;
        }
        
        const varNameTokenResult = context.consume(TokenType.Identifier, 'variable name');
        if (!varNameTokenResult.success)
        {
            return varNameTokenResult;
        }
        
        return success(new InputStatement(varNameTokenResult.value.value));
    }

    public static parseColor(context: ParserContext): ParseResult<ColorStatement>
    {
        const colorTokenResult = context.consume(TokenType.Keyword, 'COLOR');
        if (!colorTokenResult.success)
        {
            return colorTokenResult;
        }
        
        let foreground: Expression | null = null;
        let background: Expression | null = null;
        
        if (context.match(TokenType.Comma))
        {
            const backgroundResult = context.parseExpression();
            if (!backgroundResult.success)
            {
                return backgroundResult;
            }
            background = backgroundResult.value;
        }
        else
        {
            const foregroundResult = context.parseExpression();
            if (!foregroundResult.success)
            {
                return foregroundResult;
            }
            foreground = foregroundResult.value;
            
            if (context.match(TokenType.Comma))
            {
                const backgroundResult = context.parseExpression();
                if (!backgroundResult.success)
                {
                    return backgroundResult;
                }
                background = backgroundResult.value;
            }
        }
        
        if (foreground === null)
        {
            return failure('COLOR requires at least a foreground color');
        }
        
        return success(new ColorStatement(foreground, background));
    }

    public static parseLocate(context: ParserContext): ParseResult<LocateStatement>
    {
        const locateTokenResult = context.consume(TokenType.Keyword, 'LOCATE');
        if (!locateTokenResult.success)
        {
            return locateTokenResult;
        }
        
        const rowResult = context.parseExpression();
        if (!rowResult.success)
        {
            return rowResult;
        }
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const columnResult = context.parseExpression();
        if (!columnResult.success)
        {
            return columnResult;
        }
        
        return success(new LocateStatement(rowResult.value, columnResult.value));
    }

    public static parseCls(context: ParserContext): ParseResult<ClsStatement>
    {
        const clsTokenResult = context.consume(TokenType.Keyword, 'CLS');
        if (!clsTokenResult.success)
        {
            return clsTokenResult;
        }
        
        return success(new ClsStatement());
    }
}
