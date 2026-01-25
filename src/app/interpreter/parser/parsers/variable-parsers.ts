import { Expression } from '../../../../lang/expressions/expression';
import { DimStatement, LetStatement, LocalStatement } from '../../../../lang/statements/variables';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';

export class VariableParsers
{
    public static parseLet(context: ParserContext): LetStatement
    {
        context.consume(TokenType.Keyword, 'LET');
        
        const varName = context.consume(TokenType.Identifier, 'variable name').value;
        context.consume(TokenType.Equal, '=');
        
        const expr = context.parseExpression();
        
        return new LetStatement(varName, expr);
    }

    public static parseLocal(context: ParserContext): LocalStatement
    {
        context.consume(TokenType.Keyword, 'LOCAL');
        
        const varName = context.consume(TokenType.Identifier, 'variable name').value;
        context.consume(TokenType.Equal, '=');
        
        const expr = context.parseExpression();
        
        return new LocalStatement(varName, expr);
    }

    public static parseDim(context: ParserContext): DimStatement
    {
        context.consume(TokenType.Keyword, 'DIM');
        
        const varName = context.consume(TokenType.Identifier, 'array name').value;
        context.consume(TokenType.LeftBracket, '[');
        
        const dimensions: Expression[] = [];
        
        do
        {
            dimensions.push(context.parseExpression());
        }
        while (context.match(TokenType.Comma));
        
        context.consume(TokenType.RightBracket, ']');
        
        const arrayName = varName + '[]';
        
        return new DimStatement(arrayName, dimensions);
    }
}
