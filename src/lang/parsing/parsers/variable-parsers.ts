import { Expression } from '../../expressions/expression';
import { DimDimensionSpec, DimStatement, LetBracketSegment, LetBracketStatement, LetStatement, LocalStatement } from '../../statements/variables';
import { Statement } from '../../statements/statement';
import { TokenType } from '../tokenizer';
import { ParserContext } from './parser-context';
import { ParseResult, failure, success } from '../parse-result';

export class VariableParsers
{
    public static parseLet(context: ParserContext): ParseResult<Statement>
    {
        const letTokenResult = context.consume(TokenType.Keyword, 'LET');
        if (!letTokenResult.success)
        {
            return letTokenResult;
        }
        
        const varNameTokenResult = context.consume(TokenType.Identifier, 'variable name');
        if (!varNameTokenResult.success)
        {
            return varNameTokenResult;
        }

        const segments: LetBracketSegment[] = [];

        while (!context.isAtEnd())
        {
            if (context.match(TokenType.Dot))
            {
                const memberNameTokenResult = context.consume(TokenType.Identifier, 'member name');
                if (!memberNameTokenResult.success)
                {
                    return memberNameTokenResult;
                }

                segments.push({ type: 'member', memberName: memberNameTokenResult.value.value });
                continue;
            }

            if (context.match(TokenType.LeftBracket))
            {
                const indices: Expression[] = [];

                do
                {
                    const exprResult = context.parseExpression();
                    if (!exprResult.success)
                    {
                        return exprResult;
                    }

                    indices.push(exprResult.value);
                }
                while (context.match(TokenType.Comma));

                const rightBracketResult = context.consume(TokenType.RightBracket, ']');
                if (!rightBracketResult.success)
                {
                    return rightBracketResult;
                }

                segments.push({ type: 'indices', indices });
                continue;
            }

            break;
        }

        const equalResult = context.consume(TokenType.Equal, '=');
        if (!equalResult.success)
        {
            return equalResult;
        }
        
        const exprResult = context.parseExpression();
        if (!exprResult.success)
        {
            return exprResult;
        }

        if (segments.length > 0)
        {
            return success(new LetBracketStatement(varNameTokenResult.value.value, segments, exprResult.value));
        }

        return success(new LetStatement(varNameTokenResult.value.value, exprResult.value));
    }

    public static parseLocal(context: ParserContext): ParseResult<LocalStatement>
    {
        const localTokenResult = context.consume(TokenType.Keyword, 'LOCAL');
        if (!localTokenResult.success)
        {
            return localTokenResult;
        }
        
        const varNameTokenResult = context.consume(TokenType.Identifier, 'variable name');
        if (!varNameTokenResult.success)
        {
            return varNameTokenResult;
        }
        const equalResult = context.consume(TokenType.Equal, '=');
        if (!equalResult.success)
        {
            return equalResult;
        }
        
        const exprResult = context.parseExpression();
        if (!exprResult.success)
        {
            return exprResult;
        }
        
        return success(new LocalStatement(varNameTokenResult.value.value, exprResult.value));
    }

    public static parseDim(context: ParserContext): ParseResult<DimStatement>
    {
        const dimTokenResult = context.consume(TokenType.Keyword, 'DIM');
        if (!dimTokenResult.success)
        {
            return dimTokenResult;
        }
        
        const varNameTokenResult = context.consume(TokenType.Identifier, 'array name');
        if (!varNameTokenResult.success)
        {
            return varNameTokenResult;
        }
        const leftBracketResult = context.consume(TokenType.LeftBracket, '[');
        if (!leftBracketResult.success)
        {
            return leftBracketResult;
        }
        
        const dimensions: DimDimensionSpec[] = [];
        
        do
        {
            const startResult = context.parseExpression();
            if (!startResult.success)
            {
                return startResult;
            }

            if (context.matchKeyword('TO'))
            {
                const endResult = context.parseExpression();
                if (!endResult.success)
                {
                    return failure(endResult.error || 'Failed to parse DIM range end expression');
                }

                dimensions.push({ type: 'range', start: startResult.value, end: endResult.value });
            }
            else
            {
                dimensions.push({ type: 'size', size: startResult.value });
            }
        }
        while (context.match(TokenType.Comma));
        
        const rightBracketResult = context.consume(TokenType.RightBracket, ']');
        if (!rightBracketResult.success)
        {
            return rightBracketResult;
        }
        
        const rankSuffix = `[${','.repeat(Math.max(0, dimensions.length - 1))}]`;
        const arrayName = varNameTokenResult.value.value + rankSuffix;
        
        return success(new DimStatement(arrayName, dimensions));
    }
}
