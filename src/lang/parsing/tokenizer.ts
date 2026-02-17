import { Keywords } from './keywords';
import { failure, ParseResult, success } from './parse-result';

/**
 * Token kinds emitted by `Tokenizer`.
 */
export enum TokenType
{
    /**
     * End-of-file sentinel token.
     */
    EOF,
    
    /**
     * Integer literal token.
     */
    Integer,

    /**
     * Real literal token.
     */
    Real,

    /**
     * Complex literal token.
     */
    Complex,

    /**
     * String literal token.
     */
    String,
    
    /**
     * Identifier token.
     */
    Identifier,

    /**
     * Keyword token (recognized via `Keywords`).
     */
    Keyword,
    
    /**
     * Plus operator (`+`).
     */
    Plus,

    /**
     * Minus operator (`-`).
     */
    Minus,

    /**
     * Multiplication operator (`*`).
     */
    Star,

    /**
     * Division operator (`/`).
     */
    Slash,

    /**
     * Power operator (`^`).
     */
    Caret,

    /**
     * Power operator (`**`).
     */
    StarStar,
    
    /**
     * Equality operator (`=`).
     */
    Equal,

    /**
     * Inequality operator (`<>`).
     */
    NotEqual,

    /**
     * Less-than operator (`<`).
     */
    Less,

    /**
     * Greater-than operator (`>`).
     */
    Greater,

    /**
     * Less-than-or-equal operator (`<=`).
     */
    LessEqual,

    /**
     * Greater-than-or-equal operator (`>=`).
     */
    GreaterEqual,
    
    /**
     * Left parenthesis (`(`).
     */
    LeftParen,

    /**
     * Right parenthesis (`)`).
     */
    RightParen,

    /**
     * Left bracket (`[`).
     */
    LeftBracket,

    /**
     * Right bracket (`]`).
     */
    RightBracket,

    /**
     * Left brace (`{`).
     */
    LeftBrace,

    /**
     * Right brace (`}`).
     */
    RightBrace,
    
    /**
     * Comma delimiter (`,`).
     */
    Comma,

    /**
     * Colon delimiter (`:`).
     */
    Colon,

    /**
     * Semicolon delimiter (`;`).
     */
    Semicolon,

    /**
     * Pipe token (`|`).
     */
    Pipe,

    /**
     * Exclamation token (`!`).
     */
    Exclamation,

    /**
     * Dot token (`.`).
     */
    Dot,

    /**
     * Ellipsis token (`...`).
     */
    Ellipsis,
}

/**
 * Token produced by `Tokenizer`.
 */
export interface Token
{
    /**
     * Token kind.
     */
    type: TokenType;

    /**
     * Source text for the token (normalized for keywords).
     */
    value: string;

    /**
     * 1-based line number in the source string.
     */
    line: number;

    /**
     * 1-based column number in the source string.
     */
    column: number;
}

/**
 * Tokenizer for EduBASIC source and expressions.
 *
 * Produces a flat token stream consumed by the parser and expression parser.
 */
export class Tokenizer
{
    private source: string = '';
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;

    /**
     * Tokenize a source string into an array of tokens.
     *
     * @param source Source string to tokenize.
     * @returns Token list including a trailing EOF token.
     */
    public tokenize(source: string): ParseResult<Token[]>
    {
        // Tokenization is a single left-to-right pass.
        // We treat tokenization failures as recoverable (ParseResult) because the editor/IDE
        // should be able to display errors without crashing the parse pipeline.
        this.source = source;
        this.position = 0;
        this.line = 1;
        this.column = 1;

        const tokens: Token[] = [];

        while (!this.isAtEnd())
        {
            this.skipWhitespace();
            
            if (this.isAtEnd())
            {
                break;
            }

            const tokenResult = this.nextToken();
            if (!tokenResult.success)
            {
                return failure(tokenResult.error);
            }

            tokens.push(tokenResult.value);
        }

        tokens.push(this.makeToken(TokenType.EOF, ''));
        return success(tokens);
    }

    private nextToken(): ParseResult<Token>
    {
        // Dispatch by current character: ellipsis, string, number, &H/&B, identifier/keyword, or symbol.
        const startColumn = this.column;
        const char = this.peek();

        // Ellipsis must be recognized before '.' is treated as:
        // - a real literal prefix (e.g. ".5")
        // - a standalone dot token (used for structure member access)
        if (char === '.' &&
            this.position + 2 < this.source.length &&
            this.source[this.position + 1] === '.' &&
            this.source[this.position + 2] === '.')
        {
            this.advance();
            this.advance();
            this.advance();
            return success(this.makeToken(TokenType.Ellipsis, '...', startColumn));
        }

        if (char === '"')
        {
            return this.readString();
        }

        if (this.isDigit(char) || (char === '.' && this.isDigit(this.peekNext())))
        {
            // Numbers are parsed with some BASIC-specific extensions:
            // - exponent notation (e.g. 1.2e-3)
            // - complex literals using an 'i' suffix (e.g. 3i, 2+4i, 2-4i)
            return this.readNumber();
        }

        if (char === '&')
        {
            const next = this.peekNext();
            
            if (next === 'H' || next === 'h')
            {
                return this.readHexNumber();
            }
            else if (next === 'B' || next === 'b')
            {
                return this.readBinaryNumber();
            }
        }

        if (this.isAlpha(char))
        {
            return this.readIdentifierOrKeyword();
        }

        switch (char)
        {
            case '+':
                this.advance();
                return success(this.makeToken(TokenType.Plus, '+', startColumn));

            case '-':
                this.advance();
                return success(this.makeToken(TokenType.Minus, '-', startColumn));

            case '/':
                this.advance();
                return success(this.makeToken(TokenType.Slash, '/', startColumn));

            case '^':
                this.advance();
                return success(this.makeToken(TokenType.Caret, '^', startColumn));

            case '*':
                this.advance();
                
                if (this.peek() === '*')
                {
                    this.advance();
                    return success(this.makeToken(TokenType.StarStar, '**', startColumn));
                }
                
                return success(this.makeToken(TokenType.Star, '*', startColumn));

            case '=':
                this.advance();
                return success(this.makeToken(TokenType.Equal, '=', startColumn));

            case '<':
                this.advance();
                
                if (this.peek() === '>')
                {
                    this.advance();
                    return success(this.makeToken(TokenType.NotEqual, '<>', startColumn));
                }
                else if (this.peek() === '=')
                {
                    this.advance();
                    return success(this.makeToken(TokenType.LessEqual, '<=', startColumn));
                }
                
                return success(this.makeToken(TokenType.Less, '<', startColumn));

            case '>':
                this.advance();
                
                if (this.peek() === '=')
                {
                    this.advance();
                    return success(this.makeToken(TokenType.GreaterEqual, '>=', startColumn));
                }
                
                return success(this.makeToken(TokenType.Greater, '>', startColumn));

            case '(':
                this.advance();
                return success(this.makeToken(TokenType.LeftParen, '(', startColumn));

            case ')':
                this.advance();
                return success(this.makeToken(TokenType.RightParen, ')', startColumn));

            case '[':
                this.advance();
                return success(this.makeToken(TokenType.LeftBracket, '[', startColumn));

            case ']':
                this.advance();
                return success(this.makeToken(TokenType.RightBracket, ']', startColumn));

            case '{':
                this.advance();
                return success(this.makeToken(TokenType.LeftBrace, '{', startColumn));

            case '}':
                this.advance();
                return success(this.makeToken(TokenType.RightBrace, '}', startColumn));

            case ',':
                this.advance();
                return success(this.makeToken(TokenType.Comma, ',', startColumn));

            case ':':
                this.advance();
                return success(this.makeToken(TokenType.Colon, ':', startColumn));

            case ';':
                this.advance();
                return success(this.makeToken(TokenType.Semicolon, ';', startColumn));

            case '|':
                this.advance();
                return success(this.makeToken(TokenType.Pipe, '|', startColumn));

            case '!':
                this.advance();
                return success(this.makeToken(TokenType.Exclamation, '!', startColumn));

            case '.':
                this.advance();
                return success(this.makeToken(TokenType.Dot, '.', startColumn));

            default:
                return failure(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
        }
    }

    private readString(): ParseResult<Token>
    {
        const startColumn = this.column;
        this.advance();
        
        let value = '';
        
        while (!this.isAtEnd() && this.peek() !== '"')
        {
            // Strings are single-line. Newlines terminate the literal.
            if (this.peek() === '\n')
            {
                return failure(`Unterminated string at line ${this.line}, column ${startColumn}`);
            }

            if (this.peek() === '\\')
            {
                this.advance();
                
                if (!this.isAtEnd())
                {
                    const escaped = this.peek();
                    
                    switch (escaped)
                    {
                        case 'n':
                            value += '\n';
                            break;
                        case 't':
                            value += '\t';
                            break;
                        case 'r':
                            value += '\r';
                            break;
                        case '\\':
                            value += '\\';
                            break;
                        case '"':
                            value += '"';
                            break;
                        default:
                            value += escaped;
                            break;
                    }
                    
                    this.advance();
                }
            }
            else
            {
                value += this.peek();
                this.advance();
            }
        }

        if (this.isAtEnd())
        {
            return failure(`Unterminated string at line ${this.line}, column ${startColumn}`);
        }

        this.advance();
        return success(this.makeToken(TokenType.String, value, startColumn));
    }

    private readNumber(): ParseResult<Token>
    {
        const startColumn = this.column;
        let value = '';
        let hasDecimal = false;
        let hasExponent = false;

        // Numeric core: digits with an optional single decimal point.
        // We stop when we hit a second '.' so the caller can treat it as a dot token (or error).
        while (!this.isAtEnd() && (this.isDigit(this.peek()) || this.peek() === '.'))
        {
            if (this.peek() === '.')
            {
                if (hasDecimal)
                {
                    break;
                }
                
                hasDecimal = true;
            }
            
            value += this.peek();
            this.advance();
        }

        if (!this.isAtEnd() && (this.peek() === 'E' || this.peek() === 'e'))
        {
            // Exponent suffix (e.g. 1e3, 1.2E-3).
            hasExponent = true;
            value += this.peek();
            this.advance();

            if (!this.isAtEnd() && (this.peek() === '+' || this.peek() === '-'))
            {
                value += this.peek();
                this.advance();
            }

            while (!this.isAtEnd() && this.isDigit(this.peek()))
            {
                value += this.peek();
                this.advance();
            }
        }

        if (!this.isAtEnd() && (this.peek() === 'i' || this.peek() === 'I'))
        {
            // Imaginary-only complex literal (e.g. "3i" or "3.2E1i").
            value += this.peek();
            this.advance();
            return success(this.makeToken(TokenType.Complex, value, startColumn));
        }

        // Full complex literal form: <realPart><+|-><imagPart>i
        //
        // This is implemented as a speculative parse:
        // - if we don't end up with a trailing 'i', we roll back and leave the sign for the parser
        //   (so "2-3" becomes Integer(2) Minus Integer(3), not a broken complex token).
        if (!this.isAtEnd() && (this.peek() === '+' || this.peek() === '-'))
        {
            const savedPosition = this.position;
            const savedColumn = this.column;
            const sign = this.peek();
            this.advance();

            if (!this.isAtEnd() && this.isDigit(this.peek()))
            {
                let imagPart = sign;
                
                while (!this.isAtEnd() && (this.isDigit(this.peek()) || this.peek() === '.'))
                {
                    imagPart += this.peek();
                    this.advance();
                }

                if (!this.isAtEnd() && (this.peek() === 'E' || this.peek() === 'e'))
                {
                    imagPart += this.peek();
                    this.advance();

                    if (!this.isAtEnd() && (this.peek() === '+' || this.peek() === '-'))
                    {
                        imagPart += this.peek();
                        this.advance();
                    }

                    while (!this.isAtEnd() && this.isDigit(this.peek()))
                    {
                        imagPart += this.peek();
                        this.advance();
                    }
                }

                if (!this.isAtEnd() && (this.peek() === 'i' || this.peek() === 'I'))
                {
                    value += imagPart + this.peek();
                    this.advance();
                    return success(this.makeToken(TokenType.Complex, value, startColumn));
                }
            }

            this.position = savedPosition;
            this.column = savedColumn;
        }

        const tokenType = (hasDecimal || hasExponent) ? TokenType.Real : TokenType.Integer;
        return success(this.makeToken(tokenType, value, startColumn));
    }

    private readHexNumber(): ParseResult<Token>
    {
        const startColumn = this.column;
        this.advance();
        this.advance();

        let value = '';
        
        while (!this.isAtEnd() && this.isHexDigit(this.peek()))
        {
            value += this.peek();
            this.advance();
        }

        if (value.length === 0)
        {
            return failure(`Invalid hex number at line ${this.line}, column ${startColumn}`);
        }

        return success(this.makeToken(TokenType.Integer, parseInt(value, 16).toString(), startColumn));
    }

    private readBinaryNumber(): ParseResult<Token>
    {
        const startColumn = this.column;
        this.advance();
        this.advance();

        let value = '';
        
        while (!this.isAtEnd() && (this.peek() === '0' || this.peek() === '1' || this.peek() === '_'))
        {
            if (this.peek() !== '_')
            {
                value += this.peek();
            }
            
            this.advance();
        }

        if (value.length === 0)
        {
            return failure(`Invalid binary number at line ${this.line}, column ${startColumn}`);
        }

        return success(this.makeToken(TokenType.Integer, parseInt(value, 2).toString(), startColumn));
    }

    private readIdentifierOrKeyword(): ParseResult<Token>
    {
        const startColumn = this.column;
        let value = '';

        // Identifiers are alphanumeric with underscores. Case is preserved for identifiers,
        // but keywords are normalized to uppercase for simpler parser comparisons.
        while (!this.isAtEnd() && (this.isAlphaNumeric(this.peek()) || this.peek() === '_'))
        {
            value += this.peek();
            this.advance();
        }

        if (!this.isAtEnd())
        {
            const sigil = this.peek();
            
            // Type sigils are part of the identifier token, not standalone tokens.
            // Examples: x%, name$, pi#, handle&
            if (sigil === '%' || sigil === '#' || sigil === '$' || sigil === '&')
            {
                value += sigil;
                this.advance();
            }
        }

        // Optional array rank suffix as part of the identifier:
        // - 1D: []
        // - 2D: [,]
        // - 3D: [,,]
        //
        // This suffix is only consumed when it contains ONLY commas (or is empty) to avoid
        // interfering with normal array indexing like a#[i, j].
        if (!this.isAtEnd() && this.peek() === '[')
        {
            const savedPosition = this.position;
            const savedColumn = this.column;

            // Consume '[' tentatively; we may roll back if this isn't a rank suffix.
            this.advance();

            let commaCount = 0;
            while (!this.isAtEnd() && this.peek() === ',')
            {
                commaCount++;
                this.advance();
            }

            if (!this.isAtEnd() && this.peek() === ']')
            {
                // It was a rank suffix, so we keep it as part of the identifier.
                this.advance();
                value += `[${','.repeat(commaCount)}]`;
            }
            else
            {
                // Not a rank suffix (likely normal indexing like a#[i, j]), so roll back.
                this.position = savedPosition;
                this.column = savedColumn;
            }
        }

        const upper = value.toUpperCase();
        
        if (Keywords.isKeyword(upper))
        {
            return success(this.makeToken(TokenType.Keyword, upper, startColumn));
        }

        return success(this.makeToken(TokenType.Identifier, value, startColumn));
    }

    private skipWhitespace(): void
    {
        // Whitespace and comments are skipped here so tokenization remains a clean stream.
        // Note: newline is handled via advance() so that line/column tracking stays consistent.
        while (!this.isAtEnd())
        {
            const char = this.peek();
            
            if (char === ' ' || char === '\t' || char === '\r')
            {
                this.advance();
            }
            else if (char === '\n')
            {
                this.advance();
            }
            else if (char === "'")
            {
                // BASIC comment: apostrophe to end-of-line.
                while (!this.isAtEnd() && this.peek() !== '\n')
                {
                    this.advance();
                }
            }
            else
            {
                break;
            }
        }
    }

    private peek(): string
    {
        if (this.isAtEnd())
        {
            return '\0';
        }
        
        return this.source[this.position];
    }

    private peekNext(): string
    {
        if (this.position + 1 >= this.source.length)
        {
            return '\0';
        }
        
        return this.source[this.position + 1];
    }

    private advance(): void
    {
        // We read the current char before incrementing position so we can correctly update
        // line/column tracking when consuming '\n'.
        const char = this.peek();
        this.position++;

        if (char === '\n')
        {
            this.line++;
            this.column = 1;
        }
        else
        {
            this.column++;
        }
    }

    private isAtEnd(): boolean
    {
        return this.position >= this.source.length;
    }

    private isDigit(char: string): boolean
    {
        return char >= '0' && char <= '9';
    }

    private isHexDigit(char: string): boolean
    {
        return (char >= '0' && char <= '9') || 
               (char >= 'A' && char <= 'F') || 
               (char >= 'a' && char <= 'f');
    }

    private isAlpha(char: string): boolean
    {
        return (char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z');
    }

    private isAlphaNumeric(char: string): boolean
    {
        return this.isAlpha(char) || this.isDigit(char);
    }

    private makeToken(type: TokenType, value: string, column?: number): Token
    {
        return {
            type,
            value,
            line: this.line,
            column: column ?? this.column
        };
    }
}
