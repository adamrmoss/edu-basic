import { Token, TokenType } from '../../tokenizer.service';

export class TokenHelpers
{
    public static peek(tokens: Token[], current: number): Token
    {
        return tokens[current];
    }

    public static advance(tokens: Token[], current: { value: number }): Token
    {
        if (!this.isAtEnd(tokens, current.value))
        {
            current.value++;
        }

        return tokens[current.value - 1];
    }

    public static isAtEnd(tokens: Token[], current: number): boolean
    {
        return current >= tokens.length || this.peek(tokens, current).type === TokenType.EOF;
    }

    public static match(tokens: Token[], current: { value: number }, ...types: TokenType[]): boolean
    {
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

    public static consume(tokens: Token[], current: { value: number }, type: TokenType, message: string): Token
    {
        if (!this.isAtEnd(tokens, current.value) && this.peek(tokens, current.value).type === type)
        {
            return this.advance(tokens, current);
        }

        throw new Error(`Expected ${message}, got: ${this.peek(tokens, current.value).value}`);
    }
}
