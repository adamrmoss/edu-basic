import { Token, TokenType, Tokenizer } from './tokenizer';
import { Expression } from '../expressions/expression';
import { LiteralExpression } from '../expressions/literal-expression';
import { BinaryExpression, BinaryOperator, BinaryOperatorCategory } from '../expressions/binary-expression';
import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '../expressions/unary-expression';
import {
    ArrayLiteralExpression,
    ArraySliceExpression,
    BracketAccessExpression,
    FactorialExpression,
    MultiIndexBracketAccessExpression,
    ParenthesizedExpression,
    StructureLiteralExpression,
    StructureMemberExpression,
    VariableExpression,
} from '../expressions/special';
import { NullaryExpression } from '../expressions/nullary-expression';
import {
    ArraySearchExpression,
    ArraySearchOperator,
    AngleConversionExpression,
    AngleConversionOperator,
    BarsExpression,
    EndsWithOperatorExpression,
    InstrOperatorExpression,
    JoinOperatorExpression,
    LeftOperatorExpression,
    MidOperatorExpression,
    ReplaceOperatorExpression,
    RightOperatorExpression,
    StartsWithOperatorExpression,
} from '../expressions/operators';
import { EduBasicType } from '../edu-basic-value';
import { Constant } from '../expressions/helpers/constant-evaluator';
import { ParseResult, success, failure } from './parse-result';

/**
 * Parser for EduBASIC expressions.
 *
 * Produces an expression AST from a token stream, applying operator precedence and
 * associativity rules consistent with the language runtime.
 */
export class ExpressionParser
{
    // Expression parsing is intentionally centralized here so that:
    // - statement parsers can remain simple (they delegate to ExpressionParser via ParserContext)
    // - operator precedence and associativity rules live in one place
    //
    // Design notes:
    // - Tokenizer normalizes keyword tokens to uppercase, so matchKeyword(...) uses uppercase strings.
    // - Most "operators" in EduBASIC are keyword-operators (e.g. AND, MOD, LEFT, FIND) rather than symbols.
    // - Some nested constructs (array/structure literals, bracket access) need "parse until delimiter" behavior.
    //   We implement that by slicing tokens, reconstructing source text, and re-parsing with a nested ExpressionParser
    //   to keep precedence rules consistent without duplicating a second precedence ladder.
    private tokens: Token[] = [];
    private current: number = 0;
    private tokenizer: Tokenizer = new Tokenizer();

    private static readonly stringOperatorKeywords = [
        'LEFT',
        'RIGHT',
        'MID',
        'INSTR',
        'REPLACE',
        'JOIN',
        'STARTSWITH',
        'ENDSWITH'
    ] as const;

    private static readonly arraySearchOperatorKeywords = [
        'FIND',
        'INDEXOF',
        'INCLUDES'
    ] as const;

    /**
     * Parse an expression from source text.
     *
     * @param source Expression source text.
     * @returns Parsed expression result.
     */
    public parseExpression(source: string): ParseResult<Expression>
    {
        // Public entry point:
        // - tokenize the provided expression source
        // - parse the expression using the precedence ladder below
        // - ensure the entire input was consumed (no trailing junk tokens)
        const tokenizeResult = this.tokenizer.tokenize(source);
        if (!tokenizeResult.success)
        {
            return failure(tokenizeResult.error);
        }

        this.tokens = tokenizeResult.value;
        this.current = 0;
        const exprResult = this.expression();
        
        if (!exprResult.success)
        {
            return exprResult;
        }
        
        if (!this.isAtEnd())
        {
            const unexpectedToken = this.peek();
            return failure(`Unexpected token: ${unexpectedToken.value} at line ${unexpectedToken.line}`);
        }
        
        return success(exprResult.value);
    }

    private expression(): ParseResult<Expression>
    {
        // Precedence ladder entry.
        return this.imp();
    }

    private imp(): ParseResult<Expression>
    {
        // Left-associative:
        // a IMP b IMP c  =>  (a IMP b) IMP c
        const exprResult = this.xorXnor();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.matchKeyword('IMP'))
        {
            const rightResult = this.xorXnor();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, BinaryOperator.Imp, rightResult.value, BinaryOperatorCategory.Logical);
        }

        return success(expr);
    }

    private xorXnor(): ParseResult<Expression>
    {
        // Left-associative:
        // a XOR b XOR c  =>  (a XOR b) XOR c
        const exprResult = this.orNor();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.matchKeyword('XOR') || this.matchKeyword('XNOR'))
        {
            const operator = this.previous().value === 'XOR' ? BinaryOperator.Xor : BinaryOperator.Xnor;
            const rightResult = this.orNor();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Logical);
        }

        return success(expr);
    }

    private orNor(): ParseResult<Expression>
    {
        // Left-associative:
        // a OR b OR c  =>  (a OR b) OR c
        const exprResult = this.andNand();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.matchKeyword('OR') || this.matchKeyword('NOR'))
        {
            const operator = this.previous().value === 'OR' ? BinaryOperator.Or : BinaryOperator.Nor;
            const rightResult = this.andNand();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Logical);
        }

        return success(expr);
    }

    private andNand(): ParseResult<Expression>
    {
        // Left-associative:
        // a AND b AND c  =>  (a AND b) AND c
        const exprResult = this.not();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.matchKeyword('AND') || this.matchKeyword('NAND'))
        {
            const operator = this.previous().value === 'AND' ? BinaryOperator.And : BinaryOperator.Nand;
            const rightResult = this.not();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Logical);
        }

        return success(expr);
    }

    private not(): ParseResult<Expression>
    {
        // Right-associative prefix:
        // NOT NOT x  =>  NOT (NOT x)
        if (this.matchKeyword('NOT'))
        {
            const operandResult = this.not();
            if (!operandResult.success)
            {
                return operandResult;
            }
            return success(new UnaryExpression(UnaryOperator.Not, operandResult.value, UnaryOperatorCategory.Prefix));
        }

        return this.comparison();
    }

    private comparison(): ParseResult<Expression>
    {
        // Comparisons bind looser than arithmetic and keyword-operators below.
        const exprResult = this.stringOperators();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.match(TokenType.Equal, TokenType.NotEqual, TokenType.Less, 
                         TokenType.Greater, TokenType.LessEqual, TokenType.GreaterEqual))
        {
            const operatorToken = this.previous().value;
            let operator: BinaryOperator;

            switch (operatorToken)
            {
                case '=':
                    operator = BinaryOperator.Equal;
                    break;
                case '<>':
                    operator = BinaryOperator.NotEqual;
                    break;
                case '<':
                    operator = BinaryOperator.LessThan;
                    break;
                case '>':
                    operator = BinaryOperator.GreaterThan;
                    break;
                case '<=':
                    operator = BinaryOperator.LessThanOrEqual;
                    break;
                case '>=':
                    operator = BinaryOperator.GreaterThanOrEqual;
                    break;
                default:
                    return failure(`Unknown comparison operator: ${operatorToken}`);
            }

            const rightResult = this.addSub();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Comparison);
        }

        return success(expr);
    }

    private stringOperators(): ParseResult<Expression>
    {
        // Keyword-operator phase for string operations that sit between comparisons and arithmetic.
        // These are infix operators with a left operand already parsed.
        const exprResult = this.arraySearchOperators();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        let operatorToken: string | null = this.matchAnyKeyword(ExpressionParser.stringOperatorKeywords);
        while (operatorToken !== null)
        {
            switch (operatorToken)
            {
                case 'LEFT':
                {
                    const lengthResult = this.arraySearchOperators();
                    if (!lengthResult.success)
                    {
                        return lengthResult;
                    }
                    expr = new LeftOperatorExpression(expr, lengthResult.value);
                    break;
                }
                case 'RIGHT':
                {
                    const lengthResult = this.arraySearchOperators();
                    if (!lengthResult.success)
                    {
                        return lengthResult;
                    }
                    expr = new RightOperatorExpression(expr, lengthResult.value);
                    break;
                }
                case 'MID':
                {
                    const startResult = this.arraySearchOperators();
                    if (!startResult.success)
                    {
                        return startResult;
                    }

                    if (!this.matchKeyword('TO'))
                    {
                        const actualToken = this.isAtEnd() ? 'end of input' : this.peek().value;
                        return failure(`Expected TO after MID start expression, got: ${actualToken}`);
                    }

                    const endResult = this.arraySearchOperators();
                    if (!endResult.success)
                    {
                        return endResult;
                    }

                    expr = new MidOperatorExpression(expr, startResult.value, endResult.value);
                    break;
                }
                case 'INSTR':
                {
                    const needleResult = this.arraySearchOperators();
                    if (!needleResult.success)
                    {
                        return needleResult;
                    }

                    let fromExpr: Expression | null = null;
                    if (this.matchKeyword('FROM'))
                    {
                        const fromResult = this.arraySearchOperators();
                        if (!fromResult.success)
                        {
                            return fromResult;
                        }
                        fromExpr = fromResult.value;
                    }

                    expr = new InstrOperatorExpression(expr, needleResult.value, fromExpr);
                    break;
                }
                case 'REPLACE':
                {
                    const oldResult = this.arraySearchOperators();
                    if (!oldResult.success)
                    {
                        return oldResult;
                    }

                    if (!this.matchKeyword('WITH'))
                    {
                        const actualToken = this.isAtEnd() ? 'end of input' : this.peek().value;
                        return failure(`Expected WITH after REPLACE old substring, got: ${actualToken}`);
                    }

                    const newResult = this.arraySearchOperators();
                    if (!newResult.success)
                    {
                        return newResult;
                    }

                    expr = new ReplaceOperatorExpression(expr, oldResult.value, newResult.value);
                    break;
                }
                case 'JOIN':
                {
                    const separatorResult = this.arraySearchOperators();
                    if (!separatorResult.success)
                    {
                        return separatorResult;
                    }
                    expr = new JoinOperatorExpression(expr, separatorResult.value);
                    break;
                }
                case 'STARTSWITH':
                {
                    const prefixResult = this.arraySearchOperators();
                    if (!prefixResult.success)
                    {
                        return prefixResult;
                    }
                    expr = new StartsWithOperatorExpression(expr, prefixResult.value);
                    break;
                }
                case 'ENDSWITH':
                {
                    const suffixResult = this.arraySearchOperators();
                    if (!suffixResult.success)
                    {
                        return suffixResult;
                    }
                    expr = new EndsWithOperatorExpression(expr, suffixResult.value);
                    break;
                }
                default:
                    return failure(`Unknown string operator: ${operatorToken}`);
            }

            operatorToken = this.matchAnyKeyword(ExpressionParser.stringOperatorKeywords);
        }

        return success(expr);
    }

    private arraySearchOperators(): ParseResult<Expression>
    {
        // Keyword-operator phase for array search operators (FIND/INDEXOF/INCLUDES).
        // These are infix operators with a left operand already parsed.
        const exprResult = this.addSub();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        let operatorToken: string | null = this.matchAnyKeyword(ExpressionParser.arraySearchOperatorKeywords);
        while (operatorToken !== null)
        {
            let operator: ArraySearchOperator;

            switch (operatorToken)
            {
                case 'FIND':
                    operator = ArraySearchOperator.Find;
                    break;
                case 'INDEXOF':
                    operator = ArraySearchOperator.IndexOf;
                    break;
                case 'INCLUDES':
                    operator = ArraySearchOperator.Includes;
                    break;
                default:
                    return failure(`Unknown array search operator: ${operatorToken}`);
            }

            const rightResult = this.addSub();
            if (!rightResult.success)
            {
                return rightResult;
            }

            expr = new ArraySearchExpression(expr, operator, rightResult.value);

            operatorToken = this.matchAnyKeyword(ExpressionParser.arraySearchOperatorKeywords);
        }

        return success(expr);
    }

    private addSub(): ParseResult<Expression>
    {
        // Left-associative:
        // a - b - c  =>  (a - b) - c
        const exprResult = this.mulDiv();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.match(TokenType.Plus, TokenType.Minus))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '+' ? BinaryOperator.Add : BinaryOperator.Subtract;
            const rightResult = this.mulDiv();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Arithmetic);
        }

        return success(expr);
    }

    private mulDiv(): ParseResult<Expression>
    {
        // Left-associative:
        // a / b / c  =>  (a / b) / c
        //
        // Note: MOD is a keyword-operator at the same precedence as * and /.
        const exprResult = this.unaryPlusMinus();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.match(TokenType.Star, TokenType.Slash) || this.matchKeyword('MOD'))
        {
            const operatorToken = this.previous().value;
            let operator: BinaryOperator;

            switch (operatorToken)
            {
                case '*':
                    operator = BinaryOperator.Multiply;
                    break;
                case '/':
                    operator = BinaryOperator.Divide;
                    break;
                case 'MOD':
                    operator = BinaryOperator.Modulo;
                    break;
                default:
                    return failure(`Unknown operator: ${operatorToken}`);
            }

            const rightResult = this.unaryPlusMinus();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Arithmetic);
        }

        return success(expr);
    }

    private unaryPlusMinus(): ParseResult<Expression>
    {
        // Right-associative prefix:
        // - -x  =>  -( -x )
        if (this.match(TokenType.Plus, TokenType.Minus))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '+' ? UnaryOperator.Plus : UnaryOperator.Minus;
            const operandResult = this.unaryPlusMinus();
            if (!operandResult.success)
            {
                return operandResult;
            }
            return success(new UnaryExpression(operator, operandResult.value, UnaryOperatorCategory.Prefix));
        }

        return this.exponentiation();
    }

    private exponentiation(): ParseResult<Expression>
    {
        // Right-associative:
        // a ^ b ^ c  =>  a ^ (b ^ c)
        const exprResult = this.primary();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        if (this.match(TokenType.Caret, TokenType.StarStar))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '^' ? BinaryOperator.Power : BinaryOperator.PowerAlt;
            const rightResult = this.exponentiation();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Arithmetic);
        }

        return success(expr);
    }

    private primary(): ParseResult<Expression>
    {
        // Primary expressions are the "atoms" of the grammar.
        // After recognizing a primary, we always delegate to parsePostfix(...) so accessors like:
        // - factorial (!)
        // - member access (.name)
        // - bracket access/slicing ([...])
        // can chain as long as they apply.
        let expr: Expression | null = null;

        if (this.match(TokenType.Integer))
        {
            const value = parseInt(this.previous().value);
            expr = new LiteralExpression({ type: EduBasicType.Integer, value });
        }
        else if (this.match(TokenType.Real))
        {
            const value = parseFloat(this.previous().value);
            expr = new LiteralExpression({ type: EduBasicType.Real, value });
        }
        else if (this.match(TokenType.Complex))
        {
            const text = this.previous().value;
            const complexValue = this.parseComplexLiteral(text);
            if (complexValue === null)
            {
                return failure(`Invalid complex literal: ${text}`);
            }
            expr = new LiteralExpression({ type: EduBasicType.Complex, value: complexValue });
        }
        else if (this.match(TokenType.String))
        {
            const value = this.previous().value;
            expr = new LiteralExpression({ type: EduBasicType.String, value });
        }
        else if (this.match(TokenType.LeftBracket))
        {
            const elements: Expression[] = [];

            if (!this.check(TokenType.RightBracket))
            {
                while (!this.isAtEnd() && !this.check(TokenType.RightBracket))
                {
                    const elementResult = this.parseExpressionUntil([TokenType.Comma, TokenType.RightBracket]);
                    if (!elementResult.success)
                    {
                        return elementResult;
                    }

                    elements.push(elementResult.value);

                    if (this.match(TokenType.Comma))
                    {
                        continue;
                    }

                    break;
                }
            }

            const rightBracketResult = this.consume(TokenType.RightBracket, "Expected ']' after array literal");
            if (!rightBracketResult.success)
            {
                return rightBracketResult;
            }

            expr = new ArrayLiteralExpression(elements);
        }
        else if (this.match(TokenType.LeftBrace))
        {
            const members: { name: string; value: Expression }[] = [];

            if (!this.check(TokenType.RightBrace))
            {
                while (!this.isAtEnd() && !this.check(TokenType.RightBrace))
                {
                    const memberNameResult = this.consume(TokenType.Identifier, 'structure member name');
                    if (!memberNameResult.success)
                    {
                        return memberNameResult;
                    }

                    const colonResult = this.consume(TokenType.Colon, "Expected ':' after structure member name");
                    if (!colonResult.success)
                    {
                        return colonResult;
                    }

                    const valueResult = this.parseExpressionUntil([TokenType.Comma, TokenType.RightBrace]);
                    if (!valueResult.success)
                    {
                        return valueResult;
                    }

                    members.push({ name: memberNameResult.value.value, value: valueResult.value });

                    if (this.match(TokenType.Comma))
                    {
                        if (this.check(TokenType.RightBrace))
                        {
                            break;
                        }

                        continue;
                    }

                    break;
                }
            }

            const rightBraceResult = this.consume(TokenType.RightBrace, "Expected '}' after structure literal");
            if (!rightBraceResult.success)
            {
                return rightBraceResult;
            }

            expr = new StructureLiteralExpression(members);
        }
        else if (this.check(TokenType.Identifier))
        {
            const identifier = this.peek().value;
            const constant = this.parseConstant(identifier);
            if (constant !== null)
            {
                this.advance();
                expr = new NullaryExpression(constant);
            }
            else
            {
                this.advance();
                expr = new VariableExpression(identifier);
            }
        }
        else if (this.check(TokenType.Keyword))
        {
            const keyword = this.peek().value;
            const unaryOp = this.parseUnaryOperatorKeyword(keyword);
            if (unaryOp !== null)
            {
                this.advance();

                // Unary keyword-operators bind like prefix operators:
                // - SIN x
                // - SIN (x + y)
                //
                // Parentheses are only grouping in EduBASIC, so they must be represented in the AST.
                // We therefore do not treat '(' as operator syntax here; we simply parse the next
                // expression at prefix precedence, and if that expression starts with '(' it will be
                // parsed as a ParenthesizedExpression by primary().
                const argumentResult = this.unaryPlusMinus();
                if (!argumentResult.success)
                {
                    return argumentResult;
                }

                expr = new UnaryExpression(unaryOp.operator, argumentResult.value, unaryOp.category);
            }
        }
        else if (this.match(TokenType.Pipe))
        {
            // Bars expression: |x| for absolute-value-like semantics.
            const insideResult = this.expression();
            if (!insideResult.success)
            {
                return insideResult;
            }

            const rightPipeResult = this.consume(TokenType.Pipe, " '|' after | expression");
            if (!rightPipeResult.success)
            {
                return rightPipeResult;
            }

            expr = new BarsExpression(insideResult.value);
        }
        else if (this.match(TokenType.LeftParen))
        {
            // Parenthesized grouping.
            const exprResult = this.expression();
            if (!exprResult.success)
            {
                return exprResult;
            }
            const rightParenResult = this.consume(TokenType.RightParen, "Expected ')' after expression");
            if (!rightParenResult.success)
            {
                return rightParenResult;
            }
            expr = new ParenthesizedExpression(exprResult.value);
        }

        if (!expr)
        {
            const token = this.peek();
            return failure(`Unexpected token: ${token.value} at line ${token.line}`);
        }

        return this.parsePostfix(expr);
    }

    private parsePostfix(baseExpr: Expression): ParseResult<Expression>
    {
        // Postfix operators and accessors are applied greedily.
        // Example: a![i].x  parses as (((a!) [i]) .x).
        let expr = baseExpr;

        while (true)
        {
            if (this.match(TokenType.Exclamation))
            {
                expr = new FactorialExpression(expr);
                continue;
            }

            if (this.matchKeyword('DEG'))
            {
                expr = new AngleConversionExpression(expr, AngleConversionOperator.Deg);
                continue;
            }

            if (this.matchKeyword('RAD'))
            {
                expr = new AngleConversionExpression(expr, AngleConversionOperator.Rad);
                continue;
            }

            if (this.match(TokenType.Dot))
            {
                const memberNameResult = this.consume(TokenType.Identifier, 'structure member name');
                if (!memberNameResult.success)
                {
                    return memberNameResult;
                }

                expr = new StructureMemberExpression(expr, memberNameResult.value.value);
                continue;
            }

            if (!this.match(TokenType.LeftBracket))
            {
                break;
            }

            // Bracket syntax is reserved for array access/slicing.
            // The bracket contents are always parsed as expressions (including a single identifier,
            // which becomes a VariableExpression). Structure member access uses the dot operator.

            let startExpr: Expression | null = null;

            if (this.match(TokenType.Ellipsis))
            {
                // Slice start omitted: expr[... TO end]
                startExpr = null;
            }
            else
            {
                // Parse the start/index expression, but stop if we hit TO at depth 0.
                const startResult = this.parseExpressionUntil([TokenType.Comma, TokenType.RightBracket], ['TO']);
                if (!startResult.success)
                {
                    return startResult;
                }
                startExpr = startResult.value;
            }

            if (this.matchKeyword('TO'))
            {
                // Slice form: expr[start TO end], with either side optionally omitted via '...'.
                let endExpr: Expression | null = null;

                if (this.match(TokenType.Ellipsis))
                {
                    // Slice end omitted: expr[start TO ...]
                    endExpr = null;
                }
                else
                {
                    const endResult = this.parseExpressionUntil([TokenType.RightBracket]);
                    if (!endResult.success)
                    {
                        return endResult;
                    }
                    endExpr = endResult.value;
                }

                const rightBracketResult = this.consume(TokenType.RightBracket, "Expected ']' after slice expression");
                if (!rightBracketResult.success)
                {
                    return rightBracketResult;
                }

                expr = new ArraySliceExpression(expr, startExpr, endExpr);
                continue;
            }

            if (startExpr === null)
            {
                // expr[... ] is not meaningful without TO.
                return failure("Expected 'TO' after '...'");
            }

            if (this.match(TokenType.Comma))
            {
                // Multi-index form: expr[i, j, k]
                const indices: Expression[] = [startExpr];

                while (!this.check(TokenType.RightBracket) && !this.isAtEnd())
                {
                    const indexExprResult = this.parseExpressionUntil([TokenType.Comma, TokenType.RightBracket]);
                    if (!indexExprResult.success)
                    {
                        return indexExprResult;
                    }
                    indices.push(indexExprResult.value);

                    if (this.match(TokenType.Comma))
                    {
                        continue;
                    }

                    break;
                }

                const rightBracketResult = this.consume(TokenType.RightBracket, "Expected ']' after bracket expression");
                if (!rightBracketResult.success)
                {
                    return rightBracketResult;
                }

                expr = new MultiIndexBracketAccessExpression(expr, indices);
                continue;
            }

            const rightBracketResult = this.consume(TokenType.RightBracket, "Expected ']' after bracket expression");
            if (!rightBracketResult.success)
            {
                return rightBracketResult;
            }

            expr = new BracketAccessExpression(expr, startExpr, null);
        }

        return success(expr);
    }

    private parseExpressionUntil(stopTypes: TokenType[], stopKeywords: string[] = []): ParseResult<Expression>
    {
        // Parse a sub-expression by collecting tokens until we hit a delimiter token/keyword at depth 0.
        //
        // This is used for:
        // - array literals: [a, b, c]
        // - structure literals: { x: 1, y: 2 }
        // - bracket access: expr[i], expr[i, j], expr[i TO j], expr[... TO j], expr[i TO ...]
        //
        // Note: We reconstitute tokens back into source text and re-tokenize for the nested parse.
        // This is less efficient than a "token-native" nested parse, but it keeps operator precedence
        // centralized in one ladder and avoids a second parsing codepath.
        const exprTokens: Token[] = [];
        let parenDepth = 0;
        let bracketDepth = 0;
        let braceDepth = 0;

        while (!this.isAtEnd())
        {
            const token = this.peek();

            if (parenDepth === 0 && bracketDepth === 0 && braceDepth === 0)
            {
                if (stopTypes.includes(token.type))
                {
                    break;
                }

                if (token.type === TokenType.Keyword && stopKeywords.includes(token.value.toUpperCase()))
                {
                    break;
                }
            }

            if (token.type === TokenType.LeftParen)
            {
                parenDepth++;
            }
            else if (token.type === TokenType.RightParen)
            {
                parenDepth--;
            }
            else if (token.type === TokenType.LeftBracket)
            {
                bracketDepth++;
            }
            else if (token.type === TokenType.RightBracket)
            {
                bracketDepth--;
            }
            else if (token.type === TokenType.LeftBrace)
            {
                braceDepth++;
            }
            else if (token.type === TokenType.RightBrace)
            {
                braceDepth--;
            }

            exprTokens.push(token);
            this.advance();
        }

        if (exprTokens.length === 0)
        {
            return failure('Expected expression');
        }

        const source = this.tokensToSource(exprTokens);
        const nested = new ExpressionParser();
        return nested.parseExpression(source);
    }

    private tokensToSource(tokens: Token[]): string
    {
        // Convert a token slice back to source code suitable for re-tokenization.
        // Strings are re-quoted; most tokens are appended verbatim.
        const parts: string[] = [];

        for (let i = 0; i < tokens.length; i++)
        {
            const token = tokens[i];
            const prev = i > 0 ? tokens[i - 1] : null;

            if (prev && this.needsSpace(prev, token))
            {
                parts.push(' ');
            }

            if (token.type === TokenType.String)
            {
                parts.push(`"${token.value}"`);
            }
            else
            {
                parts.push(token.value);
            }
        }

        return parts.join('');
    }

    private needsSpace(prev: Token, current: Token): boolean
    {
        // Space insertion is intentionally simple:
        // - keep punctuation tight (no extra spaces after '(' or before ')', etc.)
        // - otherwise insert a single space to prevent accidental token merging
        if (prev.type === TokenType.LeftParen || prev.type === TokenType.LeftBracket || prev.type === TokenType.LeftBrace)
        {
            return false;
        }

        if (current.type === TokenType.RightParen || current.type === TokenType.RightBracket || current.type === TokenType.RightBrace)
        {
            return false;
        }

        if (prev.type === TokenType.Comma || prev.type === TokenType.Semicolon)
        {
            return false;
        }

        return true;
    }

    private parseConstant(name: string): Constant | null
    {
        // Constants are recognized by name at parse time so they can be represented as nullary expressions.
        const upperName = name.toUpperCase();
        switch (upperName)
        {
            case 'PI#':
            case 'PI':
                return Constant.Pi;
            case 'E#':
            case 'E':
                return Constant.E;
            case 'TRUE%':
            case 'TRUE':
                return Constant.True;
            case 'FALSE%':
            case 'FALSE':
                return Constant.False;
            case 'RND#':
            case 'RND':
                return Constant.Rnd;
            case 'INKEY$':
            case 'INKEY':
                return Constant.Inkey;
            case 'DATE$':
            case 'DATE':
                return Constant.Date;
            case 'TIME$':
            case 'TIME':
                return Constant.Time;
            case 'NOW%':
            case 'NOW':
                return Constant.Now;
            default:
                return null;
        }
    }

    private parseUnaryOperatorKeyword(keyword: string): { operator: UnaryOperator; category: UnaryOperatorCategory } | null
    {
        // Map a keyword token to a unary operator implementation (if any).
        // This is one of the main extension points when adding new unary keyword-operators.
        switch (keyword.toUpperCase())
        {
            // Mathematical operators
            case 'SIN':
                return { operator: UnaryOperator.Sin, category: UnaryOperatorCategory.Mathematical };
            case 'COS':
                return { operator: UnaryOperator.Cos, category: UnaryOperatorCategory.Mathematical };
            case 'TAN':
                return { operator: UnaryOperator.Tan, category: UnaryOperatorCategory.Mathematical };
            case 'ASIN':
                return { operator: UnaryOperator.Asin, category: UnaryOperatorCategory.Mathematical };
            case 'ACOS':
                return { operator: UnaryOperator.Acos, category: UnaryOperatorCategory.Mathematical };
            case 'ATAN':
                return { operator: UnaryOperator.Atan, category: UnaryOperatorCategory.Mathematical };
            case 'SINH':
                return { operator: UnaryOperator.Sinh, category: UnaryOperatorCategory.Mathematical };
            case 'COSH':
                return { operator: UnaryOperator.Cosh, category: UnaryOperatorCategory.Mathematical };
            case 'TANH':
                return { operator: UnaryOperator.Tanh, category: UnaryOperatorCategory.Mathematical };
            case 'ASINH':
                return { operator: UnaryOperator.Asinh, category: UnaryOperatorCategory.Mathematical };
            case 'ACOSH':
                return { operator: UnaryOperator.Acosh, category: UnaryOperatorCategory.Mathematical };
            case 'ATANH':
                return { operator: UnaryOperator.Atanh, category: UnaryOperatorCategory.Mathematical };
            case 'EXP':
                return { operator: UnaryOperator.Exp, category: UnaryOperatorCategory.Mathematical };
            case 'LOG':
                return { operator: UnaryOperator.Log, category: UnaryOperatorCategory.Mathematical };
            case 'LOG10':
                return { operator: UnaryOperator.Log10, category: UnaryOperatorCategory.Mathematical };
            case 'LOG2':
                return { operator: UnaryOperator.Log2, category: UnaryOperatorCategory.Mathematical };
            case 'SQRT':
                return { operator: UnaryOperator.Sqrt, category: UnaryOperatorCategory.Mathematical };
            case 'CBRT':
                return { operator: UnaryOperator.Cbrt, category: UnaryOperatorCategory.Mathematical };
            case 'ROUND':
                return { operator: UnaryOperator.Round, category: UnaryOperatorCategory.Mathematical };
            case 'FLOOR':
                return { operator: UnaryOperator.Floor, category: UnaryOperatorCategory.Mathematical };
            case 'CEIL':
                return { operator: UnaryOperator.Ceil, category: UnaryOperatorCategory.Mathematical };
            case 'TRUNC':
                return { operator: UnaryOperator.Trunc, category: UnaryOperatorCategory.Mathematical };
            case 'EXPAND':
                return { operator: UnaryOperator.Expand, category: UnaryOperatorCategory.Mathematical };
            case 'SGN':
                return { operator: UnaryOperator.Sgn, category: UnaryOperatorCategory.Mathematical };
            case 'ABS':
                return { operator: UnaryOperator.Abs, category: UnaryOperatorCategory.Mathematical };
            
            // Complex operators
            case 'REAL':
                return { operator: UnaryOperator.Real, category: UnaryOperatorCategory.Complex };
            case 'IMAG':
                return { operator: UnaryOperator.Imag, category: UnaryOperatorCategory.Complex };
            case 'REALPART':
                return { operator: UnaryOperator.Realpart, category: UnaryOperatorCategory.Complex };
            case 'IMAGPART':
                return { operator: UnaryOperator.Imagpart, category: UnaryOperatorCategory.Complex };
            case 'CONJ':
                return { operator: UnaryOperator.Conj, category: UnaryOperatorCategory.Complex };
            case 'CABS':
                return { operator: UnaryOperator.Cabs, category: UnaryOperatorCategory.Complex };
            case 'CARG':
                return { operator: UnaryOperator.Carg, category: UnaryOperatorCategory.Complex };
            case 'CSQRT':
                return { operator: UnaryOperator.Csqrt, category: UnaryOperatorCategory.Complex };
            
            // String manipulation operators
            case 'ASC':
                return { operator: UnaryOperator.Asc, category: UnaryOperatorCategory.StringManipulation };
            case 'CHR':
            case 'CHR$':
                return { operator: UnaryOperator.Chr, category: UnaryOperatorCategory.StringManipulation };
            case 'UCASE':
            case 'UPPER':
            case 'UPPER$':
                return { operator: UnaryOperator.Ucase, category: UnaryOperatorCategory.StringManipulation };
            case 'LCASE':
            case 'LOWER':
            case 'LOWER$':
                return { operator: UnaryOperator.Lcase, category: UnaryOperatorCategory.StringManipulation };
            case 'LTRIM':
            case 'LTRIM$':
                return { operator: UnaryOperator.Ltrim, category: UnaryOperatorCategory.StringManipulation };
            case 'RTRIM':
            case 'RTRIM$':
                return { operator: UnaryOperator.Rtrim, category: UnaryOperatorCategory.StringManipulation };
            case 'TRIM':
            case 'TRIM$':
                return { operator: UnaryOperator.Trim, category: UnaryOperatorCategory.StringManipulation };
            case 'REVERSE':
            case 'REVERSE$':
                return { operator: UnaryOperator.Reverse, category: UnaryOperatorCategory.StringManipulation };
            
            // Type conversion operators
            case 'INT':
            case 'CINT':
                return { operator: UnaryOperator.Int, category: UnaryOperatorCategory.TypeConversion };
            case 'STR':
            case 'CSTR':
            case 'STR$':
                return { operator: UnaryOperator.Str, category: UnaryOperatorCategory.TypeConversion };
            case 'VAL':
                return { operator: UnaryOperator.Val, category: UnaryOperatorCategory.TypeConversion };
            case 'HEX':
            case 'HEX$':
                return { operator: UnaryOperator.Hex, category: UnaryOperatorCategory.TypeConversion };
            case 'BIN':
            case 'BIN$':
                return { operator: UnaryOperator.Bin, category: UnaryOperatorCategory.TypeConversion };

            // Audio operators
            case 'NOTES':
                return { operator: UnaryOperator.Notes, category: UnaryOperatorCategory.Audio };
            
            default:
                return null;
        }
    }

    private parseComplexLiteral(text: string): { real: number; imaginary: number } | null
    {
        // Complex token text is produced by Tokenizer (e.g. "3+4i", "10.5-2.5i").
        // This method turns that text into a structured { real, imaginary } value.
        const imagOnly = /^([+-]?[\d.]+(?:[eE][+-]?\d+)?)[iI]$/;
        const fullComplex = /^([+-]?[\d.]+(?:[eE][+-]?\d+)?)([+-][\d.]+(?:[eE][+-]?\d+)?)[iI]$/;

        let match = text.match(imagOnly);
        
        if (match)
        {
            return { real: 0, imaginary: parseFloat(match[1]) };
        }

        match = text.match(fullComplex);
        
        if (match)
        {
            return { real: parseFloat(match[1]), imaginary: parseFloat(match[2]) };
        }

        return null;
    }

    private match(...types: TokenType[]): boolean
    {
        for (const type of types)
        {
            if (this.check(type))
            {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private matchKeyword(keyword: string): boolean
    {
        if (this.check(TokenType.Keyword) && this.peek().value === keyword)
        {
            this.advance();
            return true;
        }

        return false;
    }

    private matchAnyKeyword(keywords: readonly string[]): string | null
    {
        if (this.check(TokenType.Keyword) && keywords.includes(this.peek().value))
        {
            this.advance();
            return this.previous().value;
        }

        return null;
    }

    private check(type: TokenType): boolean
    {
        if (this.isAtEnd())
        {
            return false;
        }

        return this.peek().type === type;
    }

    private advance(): Token
    {
        if (!this.isAtEnd())
        {
            this.current++;
        }

        return this.previous();
    }

    private isAtEnd(): boolean
    {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token
    {
        return this.tokens[this.current];
    }

    private previous(): Token
    {
        return this.tokens[this.current - 1];
    }

    private consume(type: TokenType, message: string): ParseResult<Token>
    {
        if (this.check(type))
        {
            return success(this.advance());
        }

        const actualToken = this.isAtEnd() 
            ? 'end of input' 
            : this.peek().value;
        return failure(`Expected ${message}, got: ${actualToken}`);
    }
}
