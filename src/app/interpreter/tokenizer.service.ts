export enum TokenType
{
    EOF,
    
    Integer,
    Real,
    Complex,
    String,
    
    Identifier,
    Keyword,
    
    Plus,
    Minus,
    Star,
    Slash,
    Caret,
    StarStar,
    
    Equal,
    NotEqual,
    Less,
    Greater,
    LessEqual,
    GreaterEqual,
    
    LeftParen,
    RightParen,
    LeftBracket,
    RightBracket,
    LeftBrace,
    RightBrace,
    
    Comma,
    Colon,
    Semicolon,
    Pipe,
    Exclamation,
}

export interface Token
{
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

export class Tokenizer
{
    private source: string = '';
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;

    public tokenize(source: string): Token[]
    {
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

            const token = this.nextToken();
            
            if (token)
            {
                tokens.push(token);
            }
        }

        tokens.push(this.makeToken(TokenType.EOF, ''));
        return tokens;
    }

    private nextToken(): Token | null
    {
        const startColumn = this.column;
        const char = this.peek();

        if (char === '"')
        {
            return this.readString();
        }

        if (this.isDigit(char) || (char === '.' && this.isDigit(this.peekNext())))
        {
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
                return this.makeToken(TokenType.Plus, '+', startColumn);

            case '-':
                this.advance();
                return this.makeToken(TokenType.Minus, '-', startColumn);

            case '/':
                this.advance();
                return this.makeToken(TokenType.Slash, '/', startColumn);

            case '^':
                this.advance();
                return this.makeToken(TokenType.Caret, '^', startColumn);

            case '*':
                this.advance();
                
                if (this.peek() === '*')
                {
                    this.advance();
                    return this.makeToken(TokenType.StarStar, '**', startColumn);
                }
                
                return this.makeToken(TokenType.Star, '*', startColumn);

            case '=':
                this.advance();
                return this.makeToken(TokenType.Equal, '=', startColumn);

            case '<':
                this.advance();
                
                if (this.peek() === '>')
                {
                    this.advance();
                    return this.makeToken(TokenType.NotEqual, '<>', startColumn);
                }
                else if (this.peek() === '=')
                {
                    this.advance();
                    return this.makeToken(TokenType.LessEqual, '<=', startColumn);
                }
                
                return this.makeToken(TokenType.Less, '<', startColumn);

            case '>':
                this.advance();
                
                if (this.peek() === '=')
                {
                    this.advance();
                    return this.makeToken(TokenType.GreaterEqual, '>=', startColumn);
                }
                
                return this.makeToken(TokenType.Greater, '>', startColumn);

            case '(':
                this.advance();
                return this.makeToken(TokenType.LeftParen, '(', startColumn);

            case ')':
                this.advance();
                return this.makeToken(TokenType.RightParen, ')', startColumn);

            case '[':
                this.advance();
                return this.makeToken(TokenType.LeftBracket, '[', startColumn);

            case ']':
                this.advance();
                return this.makeToken(TokenType.RightBracket, ']', startColumn);

            case '{':
                this.advance();
                return this.makeToken(TokenType.LeftBrace, '{', startColumn);

            case '}':
                this.advance();
                return this.makeToken(TokenType.RightBrace, '}', startColumn);

            case ',':
                this.advance();
                return this.makeToken(TokenType.Comma, ',', startColumn);

            case ':':
                this.advance();
                return this.makeToken(TokenType.Colon, ':', startColumn);

            case ';':
                this.advance();
                return this.makeToken(TokenType.Semicolon, ';', startColumn);

            case '|':
                this.advance();
                return this.makeToken(TokenType.Pipe, '|', startColumn);

            case '!':
                this.advance();
                return this.makeToken(TokenType.Exclamation, '!', startColumn);

            default:
                throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
        }
    }

    private readString(): Token
    {
        const startColumn = this.column;
        this.advance();
        
        let value = '';
        
        while (!this.isAtEnd() && this.peek() !== '"')
        {
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
            throw new Error(`Unterminated string at line ${this.line}`);
        }

        this.advance();
        return this.makeToken(TokenType.String, value, startColumn);
    }

    private readNumber(): Token
    {
        const startColumn = this.column;
        let value = '';
        let hasDecimal = false;
        let hasExponent = false;

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
            value += this.peek();
            this.advance();
            return this.makeToken(TokenType.Complex, value, startColumn);
        }

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
                    return this.makeToken(TokenType.Complex, value, startColumn);
                }
            }

            this.position = savedPosition;
            this.column = savedColumn;
        }

        const tokenType = (hasDecimal || hasExponent) ? TokenType.Real : TokenType.Integer;
        return this.makeToken(tokenType, value, startColumn);
    }

    private readHexNumber(): Token
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
            throw new Error(`Invalid hex number at line ${this.line}, column ${startColumn}`);
        }

        return this.makeToken(TokenType.Integer, parseInt(value, 16).toString(), startColumn);
    }

    private readBinaryNumber(): Token
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
            throw new Error(`Invalid binary number at line ${this.line}, column ${startColumn}`);
        }

        return this.makeToken(TokenType.Integer, parseInt(value, 2).toString(), startColumn);
    }

    private readIdentifierOrKeyword(): Token
    {
        const startColumn = this.column;
        let value = '';

        while (!this.isAtEnd() && (this.isAlphaNumeric(this.peek()) || this.peek() === '_'))
        {
            value += this.peek();
            this.advance();
        }

        if (!this.isAtEnd())
        {
            const sigil = this.peek();
            
            if (sigil === '%' || sigil === '#' || sigil === '$' || sigil === '&')
            {
                value += sigil;
                this.advance();

                if (this.peek() === '[' && this.peekNext() === ']')
                {
                    value += '[]';
                    this.advance();
                    this.advance();
                }
            }
        }

        const upper = value.toUpperCase();
        
        if (this.isKeyword(upper))
        {
            return this.makeToken(TokenType.Keyword, upper, startColumn);
        }

        return this.makeToken(TokenType.Identifier, value, startColumn);
    }

    private isKeyword(word: string): boolean
    {
        const keywords = new Set([
            'LET', 'DIM', 'LOCAL', 'IF', 'THEN', 'ELSE', 'ELSEIF', 'END', 'FOR', 'TO', 'STEP', 'NEXT',
            'WHILE', 'WEND', 'DO', 'LOOP', 'UNTIL', 'UEND', 'UNLESS', 'SELECT', 'CASE', 'GOSUB', 'RETURN',
            'GOTO', 'LABEL', 'CALL', 'PRINT', 'INPUT', 'READ', 'DATA', 'RESTORE', 'CLS', 'COLOR', 'LOCATE',
            'PSET', 'LINE', 'CIRCLE', 'RECTANGLE', 'OVAL', 'TRIANGLE', 'PAINT', 'GET', 'PUT',
            'OPEN', 'CLOSE', 'WRITE', 'SEEK', 'EOF', 'LOC', 'EXISTS',
            'PLAY', 'TEMPO', 'VOLUME', 'VOICE', 'ATTACK', 'DECAY', 'SUSTAIN', 'RELEASE',
            'SLEEP', 'RANDOMIZE', 'EXIT', 'CONTINUE', 'SUB', 'TRY', 'CATCH', 'FINALLY', 'THROW',
            'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR', 'IMP', 'MOD',
            'SIN', 'COS', 'TAN', 'ASIN', 'ACOS', 'ATAN', 'SINH', 'COSH', 'TANH',
            'ASINH', 'ACOSH', 'ATANH', 'EXP', 'LOG', 'LOG10', 'LOG2', 'SQRT', 'CBRT',
            'FLOOR', 'CEIL', 'ROUND', 'TRUNC', 'ABS', 'SGN', 'INT',
            'REAL', 'IMAG', 'CONJ', 'CABS', 'CARG', 'CSQRT',
            'ASC', 'CHR', 'STR', 'VAL', 'HEX', 'BIN', 'UCASE', 'LCASE',
            'LTRIM', 'RTRIM', 'TRIM', 'REVERSE', 'LEN', 'LEFT', 'RIGHT', 'MID',
            'INSTR', 'JOIN', 'REPLACE', 'FIND', 'INDEXOF', 'INCLUDES',
            'RND', 'PI', 'E', 'TRUE', 'FALSE', 'INKEY', 'DATE', 'TIME', 'NOW',
            'DEG', 'RAD', 'EXPAND', 'NOTES', 'TURTLE', 'ARC', 'READFILE', 'WRITEFILE',
            'LISTDIR', 'MKDIR', 'RMDIR', 'COPY', 'MOVE', 'DELETE', 'SET', 'STARTSWITH', 'ENDSWITH',
            'PUSH', 'POP', 'SHIFT', 'UNSHIFT', 'FROM', 'WITH', 'AS', 'FOR', 'BYREF', 'APPEND', 'OVERWRITE',
            'AT', 'RADIUS', 'RADII', 'FILLED', 'PRESET'
        ]);

        return keywords.has(word);
    }

    private skipWhitespace(): void
    {
        while (!this.isAtEnd())
        {
            const char = this.peek();
            
            if (char === ' ' || char === '\t' || char === '\r')
            {
                this.advance();
            }
            else if (char === '\n')
            {
                this.line++;
                this.column = 1;
                this.advance();
            }
            else if (char === "'")
            {
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
        this.position++;
        this.column++;
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

