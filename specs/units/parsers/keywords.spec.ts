import { Keywords } from '@/lang/parsing/keywords';
import { Tokenizer, TokenType } from '@/lang/parsing/tokenizer';
import { statementDispatch } from '@/lang/parsing/statement-dispatch';

describe('Keywords', () =>
{
    it('should keep statementDispatch and Keywords.statementStart in sync', () =>
    {
        const dispatchKeywords = Array.from(statementDispatch.keys()).sort();
        const statementStartKeywords = [...Keywords.statementStart].sort();

        expect(statementStartKeywords).toEqual(dispatchKeywords);

        for (const keyword of dispatchKeywords)
        {
            expect(Keywords.isStatementStartKeyword(keyword)).toBe(true);
        }
    });

    it('should tokenize all Keywords.all entries as TokenType.Keyword', () =>
    {
        const tokenizer = new Tokenizer();
        const allKeywords = Array.from(Keywords.all).sort();
        const source = allKeywords.join(' ');

        const tokens = tokenizer.tokenize(source).filter(t => t.type !== TokenType.EOF);

        expect(tokens.length).toBe(allKeywords.length);

        for (let i = 0; i < allKeywords.length; i++)
        {
            expect(tokens[i].type).toBe(TokenType.Keyword);
            expect(tokens[i].value).toBe(allKeywords[i]);
        }
    });
});

