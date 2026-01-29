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
import { ParseResult, success, failure } from '../parse-result';

export class ControlFlowParsers
{
    public static parseIf(context: ParserContext): ParseResult<IfStatement>
    {
        const ifTokenResult = context.consume(TokenType.Keyword, 'IF');
        if (!ifTokenResult.success)
        {
            return ifTokenResult;
        }
        
        const conditionResult = context.parseExpression();
        if (!conditionResult.success)
        {
            return failure(conditionResult.error || 'Failed to parse condition expression');
        }
        const thenTokenResult = context.consume(TokenType.Keyword, 'THEN');
        if (!thenTokenResult.success)
        {
            return thenTokenResult;
        }
        
        return success(new IfStatement(conditionResult.value, [], [], null));
    }

    public static parseElseIf(context: ParserContext): ParseResult<ElseIfStatement>
    {
        const elseifTokenResult = context.consume(TokenType.Keyword, 'ELSEIF');
        if (!elseifTokenResult.success)
        {
            return elseifTokenResult;
        }

        const conditionResult = context.parseExpression();
        if (!conditionResult.success)
        {
            return failure(conditionResult.error || 'Failed to parse condition expression');
        }

        const thenTokenResult = context.consume(TokenType.Keyword, 'THEN');
        if (!thenTokenResult.success)
        {
            return thenTokenResult;
        }

        return success(new ElseIfStatement(conditionResult.value));
    }

    public static parseElse(context: ParserContext): ParseResult<ElseStatement>
    {
        const elseTokenResult = context.consume(TokenType.Keyword, 'ELSE');
        if (!elseTokenResult.success)
        {
            return elseTokenResult;
        }
        
        return success(new ElseStatement());
    }

    public static parseUnless(context: ParserContext): ParseResult<UnlessStatement>
    {
        const unlessTokenResult = context.consume(TokenType.Keyword, 'UNLESS');
        if (!unlessTokenResult.success)
        {
            return unlessTokenResult;
        }
        
        const conditionResult = context.parseExpression();
        if (!conditionResult.success)
        {
            return failure(conditionResult.error || 'Failed to parse condition expression');
        }
        const thenTokenResult = context.consume(TokenType.Keyword, 'THEN');
        if (!thenTokenResult.success)
        {
            return thenTokenResult;
        }
        
        return success(new UnlessStatement(conditionResult.value, [], null));
    }

    public static parseSelectCase(context: ParserContext): ParseResult<SelectCaseStatement>
    {
        const selectTokenResult = context.consume(TokenType.Keyword, 'SELECT');
        if (!selectTokenResult.success)
        {
            return selectTokenResult;
        }
        const caseTokenResult = context.consume(TokenType.Keyword, 'CASE');
        if (!caseTokenResult.success)
        {
            return caseTokenResult;
        }
        
        const testExpressionResult = context.parseExpression();
        if (!testExpressionResult.success)
        {
            return failure(testExpressionResult.error || 'Failed to parse test expression');
        }
        
        return success(new SelectCaseStatement(testExpressionResult.value, []));
    }

    public static parseCase(context: ParserContext): ParseResult<CaseStatement>
    {
        const caseTokenResult = context.consume(TokenType.Keyword, 'CASE');
        if (!caseTokenResult.success)
        {
            return caseTokenResult;
        }
        
        return success(new CaseStatement());
    }

    public static parseFor(context: ParserContext): ParseResult<ForStatement>
    {
        const forTokenResult = context.consume(TokenType.Keyword, 'FOR');
        if (!forTokenResult.success)
        {
            return forTokenResult;
        }
        
        const varNameResult = context.consume(TokenType.Identifier, 'loop variable');
        if (!varNameResult.success)
        {
            return varNameResult;
        }
        const varName = varNameResult.value.value;
        
        const equalResult = context.consume(TokenType.Equal, '=');
        if (!equalResult.success)
        {
            return equalResult;
        }
        
        const startValueResult = context.parseExpression();
        if (!startValueResult.success)
        {
            return failure(startValueResult.error || 'Failed to parse start value expression');
        }
        
        const toResult = context.consume(TokenType.Keyword, 'TO');
        if (!toResult.success)
        {
            return toResult;
        }
        
        const endValueResult = context.parseExpression();
        if (!endValueResult.success)
        {
            return failure(endValueResult.error || 'Failed to parse end value expression');
        }
        
        let stepValue: Expression | null = null;
        if (context.matchKeyword('STEP'))
        {
            const stepValueResult = context.parseExpression();
            if (!stepValueResult.success)
            {
                return failure(stepValueResult.error || 'Failed to parse step value expression');
            }
            stepValue = stepValueResult.value;
        }
        
        return success(new ForStatement(varName, startValueResult.value, endValueResult.value, stepValue, []));
    }

    public static parseNext(context: ParserContext): ParseResult<NextStatement>
    {
        const nextTokenResult = context.consume(TokenType.Keyword, 'NEXT');
        if (!nextTokenResult.success)
        {
            return nextTokenResult;
        }
        
        let varName: string | null = null;
        if (!context.isAtEnd() && context.peek().type === TokenType.Identifier)
        {
            const varNameResult = context.consume(TokenType.Identifier, 'variable name');
            if (!varNameResult.success)
            {
                return varNameResult;
            }
            varName = varNameResult.value.value;
        }
        
        return success(new NextStatement(varName));
    }

    public static parseWhile(context: ParserContext): ParseResult<WhileStatement>
    {
        const whileTokenResult = context.consume(TokenType.Keyword, 'WHILE');
        if (!whileTokenResult.success)
        {
            return whileTokenResult;
        }
        
        const conditionResult = context.parseExpression();
        if (!conditionResult.success)
        {
            return failure(conditionResult.error || 'Failed to parse condition expression');
        }
        
        return success(new WhileStatement(conditionResult.value, []));
    }

    public static parseWend(context: ParserContext): ParseResult<WendStatement>
    {
        const wendTokenResult = context.consume(TokenType.Keyword, 'WEND');
        if (!wendTokenResult.success)
        {
            return wendTokenResult;
        }
        
        return success(new WendStatement());
    }

    public static parseUntil(context: ParserContext): ParseResult<UntilStatement>
    {
        const untilTokenResult = context.consume(TokenType.Keyword, 'UNTIL');
        if (!untilTokenResult.success)
        {
            return untilTokenResult;
        }
        
        const conditionResult = context.parseExpression();
        if (!conditionResult.success)
        {
            return failure(conditionResult.error || 'Failed to parse condition expression');
        }
        
        return success(new UntilStatement(conditionResult.value, []));
    }

    public static parseUend(context: ParserContext): ParseResult<UendStatement>
    {
        const uendTokenResult = context.consume(TokenType.Keyword, 'UEND');
        if (!uendTokenResult.success)
        {
            return uendTokenResult;
        }
        
        return success(new UendStatement());
    }

    public static parseDo(context: ParserContext): ParseResult<DoLoopStatement>
    {
        const doTokenResult = context.consume(TokenType.Keyword, 'DO');
        if (!doTokenResult.success)
        {
            return doTokenResult;
        }
        
        if (context.matchKeyword('WHILE'))
        {
            const conditionResult = context.parseExpression();
            if (!conditionResult.success)
            {
                return failure(conditionResult.error || 'Failed to parse WHILE condition expression');
            }
            return success(new DoLoopStatement(DoLoopVariant.DoWhile, conditionResult.value, []));
        }
        else if (context.matchKeyword('UNTIL'))
        {
            const conditionResult = context.parseExpression();
            if (!conditionResult.success)
            {
                return failure(conditionResult.error || 'Failed to parse UNTIL condition expression');
            }
            return success(new DoLoopStatement(DoLoopVariant.DoUntil, conditionResult.value, []));
        }
        
        return success(new DoLoopStatement(DoLoopVariant.DoLoop, null, []));
    }

    public static parseLoop(context: ParserContext): ParseResult<LoopStatement>
    {
        const loopTokenResult = context.consume(TokenType.Keyword, 'LOOP');
        if (!loopTokenResult.success)
        {
            return loopTokenResult;
        }
        
        return success(new LoopStatement());
    }

    public static parseSub(context: ParserContext): ParseResult<SubStatement>
    {
        const subTokenResult = context.consume(TokenType.Keyword, 'SUB');
        if (!subTokenResult.success)
        {
            return subTokenResult;
        }
        
        const nameResult = context.consume(TokenType.Identifier, 'subroutine name');
        if (!nameResult.success)
        {
            return nameResult;
        }
        const name = nameResult.value.value;
        
        const parameters: SubParameter[] = [];
        
        while (!context.isAtEnd() && (context.peek().type === TokenType.Identifier || context.peek().value.toUpperCase() === 'BYREF'))
        {
            const byRef = context.matchKeyword('BYREF');
            const paramNameResult = context.consume(TokenType.Identifier, 'parameter name');
            if (!paramNameResult.success)
            {
                return paramNameResult;
            }
            const paramName = paramNameResult.value.value;
            
            parameters.push({ name: paramName, byRef });
            
            if (!context.match(TokenType.Comma))
            {
                break;
            }
        }
        
        return success(new SubStatement(name, parameters, []));
    }

    public static parseCall(context: ParserContext): ParseResult<CallStatement>
    {
        const callTokenResult = context.consume(TokenType.Keyword, 'CALL');
        if (!callTokenResult.success)
        {
            return callTokenResult;
        }
        
        const subNameResult = context.consume(TokenType.Identifier, 'subroutine name');
        if (!subNameResult.success)
        {
            return subNameResult;
        }
        const subName = subNameResult.value.value;
        
        const args: Expression[] = [];
        
        while (!context.isAtEnd() && context.peek().type !== TokenType.EOF)
        {
            const argResult = context.parseExpression();
            if (!argResult.success)
            {
                return failure(argResult.error || 'Failed to parse argument expression');
            }
            args.push(argResult.value);
            
            if (!context.match(TokenType.Comma))
            {
                break;
            }
        }
        
        return success(new CallStatement(subName, args));
    }

    public static parseTry(context: ParserContext): ParseResult<TryStatement>
    {
        const tryTokenResult = context.consume(TokenType.Keyword, 'TRY');
        if (!tryTokenResult.success)
        {
            return tryTokenResult;
        }
        
        return success(new TryStatement([], [], null));
    }

    public static parseCatch(context: ParserContext): ParseResult<CatchStatement>
    {
        const catchTokenResult = context.consume(TokenType.Keyword, 'CATCH');
        if (!catchTokenResult.success)
        {
            return catchTokenResult;
        }
        
        return success(new CatchStatement());
    }

    public static parseFinally(context: ParserContext): ParseResult<FinallyStatement>
    {
        const finallyTokenResult = context.consume(TokenType.Keyword, 'FINALLY');
        if (!finallyTokenResult.success)
        {
            return finallyTokenResult;
        }
        
        return success(new FinallyStatement());
    }

    public static parseGoto(context: ParserContext): ParseResult<GotoStatement>
    {
        const gotoTokenResult = context.consume(TokenType.Keyword, 'GOTO');
        if (!gotoTokenResult.success)
        {
            return gotoTokenResult;
        }
        
        const labelNameResult = context.consume(TokenType.Identifier, 'label name');
        if (!labelNameResult.success)
        {
            return labelNameResult;
        }
        const labelName = labelNameResult.value.value;
        
        return success(new GotoStatement(labelName));
    }

    public static parseGosub(context: ParserContext): ParseResult<GosubStatement>
    {
        const gosubTokenResult = context.consume(TokenType.Keyword, 'GOSUB');
        if (!gosubTokenResult.success)
        {
            return gosubTokenResult;
        }
        
        const labelNameResult = context.consume(TokenType.Identifier, 'label name');
        if (!labelNameResult.success)
        {
            return labelNameResult;
        }
        const labelName = labelNameResult.value.value;
        
        return success(new GosubStatement(labelName));
    }

    public static parseReturn(context: ParserContext): ParseResult<ReturnStatement>
    {
        const returnTokenResult = context.consume(TokenType.Keyword, 'RETURN');
        if (!returnTokenResult.success)
        {
            return returnTokenResult;
        }
        
        return success(new ReturnStatement());
    }

    public static parseLabel(context: ParserContext): ParseResult<LabelStatement>
    {
        const labelTokenResult = context.consume(TokenType.Keyword, 'LABEL');
        if (!labelTokenResult.success)
        {
            return labelTokenResult;
        }
        
        const labelNameResult = context.consume(TokenType.Identifier, 'label name');
        if (!labelNameResult.success)
        {
            return labelNameResult;
        }
        const labelName = labelNameResult.value.value;
        
        return success(new LabelStatement(labelName));
    }

    public static parseEnd(context: ParserContext): ParseResult<EndStatement>
    {
        const endTokenResult = context.consume(TokenType.Keyword, 'END');
        if (!endTokenResult.success)
        {
            return endTokenResult;
        }
        
        if (!context.isAtEnd() && context.peek().type === TokenType.Keyword)
        {
            const nextKeyword = context.peek().value.toUpperCase();
            
            switch (nextKeyword)
            {
                case 'IF':
                    context.advance();
                    return success(new EndStatement(EndType.If));
                case 'UNLESS':
                    context.advance();
                    return success(new EndStatement(EndType.Unless));
                case 'SELECT':
                    context.advance();
                    return success(new EndStatement(EndType.Select));
                case 'SUB':
                    context.advance();
                    return success(new EndStatement(EndType.Sub));
                case 'TRY':
                    context.advance();
                    return success(new EndStatement(EndType.Try));
            }
        }
        
        return success(new EndStatement(EndType.Program));
    }

    public static parseExit(context: ParserContext): ParseResult<ExitStatement>
    {
        const exitTokenResult = context.consume(TokenType.Keyword, 'EXIT');
        if (!exitTokenResult.success)
        {
            return exitTokenResult;
        }
        
        if (context.matchKeyword('FOR'))
        {
            return success(new ExitStatement(ExitTarget.For));
        }
        else if (context.matchKeyword('WHILE'))
        {
            return success(new ExitStatement(ExitTarget.While));
        }
        else if (context.matchKeyword('DO'))
        {
            return success(new ExitStatement(ExitTarget.Do));
        }
        else if (context.matchKeyword('SUB'))
        {
            return success(new ExitStatement(ExitTarget.Sub));
        }
        
        return failure('EXIT must specify target: FOR, WHILE, DO, or SUB');
    }

    public static parseContinue(context: ParserContext): ParseResult<ContinueStatement>
    {
        const continueTokenResult = context.consume(TokenType.Keyword, 'CONTINUE');
        if (!continueTokenResult.success)
        {
            return continueTokenResult;
        }
        
        if (context.matchKeyword('FOR'))
        {
            return success(new ContinueStatement(ContinueTarget.For));
        }
        else if (context.matchKeyword('WHILE'))
        {
            return success(new ContinueStatement(ContinueTarget.While));
        }
        else if (context.matchKeyword('DO'))
        {
            return success(new ContinueStatement(ContinueTarget.Do));
        }
        
        return failure('CONTINUE must specify target: FOR, WHILE, or DO');
    }

    public static parseThrow(context: ParserContext): ParseResult<ThrowStatement>
    {
        const throwTokenResult = context.consume(TokenType.Keyword, 'THROW');
        if (!throwTokenResult.success)
        {
            return throwTokenResult;
        }
        
        const messageResult = context.parseExpression();
        if (!messageResult.success)
        {
            return failure(messageResult.error || 'Failed to parse throw message expression');
        }
        
        return success(new ThrowStatement(messageResult.value));
    }
}
