import { Expression } from '../../../../lang/expressions/expression';
import { ExpressionParserService } from '../../expression-parser.service';
import { Token, TokenType } from '../../tokenizer.service';
import { TokenHelpers } from './token-helpers';

export class ExpressionHelpers
{
    public static parseExpression(
        tokens: Token[],
        current: { value: number },
        expressionParser: ExpressionParserService
    ): Expression
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
                    (token.type === TokenType.Keyword && this.isStatementKeyword(token.value)))
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
            throw new Error('Expected expression');
        }

        const exprSource = exprTokens.map(t => {
            if (t.type === TokenType.String)
            {
                return `"${t.value}"`;
            }
            return t.value;
        }).join(' ');

        return expressionParser.parseExpression(exprSource);
    }

    private static isStatementKeyword(keyword: string): boolean
    {
        const upperKeyword = keyword.toUpperCase();
        const statementKeywords = [
            'APPEND', 'AS', 'AT', 'FILLED', 'FOR', 'FROM', 'IN', 'OVERWRITE', 
            'RADII', 'RADIUS', 'READ', 'STEP', 'THEN', 'TO', 'WITH'
        ];
        return statementKeywords.includes(upperKeyword);
    }
}
