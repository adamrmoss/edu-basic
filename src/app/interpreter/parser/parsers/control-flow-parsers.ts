import { Expression } from '../../../../lang/expressions/expression';
import {
    CallStatement,
    CaseStatement,
    CatchStatement,
    ContinueStatement,
    ContinueTarget,
    DoLoopStatement,
    DoLoopVariant,
    ElseIfStatement,
    ElseStatement,
    EndStatement,
    EndType,
    ExitStatement,
    ExitTarget,
    FinallyStatement,
    ForStatement,
    GosubStatement,
    GotoStatement,
    IfStatement,
    LabelStatement,
    LoopStatement,
    NextStatement,
    ReturnStatement,
    SelectCaseStatement,
    SubParameter,
    SubStatement,
    ThrowStatement,
    TryStatement,
    UendStatement,
    UnlessStatement,
    UntilStatement,
    WendStatement,
    WhileStatement
} from '../../../../lang/statements/control-flow';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';

export class ControlFlowParsers
{
    public static parseIf(context: ParserContext): IfStatement
    {
        context.consume(TokenType.Keyword, 'IF');
        
        const condition = context.parseExpression();
        context.consume(TokenType.Keyword, 'THEN');
        
        return new IfStatement(condition, [], [], null);
    }

    public static parseElseIf(context: ParserContext): ElseIfStatement
    {
        context.consume(TokenType.Keyword, 'ELSEIF');
        
        return new ElseIfStatement();
    }

    public static parseElse(context: ParserContext): ElseStatement
    {
        context.consume(TokenType.Keyword, 'ELSE');
        
        return new ElseStatement();
    }

    public static parseUnless(context: ParserContext): UnlessStatement
    {
        context.consume(TokenType.Keyword, 'UNLESS');
        
        const condition = context.parseExpression();
        context.consume(TokenType.Keyword, 'THEN');
        
        return new UnlessStatement(condition, [], null);
    }

    public static parseSelectCase(context: ParserContext): SelectCaseStatement
    {
        context.consume(TokenType.Keyword, 'SELECT');
        context.consume(TokenType.Keyword, 'CASE');
        
        const testExpression = context.parseExpression();
        
        return new SelectCaseStatement(testExpression, []);
    }

    public static parseCase(context: ParserContext): CaseStatement
    {
        context.consume(TokenType.Keyword, 'CASE');
        
        return new CaseStatement();
    }

    public static parseFor(context: ParserContext): ForStatement
    {
        context.consume(TokenType.Keyword, 'FOR');
        
        const varName = context.consume(TokenType.Identifier, 'loop variable').value;
        context.consume(TokenType.Equal, '=');
        
        const startValue = context.parseExpression();
        context.consume(TokenType.Keyword, 'TO');
        
        const endValue = context.parseExpression();
        
        let stepValue: Expression | null = null;
        if (context.matchKeyword('STEP'))
        {
            stepValue = context.parseExpression();
        }
        
        return new ForStatement(varName, startValue, endValue, stepValue, []);
    }

    public static parseNext(context: ParserContext): NextStatement
    {
        context.consume(TokenType.Keyword, 'NEXT');
        
        let varName: string | null = null;
        if (!context.isAtEnd() && context.peek().type === TokenType.Identifier)
        {
            varName = context.consume(TokenType.Identifier, 'variable name').value;
        }
        
        return new NextStatement(varName);
    }

    public static parseWhile(context: ParserContext): WhileStatement
    {
        context.consume(TokenType.Keyword, 'WHILE');
        
        const condition = context.parseExpression();
        
        return new WhileStatement(condition, []);
    }

    public static parseWend(context: ParserContext): WendStatement
    {
        context.consume(TokenType.Keyword, 'WEND');
        
        return new WendStatement();
    }

    public static parseUntil(context: ParserContext): UntilStatement
    {
        context.consume(TokenType.Keyword, 'UNTIL');
        
        const condition = context.parseExpression();
        
        return new UntilStatement(condition, []);
    }

    public static parseUend(context: ParserContext): UendStatement
    {
        context.consume(TokenType.Keyword, 'UEND');
        
        return new UendStatement();
    }

    public static parseDo(context: ParserContext): DoLoopStatement
    {
        context.consume(TokenType.Keyword, 'DO');
        
        if (context.matchKeyword('WHILE'))
        {
            const condition = context.parseExpression();
            return new DoLoopStatement(DoLoopVariant.DoWhile, condition, []);
        }
        else if (context.matchKeyword('UNTIL'))
        {
            const condition = context.parseExpression();
            return new DoLoopStatement(DoLoopVariant.DoUntil, condition, []);
        }
        
        return new DoLoopStatement(DoLoopVariant.DoLoop, null, []);
    }

    public static parseLoop(context: ParserContext): LoopStatement
    {
        context.consume(TokenType.Keyword, 'LOOP');
        
        return new LoopStatement();
    }

    public static parseSub(context: ParserContext): SubStatement
    {
        context.consume(TokenType.Keyword, 'SUB');
        
        const name = context.consume(TokenType.Identifier, 'subroutine name').value;
        
        const parameters: SubParameter[] = [];
        
        while (!context.isAtEnd() && context.peek().type === TokenType.Identifier)
        {
            const byRef = context.matchKeyword('BYREF');
            const paramName = context.consume(TokenType.Identifier, 'parameter name').value;
            
            parameters.push({ name: paramName, byRef });
            
            if (!context.match(TokenType.Comma))
            {
                break;
            }
        }
        
        return new SubStatement(name, parameters, []);
    }

    public static parseCall(context: ParserContext): CallStatement
    {
        context.consume(TokenType.Keyword, 'CALL');
        
        const subName = context.consume(TokenType.Identifier, 'subroutine name').value;
        
        const args: Expression[] = [];
        
        while (!context.isAtEnd() && context.peek().type !== TokenType.EOF)
        {
            args.push(context.parseExpression());
            
            if (!context.match(TokenType.Comma))
            {
                break;
            }
        }
        
        return new CallStatement(subName, args);
    }

    public static parseTry(context: ParserContext): TryStatement
    {
        context.consume(TokenType.Keyword, 'TRY');
        
        return new TryStatement([], [], null);
    }

    public static parseCatch(context: ParserContext): CatchStatement
    {
        context.consume(TokenType.Keyword, 'CATCH');
        
        return new CatchStatement();
    }

    public static parseFinally(context: ParserContext): FinallyStatement
    {
        context.consume(TokenType.Keyword, 'FINALLY');
        
        return new FinallyStatement();
    }

    public static parseGoto(context: ParserContext): GotoStatement
    {
        context.consume(TokenType.Keyword, 'GOTO');
        
        const labelName = context.consume(TokenType.Identifier, 'label name').value;
        
        return new GotoStatement(labelName);
    }

    public static parseGosub(context: ParserContext): GosubStatement
    {
        context.consume(TokenType.Keyword, 'GOSUB');
        
        const labelName = context.consume(TokenType.Identifier, 'label name').value;
        
        return new GosubStatement(labelName);
    }

    public static parseReturn(context: ParserContext): ReturnStatement
    {
        context.consume(TokenType.Keyword, 'RETURN');
        
        return new ReturnStatement();
    }

    public static parseLabel(context: ParserContext): LabelStatement
    {
        context.consume(TokenType.Keyword, 'LABEL');
        
        const labelName = context.consume(TokenType.Identifier, 'label name').value;
        
        return new LabelStatement(labelName);
    }

    public static parseEnd(context: ParserContext): EndStatement
    {
        context.consume(TokenType.Keyword, 'END');
        
        if (!context.isAtEnd() && context.peek().type === TokenType.Keyword)
        {
            const nextKeyword = context.peek().value.toUpperCase();
            
            switch (nextKeyword)
            {
                case 'IF':
                    context.advance();
                    return new EndStatement(EndType.If);
                case 'UNLESS':
                    context.advance();
                    return new EndStatement(EndType.Unless);
                case 'SELECT':
                    context.advance();
                    return new EndStatement(EndType.Select);
                case 'SUB':
                    context.advance();
                    return new EndStatement(EndType.Sub);
                case 'TRY':
                    context.advance();
                    return new EndStatement(EndType.Try);
            }
        }
        
        return new EndStatement(EndType.Program);
    }

    public static parseExit(context: ParserContext): ExitStatement
    {
        context.consume(TokenType.Keyword, 'EXIT');
        
        if (context.matchKeyword('FOR'))
        {
            return new ExitStatement(ExitTarget.For);
        }
        else if (context.matchKeyword('WHILE'))
        {
            return new ExitStatement(ExitTarget.While);
        }
        else if (context.matchKeyword('DO'))
        {
            return new ExitStatement(ExitTarget.Do);
        }
        else if (context.matchKeyword('SUB'))
        {
            return new ExitStatement(ExitTarget.Sub);
        }
        
        throw new Error('EXIT must specify target: FOR, WHILE, DO, or SUB');
    }

    public static parseContinue(context: ParserContext): ContinueStatement
    {
        context.consume(TokenType.Keyword, 'CONTINUE');
        
        if (context.matchKeyword('FOR'))
        {
            return new ContinueStatement(ContinueTarget.For);
        }
        else if (context.matchKeyword('WHILE'))
        {
            return new ContinueStatement(ContinueTarget.While);
        }
        else if (context.matchKeyword('DO'))
        {
            return new ContinueStatement(ContinueTarget.Do);
        }
        
        throw new Error('CONTINUE must specify target: FOR, WHILE, or DO');
    }

    public static parseThrow(context: ParserContext): ThrowStatement
    {
        context.consume(TokenType.Keyword, 'THROW');
        
        const message = context.parseExpression();
        
        return new ThrowStatement(message);
    }
}
