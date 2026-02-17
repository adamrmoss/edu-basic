import { Expression } from '../../expressions/expression';
import { ClsStatement, ColorStatement, InputStatement, LocateStatement, PrintStatement } from '../../statements/io';
import { TokenType } from '../tokenizer';
import { ParserContext } from './parser-context';
import { ParseResult, success, failure } from '../parse-result';

/**
 * Statement parsers for console I/O statements.
 */
export class IoParsers
{
    /**
     * Parse the `PRINT` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parsePrint(context: ParserContext): ParseResult<PrintStatement>
    {
        // Consume PRINT; loop over expr, comma/semicolon; build PrintStatement with expressions and hasNewline.
        // Spec: docs/edu-basic-language.md
        //
        // PRINT forms:
        // - PRINT                    (blank line)
        // - PRINT expr1, expr2, ...  (comma-separated values)
        // - PRINT ...;               (semicolon suppresses trailing newline when last token)
        //
        // Implementation detail:
        // ParserContext.parseExpression() stops on comma/semicolon at depth 0, so we can loop
        // and parse multiple expressions without having to manually slice tokens.
        const printTokenResult = context.consume(TokenType.Keyword, 'PRINT');
        if (!printTokenResult.success)
        {
            return printTokenResult;
        }
        
        const expressions: Expression[] = [];
        let hasNewline = true;
        
        while (!context.isAtEnd() && context.peek().type !== TokenType.EOF)
        {
            const exprResult = context.parseExpression();
            if (!exprResult.success)
            {
                return exprResult;
            }
            expressions.push(exprResult.value);
            
            const separatorType = context.isAtEnd() ? null : context.peek().type;

            switch (separatorType)
            {
                case TokenType.Semicolon:
                    context.advance();
                    if (context.isAtEnd() || context.peek().type === TokenType.EOF)
                    {
                        hasNewline = false;
                        break;
                    }
                    break;
                case TokenType.Comma:
                    context.advance();
                    continue;
                default:
                    break;
            }

            break;
        }
        
        return success(new PrintStatement(expressions, hasNewline));
    }

    /**
     * Parse the `INPUT` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parseInput(context: ParserContext): ParseResult<InputStatement>
    {
        // Consume INPUT, variable identifier; build InputStatement.
        // Spec: docs/edu-basic-language.md
        //
        // INPUT <variable>
        const inputTokenResult = context.consume(TokenType.Keyword, 'INPUT');
        if (!inputTokenResult.success)
        {
            return inputTokenResult;
        }
        
        const varNameTokenResult = context.consume(TokenType.Identifier, 'variable name');
        if (!varNameTokenResult.success)
        {
            return varNameTokenResult;
        }
        
        return success(new InputStatement(varNameTokenResult.value.value));
    }

    /**
     * Parse the `COLOR` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parseColor(context: ParserContext): ParseResult<ColorStatement>
    {
        // Consume COLOR; optional foreground/background exprs (comma first => background only); build ColorStatement.
        // Spec: docs/edu-basic-language.md
        //
        // COLOR foregroundExpr[, backgroundExpr]
        const colorTokenResult = context.consume(TokenType.Keyword, 'COLOR');
        if (!colorTokenResult.success)
        {
            return colorTokenResult;
        }
        
        let foreground: Expression | null = null;
        let background: Expression | null = null;
        
        if (context.match(TokenType.Comma))
        {
            const backgroundResult = context.parseExpression();
            if (!backgroundResult.success)
            {
                return backgroundResult;
            }
            background = backgroundResult.value;
        }
        else
        {
            const foregroundResult = context.parseExpression();
            if (!foregroundResult.success)
            {
                return foregroundResult;
            }
            foreground = foregroundResult.value;
            
            if (context.match(TokenType.Comma))
            {
                const backgroundResult = context.parseExpression();
                if (!backgroundResult.success)
                {
                    return backgroundResult;
                }
                background = backgroundResult.value;
            }
        }
        
        if (foreground === null)
        {
            return failure('COLOR requires at least a foreground color');
        }
        
        return success(new ColorStatement(foreground, background));
    }

    /**
     * Parse the `LOCATE` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parseLocate(context: ParserContext): ParseResult<LocateStatement>
    {
        // Consume LOCATE, row expr, comma, column expr; build LocateStatement.
        // Spec: docs/edu-basic-language.md
        //
        // LOCATE rowExpr, columnExpr
        const locateTokenResult = context.consume(TokenType.Keyword, 'LOCATE');
        if (!locateTokenResult.success)
        {
            return locateTokenResult;
        }
        
        const rowResult = context.parseExpression();
        if (!rowResult.success)
        {
            return rowResult;
        }
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const columnResult = context.parseExpression();
        if (!columnResult.success)
        {
            return columnResult;
        }
        
        return success(new LocateStatement(rowResult.value, columnResult.value));
    }

    /**
     * Parse the `CLS` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parseCls(context: ParserContext): ParseResult<ClsStatement>
    {
        // Consume CLS; build ClsStatement (no arguments).
        // Spec: docs/edu-basic-language.md
        //
        // CLS
        const clsTokenResult = context.consume(TokenType.Keyword, 'CLS');
        if (!clsTokenResult.success)
        {
            return clsTokenResult;
        }
        
        return success(new ClsStatement());
    }
}
