/**
 * Example test file demonstrating TypeScript unit testing patterns
 * for EduBASIC algorithms and utilities.
 * 
 * This file can be deleted once you start writing actual tests.
 */

describe('Example: Basic TypeScript Unit Testing', () => {

    it('should run a simple test', () => {
        expect(true).toBe(true);
    });

    it('should test arithmetic operations', () => {
        const add = (a: number, b: number): number => a + b;
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
    });

    it('should test string operations', () => {
        const toUpper = (str: string): string => str.toUpperCase();
        expect(toUpper('hello')).toBe('HELLO');
    });

});

describe('Example: Testing a Simple Tokenizer', () => {

    interface Token {
        type: string;
        value: string;
    }

    class SimpleTokenizer {
        tokenize(input: string): Token[] {
            const tokens: Token[] = [];
            const words = input.split(/\s+/);

            for (const word of words)
            {
                if (/^\d+$/.test(word))
                {
                    tokens.push({ type: 'NUMBER', value: word });
                } else if (/^[a-zA-Z]+$/.test(word))
                {
                    tokens.push({ type: 'IDENTIFIER', value: word });
                } else
                {
                    tokens.push({ type: 'UNKNOWN', value: word });
                }
            }

            return tokens;
        }
    }

    let tokenizer: SimpleTokenizer;

    beforeEach(() => {
        tokenizer = new SimpleTokenizer();
    });

    it('should tokenize numbers', () => {
        const result = tokenizer.tokenize('123');
        expect(result.length).toBe(1);
        expect(result[ 0 ].type).toBe('NUMBER');
        expect(result[ 0 ].value).toBe('123');
    });

    it('should tokenize identifiers', () => {
        const result = tokenizer.tokenize('count');
        expect(result.length).toBe(1);
        expect(result[ 0 ].type).toBe('IDENTIFIER');
        expect(result[ 0 ].value).toBe('count');
    });

    it('should tokenize mixed input', () => {
        const result = tokenizer.tokenize('LET x 42');
        expect(result.length).toBe(3);
        expect(result[ 0 ]).toEqual({ type: 'IDENTIFIER', value: 'LET' });
        expect(result[ 1 ]).toEqual({ type: 'IDENTIFIER', value: 'x' });
        expect(result[ 2 ]).toEqual({ type: 'NUMBER', value: '42' });
    });

});

describe('Example: Testing Type Sigils (EduBASIC-specific)', () => {

    type TypeSigil = '%' | '#' | '$' | '&';

    interface VariableType {
        name: string;
        sigil: TypeSigil;
        baseType: 'integer' | 'real' | 'string' | 'complex';
    }

    function parseVariableName(varName: string): VariableType | null {
        const sigil = varName.slice(-1) as TypeSigil;
        const name = varName.slice(0, -1);

        const sigilMap: Record<TypeSigil, 'integer' | 'real' | 'string' | 'complex'> = {
            '%': 'integer',
            '#': 'real',
            '$': 'string',
            '&': 'complex'
        };

        if (sigil in sigilMap && /^[a-zA-Z][a-zA-Z0-9]*$/.test(name))
        {
            return {
                name,
                sigil,
                baseType: sigilMap[ sigil ]
            };
        }

        return null;
    }

    it('should parse integer variable with % sigil', () => {
        const result = parseVariableName('count%');
        expect(result).not.toBeNull();
        expect(result?.baseType).toBe('integer');
        expect(result?.name).toBe('count');
        expect(result?.sigil).toBe('%');
    });

    it('should parse real variable with # sigil', () => {
        const result = parseVariableName('temperature#');
        expect(result).not.toBeNull();
        expect(result?.baseType).toBe('real');
    });

    it('should parse string variable with $ sigil', () => {
        const result = parseVariableName('name$');
        expect(result).not.toBeNull();
        expect(result?.baseType).toBe('string');
    });

    it('should parse complex variable with & sigil', () => {
        const result = parseVariableName('impedance&');
        expect(result).not.toBeNull();
        expect(result?.baseType).toBe('complex');
    });

    it('should reject variable without sigil', () => {
        const result = parseVariableName('invalid');
        expect(result).toBeNull();
    });

    it('should reject variable starting with number', () => {
        const result = parseVariableName('1count%');
        expect(result).toBeNull();
    });

});

