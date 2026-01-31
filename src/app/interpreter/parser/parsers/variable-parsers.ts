import { Expression } from '../../../../lang/expressions/expression';
import { DimDimensionSpec, DimStatement, LetBracketSegment, LetBracketStatement, LetStatement, LocalStatement } from '../../../../lang/statements/variables';
import { Statement } from '../../../../lang/statements/statement';
import { TokenType } from '../../tokenizer.service';
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

        while (context.match(TokenType.LeftBracket))
        {
            if (!context.isAtEnd() &&
                context.peek().type === TokenType.Identifier)
            {
                const identifier = context.peek().value;
                const nextIndex = context.current.value + 1;

                if (nextIndex < context.tokens.length &&
                    context.tokens[nextIndex].type === TokenType.RightBracket)
                {
                    context.advance();
                    const rightBracketResult = context.consume(TokenType.RightBracket, ']');
                    if (!rightBracketResult.success)
                    {
                        return rightBracketResult;
                    }

                    segments.push({ type: 'identifier', identifier });
                    continue;
                }
            }

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
        
        const arrayName = varNameTokenResult.value.value + '[]';
        
        return success(new DimStatement(arrayName, dimensions));
    }
}
