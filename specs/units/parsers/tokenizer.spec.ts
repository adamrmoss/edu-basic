import { Tokenizer, TokenType } from '@/app/interpreter/tokenizer.service';

describe('Tokenizer', () =>
{
    let tokenizer: Tokenizer;

    beforeEach(() =>
    {
        tokenizer = new Tokenizer();
    });

    describe('Integer Literals', () =>
    {
        it('should tokenize decimal integers', () =>
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

        it('should handle case insensitive hex prefix', () =>
        {
            const tokens = tokenizer.tokenize('&hff &HFF');
            
            expect(tokens[0].value).toBe('255');
            expect(tokens[1].value).toBe('255');
        });

        it('should throw error on invalid hex number', () =>
        {
            expect(() => tokenizer.tokenize('&H')).toThrow('Invalid hex number');
        });

        it('should tokenize binary literals', () =>
        {
            const tokens = tokenizer.tokenize('&B101 &B1101_0011');
            
            expect(tokens[0].type).toBe(TokenType.Integer);
            expect(tokens[0].value).toBe('5');
            expect(tokens[1].type).toBe(TokenType.Integer);
            expect(tokens[1].value).toBe('211');
        });

        it('should handle case insensitive binary prefix', () =>
        {
            const tokens = tokenizer.tokenize('&b101 &B101');
            
            expect(tokens[0].value).toBe('5');
            expect(tokens[1].value).toBe('5');
        });

        it('should throw error on invalid binary number', () =>
        {
            expect(() => tokenizer.tokenize('&B')).toThrow('Invalid binary number');
        });
    });

    describe('Real Literals', () =>
    {
        it('should tokenize basic real numbers', () =>
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
            const tokens = tokenizer.tokenize('1E6 3.2E-4 1.5E+10');
            
            expect(tokens[0].type).toBe(TokenType.Real);
            expect(tokens[0].value).toBe('1E6');
            expect(tokens[1].type).toBe(TokenType.Real);
            expect(tokens[1].value).toBe('3.2E-4');
            expect(tokens[2].type).toBe(TokenType.Real);
            expect(tokens[2].value).toBe('1.5E+10');
        });

        it('should handle case insensitive exponent', () =>
        {
            const tokens = tokenizer.tokenize('1e6 1E6');
            
            expect(tokens[0].type).toBe(TokenType.Real);
            expect(tokens[0].value).toBe('1e6');
            expect(tokens[1].type).toBe(TokenType.Real);
            expect(tokens[1].value).toBe('1E6');
        });
    });

    describe('Complex Literals', () =>
    {
        it('should tokenize basic complex numbers', () =>
        {
            const tokens = tokenizer.tokenize('4i 3+4i 10.5-2.5i');
            
            expect(tokens[0].type).toBe(TokenType.Complex);
            expect(tokens[0].value).toBe('4i');
            expect(tokens[1].type).toBe(TokenType.Complex);
            expect(tokens[1].value).toBe('3+4i');
            expect(tokens[2].type).toBe(TokenType.Complex);
            expect(tokens[2].value).toBe('10.5-2.5i');
        });

        it('should handle case insensitive imaginary unit', () =>
        {
            const tokens = tokenizer.tokenize('3i 3I');
            
            expect(tokens[0].type).toBe(TokenType.Complex);
            expect(tokens[1].type).toBe(TokenType.Complex);
        });

        it('should handle complex with scientific notation', () =>
        {
            const tokens = tokenizer.tokenize('1.5E+10+2.5E-5i');
            
            expect(tokens[0].type).toBe(TokenType.Complex);
            expect(tokens[0].value).toBe('1.5E+10+2.5E-5i');
        });

        it('should not create complex from separated addition', () =>
        {
            const tokens = tokenizer.tokenize('3 + 4');
            
            expect(tokens[0].type).toBe(TokenType.Integer);
            expect(tokens[1].type).toBe(TokenType.Plus);
            expect(tokens[2].type).toBe(TokenType.Integer);
        });
    });

    describe('String Literals', () =>
    {
        it('should tokenize basic strings', () =>
        {
            const tokens = tokenizer.tokenize('"Hello" "World"');
            
            expect(tokens[0].type).toBe(TokenType.String);
            expect(tokens[0].value).toBe('Hello');
            expect(tokens[1].type).toBe(TokenType.String);
            expect(tokens[1].value).toBe('World');
        });

        it('should handle empty string', () =>
        {
            const tokens = tokenizer.tokenize('""');
            
            expect(tokens[0].type).toBe(TokenType.String);
            expect(tokens[0].value).toBe('');
        });

        it('should handle escape sequences', () =>
        {
            const tokens = tokenizer.tokenize('"Line1\\nLine2"');
            
            expect(tokens[0].type).toBe(TokenType.String);
            expect(tokens[0].value).toBe('Line1\nLine2');
        });

        it('should handle all standard escapes', () =>
        {
            const tests = [
                ['"Tab\\there"', 'Tab\there'],
                ['"CR\\rhere"', 'CR\rhere'],
                ['"Path\\\\file"', 'Path\\file'],
                ['"Say \\"Hello\\""', 'Say "Hello"']
            ];

            for (const [input, expected] of tests)
            {
                const tokens = tokenizer.tokenize(input);
                expect(tokens[0].value).toBe(expected);
            }
        });

        it('should treat unknown escape as literal', () =>
        {
            const tokens = tokenizer.tokenize('"Unknown\\xescape"');
            
            expect(tokens[0].value).toBe('Unknownxescape');
        });

        it('should throw error on unterminated string', () =>
        {
            expect(() => tokenizer.tokenize('"unterminated')).toThrow('Unterminated string');
        });
    });

    describe('Identifiers', () =>
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

        it('should handle underscores in identifiers', () =>
        {
            const tokens = tokenizer.tokenize('my_var% another_one#');
            
            expect(tokens[0].value).toBe('my_var%');
            expect(tokens[1].value).toBe('another_one#');
        });
    });

    describe('Keywords', () =>
    {
        it('should recognize control flow keywords', () =>
        {
            const keywords = 'IF THEN ELSE ELSEIF END FOR TO STEP NEXT WHILE WEND DO LOOP UNTIL UNLESS IS'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize statement keywords', () =>
        {
            const keywords = 'LET DIM LOCAL PRINT INPUT READ WRITE SELECT CASE GOSUB RETURN EXIT CONTINUE'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize function/procedure keywords', () =>
        {
            const keywords = 'SUB TRY CATCH FINALLY THROW'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize I/O keywords', () =>
        {
            const keywords = 'OPEN CLOSE SEEK EOF LOC EXISTS'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize graphics keywords', () =>
        {
            const keywords = 'CLS COLOR LOCATE PSET LINE CIRCLE RECTANGLE OVAL TRIANGLE PAINT GET PUT'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize mathematical operator keywords', () =>
        {
            const keywords = 'SIN COS TAN ASIN ACOS ATAN SINH COSH TANH ASINH ACOSH ATANH'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize more math keywords', () =>
        {
            const keywords = 'EXP LOG LOG10 LOG2 SQRT CBRT FLOOR CEIL ROUND TRUNC ABS SGN EXPAND'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize logical operator keywords', () =>
        {
            const keywords = 'AND OR NOT XOR NAND NOR XNOR IMP MOD'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize complex number keywords', () =>
        {
            const keywords = 'REAL IMAG CONJ CABS CARG CSQRT'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize type conversion keywords', () =>
        {
            const keywords = 'INT STR VAL HEX BIN'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize string manipulation keywords', () =>
        {
            const keywords = 'ASC CHR UCASE LCASE LTRIM RTRIM TRIM REVERSE LEFT RIGHT MID INSTR'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize array/string operation keywords', () =>
        {
            const keywords = 'JOIN REPLACE FIND INDEXOF INCLUDES STARTSWITH ENDSWITH'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize constant keywords', () =>
        {
            const keywords = 'RND PI E TRUE FALSE INKEY DATE TIME NOW'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize unit conversion keywords', () =>
        {
            const keywords = 'DEG RAD'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should recognize utility keywords', () =>
        {
            const keywords = 'SLEEP RANDOMIZE NOTES TURTLE ARC'.split(' ');
            const tokens = tokenizer.tokenize(keywords.join(' '));
            
            keywords.forEach((keyword, i) =>
            {
                expect(tokens[i].type).toBe(TokenType.Keyword);
                expect(tokens[i].value).toBe(keyword);
            });
        });

        it('should be case-insensitive', () =>
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

        it('should handle adjacent operators', () =>
        {
            const tokens = tokenizer.tokenize('x%+-y%');
            
            expect(tokens[0].value).toBe('x%');
            expect(tokens[1].type).toBe(TokenType.Plus);
            expect(tokens[2].type).toBe(TokenType.Minus);
            expect(tokens[3].value).toBe('y%');
        });
    });

    describe('Punctuation', () =>
    {
        it('should tokenize all bracket types', () =>
        {
            const tokens = tokenizer.tokenize('( ) [ ] { }');
            
            expect(tokens[0].type).toBe(TokenType.LeftParen);
            expect(tokens[1].type).toBe(TokenType.RightParen);
            expect(tokens[2].type).toBe(TokenType.LeftBracket);
            expect(tokens[3].type).toBe(TokenType.RightBracket);
            expect(tokens[4].type).toBe(TokenType.LeftBrace);
            expect(tokens[5].type).toBe(TokenType.RightBrace);
        });

        it('should tokenize delimiters', () =>
        {
            const tokens = tokenizer.tokenize(', : ;');
            
            expect(tokens[0].type).toBe(TokenType.Comma);
            expect(tokens[1].type).toBe(TokenType.Colon);
            expect(tokens[2].type).toBe(TokenType.Semicolon);
        });

        it('should tokenize special operators', () =>
        {
            const tokens = tokenizer.tokenize('| !');
            
            expect(tokens[0].type).toBe(TokenType.Pipe);
            expect(tokens[1].type).toBe(TokenType.Exclamation);
        });
    });

    describe('Whitespace and Comments', () =>
    {
        it('should handle multiple spaces', () =>
        {
            const tokens = tokenizer.tokenize('x%     +     y%');
            
            expect(tokens.length).toBe(4);
            expect(tokens[0].value).toBe('x%');
            expect(tokens[1].type).toBe(TokenType.Plus);
            expect(tokens[2].value).toBe('y%');
        });

        it('should handle tabs', () =>
        {
            const tokens = tokenizer.tokenize('x%\t+\ty%');
            
            expect(tokens.length).toBe(4);
            expect(tokens[0].value).toBe('x%');
        });

        it('should handle mixed whitespace', () =>
        {
            const tokens = tokenizer.tokenize('  \t  x%  \t  +  \t  y%  \t  ');
            
            expect(tokens.length).toBe(4);
        });

        it('should skip single-line comments', () =>
        {
            const tokens = tokenizer.tokenize("LET x% = 5 ' this is a comment");
            
            expect(tokens.length).toBe(5);
            expect(tokens[0].value).toBe('LET');
            expect(tokens[1].value).toBe('x%');
            expect(tokens[2].type).toBe(TokenType.Equal);
            expect(tokens[3].value).toBe('5');
        });

        it('should skip comments at start of line', () =>
        {
            const tokens = tokenizer.tokenize("' comment line\nLET x% = 5");
            
            expect(tokens[0].value).toBe('LET');
            expect(tokens[0].line).toBe(2);
        });

        it('should skip multiple comment lines', () =>
        {
            const tokens = tokenizer.tokenize("' comment 1\n' comment 2\nLET x% = 5");
            
            expect(tokens[0].value).toBe('LET');
            expect(tokens[0].line).toBe(3);
        });

        it('should handle comment at end of file', () =>
        {
            const tokens = tokenizer.tokenize("LET x% = 5 ' final comment");
            
            expect(tokens.length).toBe(5);
            expect(tokens[4].type).toBe(TokenType.EOF);
        });

        it('should handle newlines and track line numbers', () =>
        {
            const tokens = tokenizer.tokenize('x%\n+\ny%');
            
            expect(tokens[0].line).toBe(1);
            expect(tokens[1].line).toBe(2);
            expect(tokens[2].line).toBe(3);
        });

        it('should track column numbers', () =>
        {
            const tokens = tokenizer.tokenize('a b c');
            
            expect(tokens[0].column).toBe(1);
            expect(tokens[1].column).toBe(3);
            expect(tokens[2].column).toBe(5);
        });
    });

    describe('Complex Expressions', () =>
    {
        it('should tokenize arithmetic expression', () =>
        {
            const tokens = tokenizer.tokenize('x% + y% * 2');
            
            expect(tokens[0].value).toBe('x%');
            expect(tokens[1].type).toBe(TokenType.Plus);
            expect(tokens[2].value).toBe('y%');
            expect(tokens[3].type).toBe(TokenType.Star);
            expect(tokens[4].value).toBe('2');
        });

        it('should tokenize parenthesized expression', () =>
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

        it('should tokenize array literal', () =>
        {
            const tokens = tokenizer.tokenize('[1, 2, 3]');
            
            expect(tokens[0].type).toBe(TokenType.LeftBracket);
            expect(tokens[1].value).toBe('1');
            expect(tokens[2].type).toBe(TokenType.Comma);
            expect(tokens[3].value).toBe('2');
            expect(tokens[4].type).toBe(TokenType.Comma);
            expect(tokens[5].value).toBe('3');
            expect(tokens[6].type).toBe(TokenType.RightBracket);
        });

        it('should tokenize structure literal', () =>
        {
            const tokens = tokenizer.tokenize('{ x%: 10, y%: 20 }');
            
            expect(tokens[0].type).toBe(TokenType.LeftBrace);
            expect(tokens[1].value).toBe('x%');
            expect(tokens[2].type).toBe(TokenType.Colon);
            expect(tokens[3].value).toBe('10');
            expect(tokens[4].type).toBe(TokenType.Comma);
        });

        it('should tokenize operator call', () =>
        {
            const tokens = tokenizer.tokenize('SIN(PI# / 4)');
            
            expect(tokens[0].value).toBe('SIN');
            expect(tokens[1].type).toBe(TokenType.LeftParen);
            expect(tokens[2].value).toBe('PI#');
            expect(tokens[3].type).toBe(TokenType.Slash);
            expect(tokens[4].value).toBe('4');
            expect(tokens[5].type).toBe(TokenType.RightParen);
        });

        it('should tokenize complete statement', () =>
        {
            const tokens = tokenizer.tokenize('LET result# = SQRT(x# * x# + y# * y#)');
            
            expect(tokens[0].value).toBe('LET');
            expect(tokens[1].value).toBe('result#');
            expect(tokens[2].type).toBe(TokenType.Equal);
            expect(tokens[3].value).toBe('SQRT');
        });
    });

    describe('Edge Cases and Errors', () =>
    {
        it('should handle empty string', () =>
        {
            const tokens = tokenizer.tokenize('');
            
            expect(tokens.length).toBe(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        it('should handle only whitespace', () =>
        {
            const tokens = tokenizer.tokenize('   \t\n\r\n   ');
            
            expect(tokens.length).toBe(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        it('should handle only comments', () =>
        {
            const tokens = tokenizer.tokenize("' just a comment");
            
            expect(tokens.length).toBe(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        it('should throw error on unexpected character', () =>
        {
            expect(() => tokenizer.tokenize('@')).toThrow('Unexpected character');
        });
    });
});
