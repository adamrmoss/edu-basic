import { Expression } from '../../expressions/expression';
import { DimDimensionSpec, DimStatement, LetBracketSegment, LetBracketStatement, LetStatement, LocalStatement } from '../../statements/variables';
import { Statement } from '../../statements/statement';
import { TokenType } from '../tokenizer';
import { ParserContext } from './parser-context';
import { ParseResult, failure, success } from '../parse-result';

/**
 * Statement parsers for variable statements.
 */
export class VariableParsers
{
    /**
     * Parse the `LET` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parseLet(context: ParserContext): ParseResult<Statement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // LET is required for assignment. Supported targets include:
        // - scalar variables: LET x% = expr
        // - array elements (1D / multi-index): LET a%[i%] = expr, LET m#[i%, j%] = expr
        // - structure members: LET s.x% = expr
        // - chained member/index paths: LET s.points%[i%].x% = expr
        //
        // This parser builds a list of "segments" after the base variable name:
        // - member segments: .name
        // - index segments: [expr, expr, ...]
        //
        // Note: Parentheses are grouping-only in EduBASIC; this parser never treats them as operator syntax.
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

    /**
     * Parse the `LOCAL` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parseLocal(context: ParserContext): ParseResult<LocalStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // LOCAL creates/assigns a variable in the current stack frame:
        // LOCAL name% = expr
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

    /**
     * Parse the `DIM` statement.
     *
     * @param context Parser context.
     * @returns Parsed statement result.
     */
    public static parseDim(context: ParserContext): ParseResult<DimStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // DIM declares/resizes arrays with either:
        // - size form:     DIM a%[10]
        // - range form:    DIM a%[0 TO 11]
        // - multidim:      DIM m#[5, 10]
        // - multidim range DIM g%[1 TO 10, 1 TO 20]
        //
        // Implementation detail:
        // The runtime stores array names with a rank suffix ([], [,], [,,], ...)
        // as part of the identifier. Tokenizer can also recognize rank suffixes on identifiers.
        // DIM reconstructs the rank suffix based on the number of dimensions parsed.
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
