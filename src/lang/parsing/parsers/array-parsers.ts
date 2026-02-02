import { Expression } from '../../expressions/expression';
import { PopStatement, PushStatement, ShiftStatement, UnshiftStatement } from '../../statements/array';
import { TokenType } from '../tokenizer';
import { ParserContext } from './parser-context';
import { ParseResult, success } from '../parse-result';

/**
 * Statement parsers for array statements.
 */
export class ArrayParsers
{
    /**
     * Parse the `PUSH` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
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

    /**
     * Parse the `POP` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parsePop(context: ParserContext): ParseResult<PopStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // POP array[] INTO variable
        //
        // There is no value expression here; POP mutates the array and assigns to the target variable.
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

        const intoTokenResult = context.consumeKeyword('INTO');
        if (!intoTokenResult.success)
        {
            return intoTokenResult;
        }

        const targetVarTokenResult = context.consume(TokenType.Identifier, 'target variable');
        if (!targetVarTokenResult.success)
        {
            return targetVarTokenResult;
        }

        return success(new PopStatement(arrayVarTokenResult.value.value, targetVarTokenResult.value.value));
    }

    /**
     * Parse the `SHIFT` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parseShift(context: ParserContext): ParseResult<ShiftStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // SHIFT array[] INTO variable
        //
        // SHIFT removes from the front of the array and assigns to the target variable.
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

        const intoTokenResult = context.consumeKeyword('INTO');
        if (!intoTokenResult.success)
        {
            return intoTokenResult;
        }

        const targetVarTokenResult = context.consume(TokenType.Identifier, 'target variable');
        if (!targetVarTokenResult.success)
        {
            return targetVarTokenResult;
        }

        return success(new ShiftStatement(arrayVarTokenResult.value.value, targetVarTokenResult.value.value));
    }

    /**
     * Parse the `UNSHIFT` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
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
