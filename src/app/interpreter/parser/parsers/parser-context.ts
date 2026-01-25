import { ExpressionParserService } from '../../expression-parser.service';
import { Token } from '../../tokenizer.service';
import { ExpressionHelpers } from '../helpers/expression-helpers';
import { TokenHelpers } from '../helpers/token-helpers';

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

    public consume(type: any, message: string): Token
    {
        return TokenHelpers.consume(this.tokens, this.current, type, message);
    }

    public parseExpression(): any
    {
        return ExpressionHelpers.parseExpression(this.tokens, this.current, this.expressionParser);
    }
}
