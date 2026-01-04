import { Tokenizer, TokenType } from '../src/app/interpreter/tokenizer.service';

describe('Tokenizer', () =>
{
    let tokenizer: Tokenizer;

    beforeEach(() =>
    {
        tokenizer = new Tokenizer();
    });

    describe('Literals', () =>
    {
        it('should tokenize integer literals', () =>
        {
            const tokens = tokenizer.tokenize('123 0 9001');
            
            expect(tokens[0].type).toBe(TokenType.Integer);
            expect(tokens[0].value).toBe('123');
            expect(tokens[1].type).toBe(TokenType.Integer);
            expect(tokens[1].value).toBe('0');
            expect(tokens[2].type).toBe(TokenType.Integer);
            expect(tokens[2].value).toBe('9001');
        });

        it('should tokenize hexadecimal literals', () =>
        {
            const tokens = tokenizer.tokenize('&HFF &H7F2A');
            
            expect(tokens[0].type).toBe(TokenType.Integer);
            expect(tokens[0].value).toBe('255');
            expect(tokens[1].type).toBe(TokenType.Integer);
            expect(tokens[1].value).toBe('32554');
        });

        it('should tokenize binary literals', () =>
        {
            const tokens = tokenizer.tokenize('&B101 &B1101_0011');
            
            expect(tokens[0].type).toBe(TokenType.Integer);
            expect(tokens[0].value).toBe('5');
            expect(tokens[1].type).toBe(TokenType.Integer);
            expect(tokens[1].value).toBe('211');
        });

        it('should tokenize real literals', () =>
        {
            const tokens = tokenizer.tokenize('3.14 10. .25');
            
            expect(tokens[0].type).toBe(TokenType.Real);
            expect(tokens[0].value).toBe('3.14');
            expect(tokens[1].type).toBe(TokenType.Real);
            expect(tokens[1].value).toBe('10.');
            expect(tokens[2].type).toBe(TokenType.Real);
            expect(tokens[2].value).toBe('.25');
        });

        it('should tokenize scientific notation', () =>
        {
            const tokens = tokenizer.tokenize('1E6 3.2E-4');
            
            expect(tokens[0].type).toBe(TokenType.Real);
            expect(tokens[0].value).toBe('1E6');
            expect(tokens[1].type).toBe(TokenType.Real);
            expect(tokens[1].value).toBe('3.2E-4');
        });

        it('should tokenize complex literals', () =>
        {
            const tokens = tokenizer.tokenize('4i 3+4i 10.5-2.5i');
            
            expect(tokens[0].type).toBe(TokenType.Complex);
            expect(tokens[0].value).toBe('4i');
            expect(tokens[1].type).toBe(TokenType.Complex);
            expect(tokens[1].value).toBe('3+4i');
            expect(tokens[2].type).toBe(TokenType.Complex);
            expect(tokens[2].value).toBe('10.5-2.5i');
        });

        it('should tokenize string literals', () =>
        {
            const tokens = tokenizer.tokenize('"Hello" "World"');
            
            expect(tokens[0].type).toBe(TokenType.String);
            expect(tokens[0].value).toBe('Hello');
            expect(tokens[1].type).toBe(TokenType.String);
            expect(tokens[1].value).toBe('World');
        });

        it('should handle escape sequences in strings', () =>
        {
            const tokens = tokenizer.tokenize('"Line1\\nLine2"');
            
            expect(tokens[0].type).toBe(TokenType.String);
            expect(tokens[0].value).toBe('Line1\nLine2');
        });
    });

    describe('Identifiers and Sigils', () =>
    {
        it('should tokenize identifiers with type sigils', () =>
        {
            const tokens = tokenizer.tokenize('count% value# name$ z&');
            
            expect(tokens[0].type).toBe(TokenType.Identifier);
            expect(tokens[0].value).toBe('count%');
            expect(tokens[1].type).toBe(TokenType.Identifier);
            expect(tokens[1].value).toBe('value#');
            expect(tokens[2].type).toBe(TokenType.Identifier);
            expect(tokens[2].value).toBe('name$');
            expect(tokens[3].type).toBe(TokenType.Identifier);
            expect(tokens[3].value).toBe('z&');
        });

        it('should tokenize array identifiers', () =>
        {
            const tokens = tokenizer.tokenize('numbers%[] names$[]');
            
            expect(tokens[0].type).toBe(TokenType.Identifier);
            expect(tokens[0].value).toBe('numbers%[]');
            expect(tokens[1].type).toBe(TokenType.Identifier);
            expect(tokens[1].value).toBe('names$[]');
        });

        it('should tokenize structure identifiers', () =>
        {
            const tokens = tokenizer.tokenize('player point config');
            
            expect(tokens[0].type).toBe(TokenType.Identifier);
            expect(tokens[0].value).toBe('player');
            expect(tokens[1].type).toBe(TokenType.Identifier);
            expect(tokens[1].value).toBe('point');
            expect(tokens[2].type).toBe(TokenType.Identifier);
            expect(tokens[2].value).toBe('config');
        });
    });

    describe('Operators', () =>
    {
        it('should tokenize arithmetic operators', () =>
        {
            const tokens = tokenizer.tokenize('+ - * / ^ **');
            
            expect(tokens[0].type).toBe(TokenType.Plus);
            expect(tokens[1].type).toBe(TokenType.Minus);
            expect(tokens[2].type).toBe(TokenType.Star);
            expect(tokens[3].type).toBe(TokenType.Slash);
            expect(tokens[4].type).toBe(TokenType.Caret);
            expect(tokens[5].type).toBe(TokenType.StarStar);
        });

        it('should tokenize comparison operators', () =>
        {
            const tokens = tokenizer.tokenize('= <> < > <= >=');
            
            expect(tokens[0].type).toBe(TokenType.Equal);
            expect(tokens[1].type).toBe(TokenType.NotEqual);
            expect(tokens[2].type).toBe(TokenType.Less);
            expect(tokens[3].type).toBe(TokenType.Greater);
            expect(tokens[4].type).toBe(TokenType.LessEqual);
            expect(tokens[5].type).toBe(TokenType.GreaterEqual);
        });

        it('should tokenize logical operators as keywords', () =>
        {
            const tokens = tokenizer.tokenize('AND OR NOT XOR');
            
            expect(tokens[0].type).toBe(TokenType.Keyword);
            expect(tokens[0].value).toBe('AND');
            expect(tokens[1].type).toBe(TokenType.Keyword);
            expect(tokens[1].value).toBe('OR');
            expect(tokens[2].type).toBe(TokenType.Keyword);
            expect(tokens[2].value).toBe('NOT');
            expect(tokens[3].type).toBe(TokenType.Keyword);
            expect(tokens[3].value).toBe('XOR');
        });
    });

    describe('Keywords', () =>
    {
        it('should recognize statement keywords', () =>
        {
            const tokens = tokenizer.tokenize('LET PRINT IF THEN END');
            
            expect(tokens[0].type).toBe(TokenType.Keyword);
            expect(tokens[0].value).toBe('LET');
            expect(tokens[1].type).toBe(TokenType.Keyword);
            expect(tokens[1].value).toBe('PRINT');
            expect(tokens[2].type).toBe(TokenType.Keyword);
            expect(tokens[2].value).toBe('IF');
            expect(tokens[3].type).toBe(TokenType.Keyword);
            expect(tokens[3].value).toBe('THEN');
            expect(tokens[4].type).toBe(TokenType.Keyword);
            expect(tokens[4].value).toBe('END');
        });

        it('should be case-insensitive for keywords', () =>
        {
            const tokens = tokenizer.tokenize('let Let LET');
            
            expect(tokens[0].type).toBe(TokenType.Keyword);
            expect(tokens[0].value).toBe('LET');
            expect(tokens[1].type).toBe(TokenType.Keyword);
            expect(tokens[1].value).toBe('LET');
            expect(tokens[2].type).toBe(TokenType.Keyword);
            expect(tokens[2].value).toBe('LET');
        });
    });

    describe('Comments', () =>
    {
        it('should skip comments', () =>
        {
            const tokens = tokenizer.tokenize("123 ' this is a comment\n456");
            
            expect(tokens.length).toBe(3);
            expect(tokens[0].value).toBe('123');
            expect(tokens[1].value).toBe('456');
            expect(tokens[2].type).toBe(TokenType.EOF);
        });
    });

    describe('Complex Expressions', () =>
    {
        it('should tokenize a complete expression', () =>
        {
            const tokens = tokenizer.tokenize('x% + y% * 2');
            
            expect(tokens[0].value).toBe('x%');
            expect(tokens[1].type).toBe(TokenType.Plus);
            expect(tokens[2].value).toBe('y%');
            expect(tokens[3].type).toBe(TokenType.Star);
            expect(tokens[4].value).toBe('2');
        });

        it('should tokenize parenthesized expressions', () =>
        {
            const tokens = tokenizer.tokenize('(x% + y%) * 2');
            
            expect(tokens[0].type).toBe(TokenType.LeftParen);
            expect(tokens[1].value).toBe('x%');
            expect(tokens[2].type).toBe(TokenType.Plus);
            expect(tokens[3].value).toBe('y%');
            expect(tokens[4].type).toBe(TokenType.RightParen);
            expect(tokens[5].type).toBe(TokenType.Star);
            expect(tokens[6].value).toBe('2');
        });
    });
});

