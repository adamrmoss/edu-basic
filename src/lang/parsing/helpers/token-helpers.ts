import { Token, TokenType } from '../tokenizer';
import { ParseResult, failure, success } from '../parse-result';

/**
 * Cursor-based helpers for consuming tokens in statement parsers.
 */
export class TokenHelpers
{
    /**
     * Peek the current token without advancing the cursor.
     *
     * @param tokens Token stream.
     * @param current Current cursor index.
     * @returns The token at the cursor.
     */
    public static peek(tokens: Token[], current: number): Token
    {
        return tokens[current];
    }

    /**
     * Advance the cursor by one token (if not at EOF) and return the consumed token.
     *
     * @param tokens Token stream.
     * @param current Mutable cursor into `tokens`.
     * @returns The consumed token.
     */
    public static advance(tokens: Token[], current: { value: number }): Token
    {
        // Increment cursor if not at end; return the token at the previous index.
        if (!this.isAtEnd(tokens, current.value))
        {
            current.value++;
        }

        return tokens[current.value - 1];
    }

    /**
     * Whether the cursor is at or past the end of the token stream (including EOF).
     *
     * @param tokens Token stream.
     * @param current Current cursor index.
     * @returns `true` if at end.
     */
    public static isAtEnd(tokens: Token[], current: number): boolean
    {
        return current >= tokens.length || this.peek(tokens, current).type === TokenType.EOF;
    }

    /**
     * If the current token matches any of the given types, consume it and return `true`.
     *
     * @param tokens Token stream.
     * @param current Mutable cursor into `tokens`.
     * @param types Token types to match.
     * @returns `true` if a token was consumed.
     */
    public static match(tokens: Token[], current: { value: number }, ...types: TokenType[]): boolean
    {
        // If current token matches any of the types, consume it and return true.
        for (const type of types)
        {
            if (!this.isAtEnd(tokens, current.value) && this.peek(tokens, current.value).type === type)
            {
                this.advance(tokens, current);
                return true;
            }
        }

        return false;
    }

    /**
     * If the current token is a keyword matching `keyword` (case-insensitive), consume it.
     *
     * @param tokens Token stream.
     * @param current Mutable cursor into `tokens`.
     * @param keyword Keyword to match.
     * @returns `true` if a token was consumed.
     */
    public static matchKeyword(tokens: Token[], current: { value: number }, keyword: string): boolean
    {
        if (!this.isAtEnd(tokens, current.value) && 
            this.peek(tokens, current.value).type === TokenType.Keyword && 
            this.peek(tokens, current.value).value.toUpperCase() === keyword.toUpperCase())
        {
            this.advance(tokens, current);
            return true;
        }

        return false;
    }

    /**
     * Consume a token of the expected type, or return a failed parse result.
     *
     * @param tokens Token stream.
     * @param current Mutable cursor into `tokens`.
     * @param type Expected token type.
     * @param message Human-readable expected token description.
     * @returns The consumed token, or a failed parse result.
     */
    public static consume(tokens: Token[], current: { value: number }, type: TokenType, message: string): ParseResult<Token>
    {
        // Require current token to have expected type; otherwise return failure with message.
        if (!this.isAtEnd(tokens, current.value) && this.peek(tokens, current.value).type === type)
        {
            return success(this.advance(tokens, current));
        }

        const actualToken = this.isAtEnd(tokens, current.value) 
            ? 'end of input' 
            : this.peek(tokens, current.value).value;
        return failure(`Expected ${message}, got: ${actualToken}`);
    }
}
