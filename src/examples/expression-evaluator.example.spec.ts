/**
 * Example: Testing an Expression Evaluator for EduBASIC
 * Demonstrates testing arithmetic operations and operator precedence
 */

describe('Expression Evaluator (Example)', () => {

    class ExpressionEvaluator {
        private pos: number = 0;
        private expression: string = '';

        evaluate(expr: string): number {
            this.expression = expr.replace(/\s+/g, '');
            this.pos = 0;
            return this.parseExpression();
        }

        private parseExpression(): number {
            let result = this.parseTerm();

            while (this.pos < this.expression.length)
            {
                const op = this.expression[ this.pos ];

                if (op === '+')
                {
                    this.pos++;
                    result += this.parseTerm();
                } else if (op === '-')
                {
                    this.pos++;
                    result -= this.parseTerm();
                } else
                {
                    break;
                }
            }

            return result;
        }

        private parseTerm(): number {
            let result = this.parseFactor();

            while (this.pos < this.expression.length)
            {
                const op = this.expression[ this.pos ];

                if (op === '*')
                {
                    this.pos++;
                    result *= this.parseFactor();
                } else if (op === '/')
                {
                    this.pos++;
                    result /= this.parseFactor();
                } else
                {
                    break;
                }
            }

            return result;
        }

        private parseFactor(): number {
            if (this.expression[ this.pos ] === '(')
            {
                this.pos++;
                const result = this.parseExpression();
                this.pos++;
                return result;
            }

            let numStr = '';

            while (this.pos < this.expression.length && /[\d.]/.test(this.expression[ this.pos ]))
            {
                numStr += this.expression[ this.pos ];
                this.pos++;
            }

            return parseFloat(numStr);
        }
    }

    let evaluator: ExpressionEvaluator;

    beforeEach(() => {
        evaluator = new ExpressionEvaluator();
    });

    describe('Basic Arithmetic Operations', () => {

        it('should add two numbers', () => {
            expect(evaluator.evaluate('2 + 3')).toBe(5);
        });

        it('should subtract two numbers', () => {
            expect(evaluator.evaluate('10 - 3')).toBe(7);
        });

        it('should multiply two numbers', () => {
            expect(evaluator.evaluate('4 * 5')).toBe(20);
        });

        it('should divide two numbers', () => {
            expect(evaluator.evaluate('20 / 4')).toBe(5);
        });

        it('should handle decimal numbers', () => {
            expect(evaluator.evaluate('3.5 + 2.5')).toBe(6);
        });

        it('should handle negative results', () => {
            expect(evaluator.evaluate('5 - 10')).toBe(-5);
        });
    });

    describe('Operator Precedence', () => {

        it('should multiply before adding', () => {
            expect(evaluator.evaluate('2 + 3 * 4')).toBe(14);
        });

        it('should multiply before subtracting', () => {
            expect(evaluator.evaluate('10 - 2 * 3')).toBe(4);
        });

        it('should divide before adding', () => {
            expect(evaluator.evaluate('10 + 20 / 4')).toBe(15);
        });

        it('should handle multiple operations', () => {
            expect(evaluator.evaluate('2 + 3 * 4 - 5')).toBe(9);
        });

        it('should evaluate left to right for same precedence', () => {
            expect(evaluator.evaluate('10 - 5 - 2')).toBe(3);
        });
    });

    describe('Parentheses', () => {

        it('should respect parentheses', () => {
            expect(evaluator.evaluate('(2 + 3) * 4')).toBe(20);
        });

        it('should handle nested parentheses', () => {
            expect(evaluator.evaluate('((2 + 3) * 4)')).toBe(20);
        });

        it('should handle complex nested expressions', () => {
            expect(evaluator.evaluate('(2 + (3 * 4)) - 5')).toBe(9);
        });

        it('should handle multiple groups', () => {
            expect(evaluator.evaluate('(2 + 3) * (4 + 1)')).toBe(25);
        });
    });

    describe('Complex Expressions', () => {

        it('should evaluate long expressions', () => {
            expect(evaluator.evaluate('1 + 2 + 3 + 4 + 5')).toBe(15);
        });

        it('should handle mixed operations', () => {
            expect(evaluator.evaluate('2 * 3 + 4 * 5')).toBe(26);
        });

        it('should handle division with multiplication', () => {
            expect(evaluator.evaluate('20 / 4 * 2')).toBe(10);
        });

        it('should handle expression with all operations', () => {
            expect(evaluator.evaluate('(10 + 5) * 2 - 8 / 4')).toBe(28);
        });
    });

    describe('Edge Cases', () => {

        it('should handle single number', () => {
            expect(evaluator.evaluate('42')).toBe(42);
        });

        it('should handle expressions without spaces', () => {
            expect(evaluator.evaluate('2+3*4')).toBe(14);
        });

        it('should handle expressions with extra spaces', () => {
            expect(evaluator.evaluate('  2  +  3  *  4  ')).toBe(14);
        });

        it('should handle decimal results', () => {
            expect(evaluator.evaluate('7 / 2')).toBe(3.5);
        });
    });

});

