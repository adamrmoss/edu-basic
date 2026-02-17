import { Expression } from '../../expressions/expression';
import { ExpressionParser } from '../expression-parser';
import { Token, TokenType } from '../tokenizer';
import { ExpressionHelpers } from '../helpers/expression-helpers';
import { TokenHelpers } from '../helpers/token-helpers';
import { ParseResult, failure, success } from '../parse-result';

/**
 * Token-stream wrapper used by statement parsers.
 */
export class ParserContext
{
    /**
     * Token stream for the current line.
     */
    public readonly tokens: Token[];

    /**
     * Mutable cursor index into `tokens`.
     */
    public readonly current: { value: number };

    /**
     * Expression parser used for parsing embedded expressions.
     */
    public readonly expressionParser: ExpressionParser;

    /**
     * Create a new parser context.
     *
     * @param tokens Token stream for the current line.
     * @param current Mutable cursor into `tokens`.
     * @param expressionParser Expression parser to use for embedded expressions.
     */
    public constructor(tokens: Token[], current: { value: number }, expressionParser: ExpressionParser)
    {
        this.tokens = tokens;
        this.current = current;
        this.expressionParser = expressionParser;
    }

    // ParserContext is a thin convenience wrapper for statement parsers.
    // It intentionally does not own parsing policy; it just centralizes:
    // - token stream cursor operations (match/consume)
    // - "parse an expression here" behavior (ExpressionHelpers + ExpressionParser)
    /**
     * Peek the current token.
     *
     * @returns The current token.
     */
    public peek(): Token
    {
        return TokenHelpers.peek(this.tokens, this.current.value);
    }

    /**
     * Advance the cursor by one token.
     *
     * @returns The consumed token.
     */
    public advance(): Token
    {
        return TokenHelpers.advance(this.tokens, this.current);
    }

    /**
     * Whether the cursor is at or past the end of input.
     *
     * @returns `true` if at end.
     */
    public isAtEnd(): boolean
    {
        return TokenHelpers.isAtEnd(this.tokens, this.current.value);
    }

    /**
     * If the current token matches any of the given types, consume it.
     *
     * @param types Token types to match.
     * @returns `true` if a token was consumed.
     */
    public match(...types: TokenType[]): boolean
    {
        return TokenHelpers.match(this.tokens, this.current, ...types);
    }

    /**
     * If the current token is a keyword matching `keyword` (case-insensitive), consume it.
     *
     * @param keyword Keyword to match.
     * @returns `true` if a token was consumed.
     */
    public matchKeyword(keyword: string): boolean
    {
        return TokenHelpers.matchKeyword(this.tokens, this.current, keyword);
    }

    /**
     * Consume the next token if it matches the expected type.
     *
     * @param type Expected token type.
     * @param message Human-readable expected token description.
     * @returns The consumed token, or a failed parse result.
     */
    public consume(type: TokenType, message: string): ParseResult<Token>
    {
        return TokenHelpers.consume(this.tokens, this.current, type, message);
    }

    /**
     * Consume the next token if it is a matching keyword (case-insensitive).
     *
     * @param keyword Keyword to match.
     * @returns The consumed token, or a failed parse result.
     */
    public consumeKeyword(keyword: string): ParseResult<Token>
    {
        // Require current token to be the given keyword (case-insensitive) or return failure.
        if (!this.isAtEnd() &&
            this.peek().type === TokenType.Keyword &&
            this.peek().value.toUpperCase() === keyword.toUpperCase())
        {
            return success(this.advance());
        }

        const actualToken = this.isAtEnd()
            ? 'end of input'
            : this.peek().value;
        return failure(`Expected ${keyword}, got: ${actualToken}`);
    }

    /**
     * Parse an embedded expression starting at the current cursor.
     *
     * @returns The parsed expression result.
     */
    public parseExpression(): ParseResult<Expression>
    {
        // Expressions embedded in statements are parsed by:
        // - slicing tokens until a statement-specific terminator
        // - reconstructing expression source
        // - delegating to ExpressionParser so precedence stays centralized
        return ExpressionHelpers.parseExpression(this.tokens, this.current, this.expressionParser);
    }
}
