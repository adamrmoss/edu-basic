import { Expression } from '../../expressions/expression';
import { PopStatement, PushStatement, ShiftStatement, UnshiftStatement } from '../../statements/array';
import { TokenType } from '../tokenizer';
import { ParserContext } from './parser-context';
import { ParseResult, success } from '../parse-result';

export class ArrayParsers
{
    public static parsePush(context: ParserContext): ParseResult<PushStatement>
    {
        // Grammar:
        // PUSH <arrayIdentifier>, <valueExpr>
        //
        // Notes:
        // - The array variable is parsed as a single Identifier token (including any sigil / rank suffix).
        // - The pushed value is a full expression; terminators are controlled by ExpressionHelpers (see parsing/README.md).
        const pushTokenResult = context.consume(TokenType.Keyword, 'PUSH');
        if (!pushTokenResult.success)
        {
            return pushTokenResult;
        }
        
        const arrayVarTokenResult = context.consume(TokenType.Identifier, 'array variable');
        if (!arrayVarTokenResult.success)
        {
            return arrayVarTokenResult;
        }
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const valueResult = context.parseExpression();
        if (!valueResult.success)
        {
            return valueResult;
        }
        
        return success(new PushStatement(arrayVarTokenResult.value.value, valueResult.value));
    }

    public static parsePop(context: ParserContext): ParseResult<PopStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // NOTE: The language reference documents:
        // POP array[] INTO variable
        //
        // Current implementation parses:
        // POP array[][, targetVar]
        //
        // There is no value expression here; POP mutates the array and optionally assigns.
        const popTokenResult = context.consume(TokenType.Keyword, 'POP');
        if (!popTokenResult.success)
        {
            return popTokenResult;
        }
        
        const arrayVarTokenResult = context.consume(TokenType.Identifier, 'array variable');
        if (!arrayVarTokenResult.success)
        {
            return arrayVarTokenResult;
        }
        
        let targetVar: string | null = null;
        if (context.match(TokenType.Comma))
        {
            const targetVarTokenResult = context.consume(TokenType.Identifier, 'target variable');
            if (!targetVarTokenResult.success)
            {
                return targetVarTokenResult;
            }
            targetVar = targetVarTokenResult.value.value;
        }
        
        return success(new PopStatement(arrayVarTokenResult.value.value, targetVar));
    }

    public static parseShift(context: ParserContext): ParseResult<ShiftStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // NOTE: The language reference documents:
        // SHIFT array[] INTO variable
        //
        // Current implementation parses:
        // SHIFT array[][, targetVar]
        //
        // SHIFT removes from the front of the array.
        const shiftTokenResult = context.consume(TokenType.Keyword, 'SHIFT');
        if (!shiftTokenResult.success)
        {
            return shiftTokenResult;
        }
        
        const arrayVarTokenResult = context.consume(TokenType.Identifier, 'array variable');
        if (!arrayVarTokenResult.success)
        {
            return arrayVarTokenResult;
        }
        
        let targetVar: string | null = null;
        if (context.match(TokenType.Comma))
        {
            const targetVarTokenResult = context.consume(TokenType.Identifier, 'target variable');
            if (!targetVarTokenResult.success)
            {
                return targetVarTokenResult;
            }
            targetVar = targetVarTokenResult.value.value;
        }
        
        return success(new ShiftStatement(arrayVarTokenResult.value.value, targetVar));
    }

    public static parseUnshift(context: ParserContext): ParseResult<UnshiftStatement>
    {
        // Grammar:
        // UNSHIFT <arrayIdentifier>, <valueExpr>
        //
        // Notes:
        // - UNSHIFT adds to the front of the array.
        // - The added value is a full expression.
        const unshiftTokenResult = context.consume(TokenType.Keyword, 'UNSHIFT');
        if (!unshiftTokenResult.success)
        {
            return unshiftTokenResult;
        }
        
        const arrayVarTokenResult = context.consume(TokenType.Identifier, 'array variable');
        if (!arrayVarTokenResult.success)
        {
            return arrayVarTokenResult;
        }
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const valueResult = context.parseExpression();
        if (!valueResult.success)
        {
            return valueResult;
        }
        
        return success(new UnshiftStatement(arrayVarTokenResult.value.value, valueResult.value));
    }
}
