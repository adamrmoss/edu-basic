import { Expression } from '../../../../lang/expressions/expression';
import { PopStatement, PushStatement, ShiftStatement, UnshiftStatement } from '../../../../lang/statements/array';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';

export class ArrayParsers
{
    public static parsePush(context: ParserContext): PushStatement
    {
        context.consume(TokenType.Keyword, 'PUSH');
        
        const arrayVar = context.consume(TokenType.Identifier, 'array variable').value;
        context.consume(TokenType.Comma, ',');
        
        const value = context.parseExpression();
        
        return new PushStatement(arrayVar, value);
    }

    public static parsePop(context: ParserContext): PopStatement
    {
        context.consume(TokenType.Keyword, 'POP');
        
        const arrayVar = context.consume(TokenType.Identifier, 'array variable').value;
        
        let targetVar: string | null = null;
        if (context.match(TokenType.Comma))
        {
            targetVar = context.consume(TokenType.Identifier, 'target variable').value;
        }
        
        return new PopStatement(arrayVar, targetVar);
    }

    public static parseShift(context: ParserContext): ShiftStatement
    {
        context.consume(TokenType.Keyword, 'SHIFT');
        
        const arrayVar = context.consume(TokenType.Identifier, 'array variable').value;
        
        let targetVar: string | null = null;
        if (context.match(TokenType.Comma))
        {
            targetVar = context.consume(TokenType.Identifier, 'target variable').value;
        }
        
        return new ShiftStatement(arrayVar, targetVar);
    }

    public static parseUnshift(context: ParserContext): UnshiftStatement
    {
        context.consume(TokenType.Keyword, 'UNSHIFT');
        
        const arrayVar = context.consume(TokenType.Identifier, 'array variable').value;
        context.consume(TokenType.Comma, ',');
        
        const value = context.parseExpression();
        
        return new UnshiftStatement(arrayVar, value);
    }
}
