/**
 * Example: Testing a Simple Lexer/Tokenizer for EduBASIC
 * Demonstrates testing token recognition and type sigil handling
 */

describe('EduBASIC Lexer (Example)', () => {

    enum TokenType {
        KEYWORD = 'KEYWORD',
        IDENTIFIER = 'IDENTIFIER',
        NUMBER = 'NUMBER',
        STRING = 'STRING',
        OPERATOR = 'OPERATOR',
        WHITESPACE = 'WHITESPACE',
        EOF = 'EOF'
    }

    enum DataType {
        INTEGER = 'INTEGER',
        REAL = 'REAL',
        STRING = 'STRING',
        COMPLEX = 'COMPLEX',
        NONE = 'NONE'
    }

    interface Token {
        type: TokenType;
        value: string;
        dataType?: DataType;
    }

    class SimpleLexer {
        private pos: number = 0;
        private input: string = '';

        tokenize(input: string): Token[] {
            this.input = input;
            this.pos = 0;
            const tokens: Token[] = [];

            while (this.pos < this.input.length)
            {
                const char = this.input[ this.pos ];

                if (/\s/.test(char))
                {
                    this.pos++;
                    continue;
                }

                if (/[a-zA-Z]/.test(char))
                {
                    tokens.push(this.readIdentifierOrKeyword());
                } else if (/\d/.test(char))
                {
                    tokens.push(this.readNumber());
                } else if (char === '"')
                {
                    tokens.push(this.readString());
                } else if ('+-*/=<>'.includes(char))
                {
                    tokens.push({ type: TokenType.OPERATOR, value: char });
                    this.pos++;
                } else
                {
                    this.pos++;
                }
            }

            return tokens;
        }

        private readIdentifierOrKeyword(): Token {
            let value = '';

            while (this.pos < this.input.length && /[a-zA-Z0-9]/.test(this.input[ this.pos ]))
            {
                value += this.input[ this.pos ];
                this.pos++;
            }

            // Check for type sigil
            if (this.pos < this.input.length)
            {
                const sigil = this.input[ this.pos ];
                let dataType: DataType = DataType.NONE;

                if (sigil === '%')
                {
                    dataType = DataType.INTEGER;
                    value += sigil;
                    this.pos++;
                } else if (sigil === '#')
                {
                    dataType = DataType.REAL;
                    value += sigil;
                    this.pos++;
                } else if (sigil === '$')
                {
                    dataType = DataType.STRING;
                    value += sigil;
                    this.pos++;
                } else if (sigil === '&')
                {
                    dataType = DataType.COMPLEX;
                    value += sigil;
                    this.pos++;
                }

                if (dataType !== DataType.NONE)
                {
                    return { type: TokenType.IDENTIFIER, value, dataType };
                }
            }

            // Check if it's a keyword
            const keywords = [ 'LET', 'DIM', 'IF', 'THEN', 'ELSE', 'FOR', 'TO', 'NEXT', 'WHILE', 'WEND', 'PRINT' ];
            if (keywords.includes(value.toUpperCase()))
            {
                return { type: TokenType.KEYWORD, value: value.toUpperCase() };
            }

            return { type: TokenType.IDENTIFIER, value };
        }

        private readNumber(): Token {
            let value = '';

            while (this.pos < this.input.length && /\d/.test(this.input[ this.pos ]))
            {
                value += this.input[ this.pos ];
                this.pos++;
            }

            // Check for decimal point
            if (this.pos < this.input.length && this.input[ this.pos ] === '.')
            {
                value += '.';
                this.pos++;

                while (this.pos < this.input.length && /\d/.test(this.input[ this.pos ]))
                {
                    value += this.input[ this.pos ];
                    this.pos++;
                }
            }

            return { type: TokenType.NUMBER, value };
        }

        private readString(): Token {
            let value = '';

            this.pos++; // Skip opening quote

            while (this.pos < this.input.length && this.input[ this.pos ] !== '"')
            {
                value += this.input[ this.pos ];
                this.pos++;
            }

            this.pos++; // Skip closing quote

            return { type: TokenType.STRING, value };
        }
    }

    let lexer: SimpleLexer;

    beforeEach(() => {
        lexer = new SimpleLexer();
    });

    describe('Variable Names with Type Sigils', () => {

        it('should tokenize integer variable (% sigil)', () => {
            const tokens = lexer.tokenize('count%');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[ 0 ].value).toBe('count%');
            expect(tokens[ 0 ].dataType).toBe(DataType.INTEGER);
        });

        it('should tokenize real variable (# sigil)', () => {
            const tokens = lexer.tokenize('temperature#');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[ 0 ].dataType).toBe(DataType.REAL);
        });

        it('should tokenize string variable ($ sigil)', () => {
            const tokens = lexer.tokenize('name$');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[ 0 ].dataType).toBe(DataType.STRING);
        });

        it('should tokenize complex variable (& sigil)', () => {
            const tokens = lexer.tokenize('impedance&');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[ 0 ].dataType).toBe(DataType.COMPLEX);
        });

        it('should handle mixed case variable names', () => {
            const tokens = lexer.tokenize('StudentCount%');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].value).toBe('StudentCount%');
            expect(tokens[ 0 ].dataType).toBe(DataType.INTEGER);
        });
    });

    describe('Keywords', () => {

        it('should recognize LET keyword', () => {
            const tokens = lexer.tokenize('LET');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.KEYWORD);
            expect(tokens[ 0 ].value).toBe('LET');
        });

        it('should recognize keywords in lowercase', () => {
            const tokens = lexer.tokenize('let');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.KEYWORD);
            expect(tokens[ 0 ].value).toBe('LET');
        });

        it('should recognize multiple keywords', () => {
            const keywords = [ 'IF', 'THEN', 'ELSE', 'FOR', 'WHILE', 'PRINT' ];

            keywords.forEach(keyword => {
                const tokens = lexer.tokenize(keyword);
                expect(tokens[ 0 ].type).toBe(TokenType.KEYWORD);
            });
        });
    });

    describe('Literals', () => {

        it('should tokenize integer literals', () => {
            const tokens = lexer.tokenize('42');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.NUMBER);
            expect(tokens[ 0 ].value).toBe('42');
        });

        it('should tokenize real literals with decimal point', () => {
            const tokens = lexer.tokenize('3.14159');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.NUMBER);
            expect(tokens[ 0 ].value).toBe('3.14159');
        });

        it('should tokenize string literals', () => {
            const tokens = lexer.tokenize('"Hello, World!"');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.STRING);
            expect(tokens[ 0 ].value).toBe('Hello, World!');
        });

        it('should tokenize empty strings', () => {
            const tokens = lexer.tokenize('""');

            expect(tokens.length).toBe(1);
            expect(tokens[ 0 ].type).toBe(TokenType.STRING);
            expect(tokens[ 0 ].value).toBe('');
        });
    });

    describe('Complete Statements', () => {

        it('should tokenize simple LET statement', () => {
            const tokens = lexer.tokenize('LET x% = 10');

            expect(tokens.length).toBe(4);
            expect(tokens[ 0 ]).toEqual({ type: TokenType.KEYWORD, value: 'LET' });
            expect(tokens[ 1 ]).toEqual({ type: TokenType.IDENTIFIER, value: 'x%', dataType: DataType.INTEGER });
            expect(tokens[ 2 ]).toEqual({ type: TokenType.OPERATOR, value: '=' });
            expect(tokens[ 3 ]).toEqual({ type: TokenType.NUMBER, value: '10' });
        });

        it('should tokenize PRINT statement with string', () => {
            const tokens = lexer.tokenize('PRINT "Hello"');

            expect(tokens.length).toBe(2);
            expect(tokens[ 0 ]).toEqual({ type: TokenType.KEYWORD, value: 'PRINT' });
            expect(tokens[ 1 ]).toEqual({ type: TokenType.STRING, value: 'Hello' });
        });

        it('should tokenize arithmetic expression', () => {
            const tokens = lexer.tokenize('x% = 2 + 3 * 4');

            expect(tokens.length).toBe(7);
            expect(tokens[ 0 ].value).toBe('x%');
            expect(tokens[ 1 ].value).toBe('=');
            expect(tokens[ 2 ].value).toBe('2');
            expect(tokens[ 3 ].value).toBe('+');
            expect(tokens[ 4 ].value).toBe('3');
            expect(tokens[ 5 ].value).toBe('*');
            expect(tokens[ 6 ].value).toBe('4');
        });

        it('should tokenize FOR loop header', () => {
            const tokens = lexer.tokenize('FOR i% = 1 TO 10');

            expect(tokens.length).toBe(6);
            expect(tokens[ 0 ].value).toBe('FOR');
            expect(tokens[ 1 ].value).toBe('i%');
            expect(tokens[ 2 ].value).toBe('=');
            expect(tokens[ 3 ].value).toBe('1');
            expect(tokens[ 4 ].value).toBe('TO');
            expect(tokens[ 5 ].value).toBe('10');
        });
    });

    describe('Edge Cases', () => {

        it('should handle empty input', () => {
            const tokens = lexer.tokenize('');
            expect(tokens.length).toBe(0);
        });

        it('should skip whitespace', () => {
            const tokens = lexer.tokenize('  LET   x%   =   5  ');
            expect(tokens.length).toBe(4);
        });

        it('should handle tabs and newlines', () => {
            const tokens = lexer.tokenize('LET\tx%\n=\t5');
            expect(tokens.length).toBe(4);
        });

        it('should handle consecutive operators', () => {
            const tokens = lexer.tokenize('x%=5+3');
            expect(tokens.length).toBe(5);
        });
    });

});

