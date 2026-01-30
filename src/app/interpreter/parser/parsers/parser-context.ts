import { ExpressionParserService } from '../../expression-parser.service';
import { Token, TokenType } from '../../tokenizer.service';
import { ExpressionHelpers } from '../helpers/expression-helpers';
import { TokenHelpers } from '../helpers/token-helpers';
import { ParseResult, failure, success } from '../parse-result';

export class ParserContext
{
    public constructor(
        public readonly tokens: Token[],
        public readonly current: { value: number },
        public readonly expressionParser: ExpressionParserService
    )
    {
    }

    public peek(): Token
    {
        return TokenHelpers.peek(this.tokens, this.current.value);
    }

    public advance(): Token
    {
        return TokenHelpers.advance(this.tokens, this.current);
    }

    public isAtEnd(): boolean
    {
        return TokenHelpers.isAtEnd(this.tokens, this.current.value);
    }

    public match(...types: any[]): boolean
    {
        return TokenHelpers.match(this.tokens, this.current, ...types);
    }

    public matchKeyword(keyword: string): boolean
    {
        return TokenHelpers.matchKeyword(this.tokens, this.current, keyword);
    }

    public consume(type: any, message: string): ParseResult<Token>
    {
        return TokenHelpers.consume(this.tokens, this.current, type, message);
    }

    public consumeKeyword(keyword: string): ParseResult<Token>
    {
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

    public parseExpression(): ParseResult<any>
    {
        return ExpressionHelpers.parseExpression(this.tokens, this.current, this.expressionParser);
    }
}
