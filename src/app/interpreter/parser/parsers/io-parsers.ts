import { Expression } from '../../../../lang/expressions/expression';
import { ClsStatement, ColorStatement, InputStatement, LocateStatement, PrintStatement } from '../../../../lang/statements/io';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';

export class IoParsers
{
    public static parsePrint(context: ParserContext): PrintStatement
    {
        context.consume(TokenType.Keyword, 'PRINT');
        
        const expressions: Expression[] = [];
        let hasNewline = true;
        
        while (!context.isAtEnd() && context.peek().type !== TokenType.EOF)
        {
            expressions.push(context.parseExpression());
            
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
        
        return new PrintStatement(expressions, hasNewline);
    }

    public static parseInput(context: ParserContext): InputStatement
    {
        context.consume(TokenType.Keyword, 'INPUT');
        
        const varName = context.consume(TokenType.Identifier, 'variable name').value;
        
        return new InputStatement(varName);
    }

    public static parseColor(context: ParserContext): ColorStatement
    {
        context.consume(TokenType.Keyword, 'COLOR');
        
        let foreground: Expression | null = null;
        let background: Expression | null = null;
        
        if (context.match(TokenType.Comma))
        {
            background = context.parseExpression();
        }
        else
        {
            foreground = context.parseExpression();
            
            if (context.match(TokenType.Comma))
            {
                background = context.parseExpression();
            }
        }
        
        return new ColorStatement(foreground!, background);
    }

    public static parseLocate(context: ParserContext): LocateStatement
    {
        context.consume(TokenType.Keyword, 'LOCATE');
        
        const row = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const column = context.parseExpression();
        
        return new LocateStatement(row, column);
    }

    public static parseCls(context: ParserContext): ClsStatement
    {
        context.consume(TokenType.Keyword, 'CLS');
        
        return new ClsStatement();
    }
}
