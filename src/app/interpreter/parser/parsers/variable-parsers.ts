import { Expression } from '../../../../lang/expressions/expression';
import { DimStatement, LetStatement, LocalStatement } from '../../../../lang/statements/variables';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';
import { ParseResult, success } from '../parse-result';

export class VariableParsers
{
    public static parseLet(context: ParserContext): ParseResult<LetStatement>
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
        
        const dimensions: Expression[] = [];
        
        do
        {
            const dimResult = context.parseExpression();
            if (!dimResult.success)
            {
                return dimResult;
            }
            dimensions.push(dimResult.value);
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
