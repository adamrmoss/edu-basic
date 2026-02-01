import { Expression } from '../../expressions/expression';
import { ExpressionParser } from '../expression-parser';
import { Keywords } from '../keywords';
import { Token, TokenType } from '../tokenizer';
import { TokenHelpers } from './token-helpers';
import { ParseResult, failure, success } from '../parse-result';

export class ExpressionHelpers
{
    public static parseExpression(
        tokens: Token[],
        current: { value: number },
        expressionParser: ExpressionParser
    ): ParseResult<Expression>
    {
        const exprTokens: Token[] = [];
        const startPos = current.value;
        let parenDepth = 0;
        let bracketDepth = 0;
        let braceDepth = 0;

        while (!TokenHelpers.isAtEnd(tokens, current.value) && TokenHelpers.peek(tokens, current.value).type !== TokenType.EOF)
        {
            const token = TokenHelpers.peek(tokens, current.value);

            if (parenDepth === 0 && bracketDepth === 0 && braceDepth === 0)
            {
                const stopTokens = [
                    TokenType.Comma,
                    TokenType.Semicolon,
                    TokenType.RightParen,
                    TokenType.RightBracket,
                    TokenType.RightBrace
                ];

                if (stopTokens.includes(token.type) || 
                    (token.type === TokenType.Keyword && Keywords.isExpressionTerminatorKeyword(token.value)))
                {
                    break;
                }
            }

            if (token.type === TokenType.LeftParen)
            {
                parenDepth++;
            }
            else if (token.type === TokenType.RightParen)
            {
                parenDepth--;
            }
            else if (token.type === TokenType.LeftBracket)
            {
                bracketDepth++;
            }
            else if (token.type === TokenType.RightBracket)
            {
                bracketDepth--;
            }
            else if (token.type === TokenType.LeftBrace)
            {
                braceDepth++;
            }
            else if (token.type === TokenType.RightBrace)
            {
                braceDepth--;
            }

            exprTokens.push(token);
            TokenHelpers.advance(tokens, current);
        }

        if (exprTokens.length === 0)
        {
            return failure('Expected expression');
        }

        const parts: string[] = [];
        
        for (let i = 0; i < exprTokens.length; i++)
        {
            const token = exprTokens[i];
            const prevToken = i > 0 ? exprTokens[i - 1] : null;
            
            if (token.type === TokenType.String)
            {
                if (prevToken && this.needsSpace(prevToken, token))
                {
                    parts.push(' ');
                }
                parts.push(`"${token.value}"`);
            }
            else
            {
                if (prevToken && this.needsSpace(prevToken, token))
                {
                    parts.push(' ');
                }
                parts.push(token.value);
            }
        }
        
        const exprSource = parts.join('');

        const exprResult = expressionParser.parseExpression(exprSource);
        
        if (!exprResult.success)
        {
            return exprResult;
        }
        
        return success(exprResult.value);
    }

    private static needsSpace(prevToken: Token, currentToken: Token): boolean
    {
        if (prevToken.type === TokenType.LeftParen || prevToken.type === TokenType.LeftBracket || prevToken.type === TokenType.LeftBrace)
        {
            return false;
        }
        
        if (currentToken.type === TokenType.RightParen || currentToken.type === TokenType.RightBracket || currentToken.type === TokenType.RightBrace)
        {
            return false;
        }
        
        if (prevToken.type === TokenType.Comma || prevToken.type === TokenType.Semicolon)
        {
            return false;
        }
        
        return true;
    }
}
