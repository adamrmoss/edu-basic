import { ExpressionParserService } from '@/app/interpreter/expression-parser.service';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType } from '@/lang/edu-basic-value';

describe('ExpressionParser', () =>
{
    let parser: ExpressionParserService;
    let context: ExecutionContext;

    beforeEach(() =>
    {
        parser = new ExpressionParserService();
        context = new ExecutionContext();
    });

    describe('Literal Parsing', () =>
    {
        describe('Integer Literals', () =>
        {
            it('should parse decimal integers', () =>
            {
                const exprResult = parser.parseExpression('42');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(42);
            });

            it('should parse zero', () =>
            {
                const exprResult = parser.parseExpression('0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(0);
            });

            it('should parse negative integers', () =>
            {
                const exprResult = parser.parseExpression('-123');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-123);
            });

            it('should parse hexadecimal literals', () =>
            {
                const exprResult = parser.parseExpression('&HFF');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(255);
            });

            it('should parse binary literals', () =>
            {
                const exprResult = parser.parseExpression('&B1010');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(10);
            });
        });

        describe('Real Literals', () =>
        {
            it('should parse basic real numbers', () =>
            {
                const exprResult = parser.parseExpression('3.14');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(3.14);
            });

            it('should parse real with leading dot', () =>
            {
                const exprResult = parser.parseExpression('.5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(0.5);
            });

            it('should parse real with trailing dot', () =>
            {
                const exprResult = parser.parseExpression('10.');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(10.0);
            });

            it('should parse scientific notation', () =>
            {
                const exprResult = parser.parseExpression('1.5E+10');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(1.5e10);
            });

            it('should parse negative exponent', () =>
            {
                const exprResult = parser.parseExpression('3.2E-4');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(0.00032);
            });
        });

        describe('Complex Literals', () =>
        {
            it('should parse pure imaginary', () =>
            {
                const exprResult = parser.parseExpression('4i');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Complex);
                expect((result.value as any).real).toBe(0);
                expect((result.value as any).imaginary).toBe(4);
            });

            it('should parse complex with addition', () =>
            {
                const exprResult = parser.parseExpression('3+4i');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Complex);
                expect((result.value as any).real).toBe(3);
                expect((result.value as any).imaginary).toBe(4);
            });

            it('should parse complex with subtraction', () =>
            {
                const exprResult = parser.parseExpression('10.5-2.5i');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Complex);
                expect((result.value as any).real).toBeCloseTo(10.5);
                expect((result.value as any).imaginary).toBeCloseTo(-2.5);
            });

            it('should parse complex with scientific notation', () =>
            {
                const exprResult = parser.parseExpression('1.5E+10+2.5E-5i');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Complex);
                expect((result.value as any).real).toBeCloseTo(1.5e10);
                expect((result.value as any).imaginary).toBeCloseTo(2.5e-5);
            });
        });

        describe('String Literals', () =>
        {
            it('should parse basic strings', () =>
            {
                const exprResult = parser.parseExpression('"Hello"');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.String);
                expect(result.value).toBe('Hello');
            });

            it('should parse empty strings', () =>
            {
                const exprResult = parser.parseExpression('""');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.String);
                expect(result.value).toBe('');
            });

            it('should parse strings with escape sequences', () =>
            {
                const exprResult = parser.parseExpression('"Line1\\nLine2"');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.String);
                expect(result.value).toBe('Line1\nLine2');
            });
        });
    });

    describe('Arithmetic Operations', () =>
    {
        describe('Addition', () =>
        {
            it('should parse integer addition', () =>
            {
                const exprResult = parser.parseExpression('5 + 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(8);
            });

            it('should parse real addition', () =>
            {
                const exprResult = parser.parseExpression('5.5 + 3.2');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(8.7);
            });

            it('should parse chained addition', () =>
            {
                const exprResult = parser.parseExpression('1 + 2 + 3 + 4');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(10);
            });
        });

        describe('Subtraction', () =>
        {
            it('should parse integer subtraction', () =>
            {
                const exprResult = parser.parseExpression('10 - 4');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(6);
            });

            it('should parse chained subtraction', () =>
            {
                const exprResult = parser.parseExpression('20 - 5 - 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(12);
            });

            it('should handle negative results', () =>
            {
                const exprResult = parser.parseExpression('5 - 10');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-5);
            });
        });

        describe('Multiplication', () =>
        {
            it('should parse integer multiplication', () =>
            {
                const exprResult = parser.parseExpression('6 * 7');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(42);
            });

            it('should parse real multiplication', () =>
            {
                const exprResult = parser.parseExpression('2.5 * 4');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(10.0);
            });

            it('should parse chained multiplication', () =>
            {
                const exprResult = parser.parseExpression('2 * 3 * 4');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(24);
            });
        });

        describe('Division', () =>
        {
            it('should parse division', () =>
            {
                const exprResult = parser.parseExpression('15 / 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(5);
            });

            it('should handle non-integer results', () =>
            {
                const exprResult = parser.parseExpression('7 / 2');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(3.5);
            });

            it('should parse chained division', () =>
            {
                const exprResult = parser.parseExpression('100 / 5 / 2');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBeCloseTo(10);
            });
        });

        describe('Modulo', () =>
        {
            it('should parse modulo operation', () =>
            {
                const exprResult = parser.parseExpression('10 MOD 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(1);
            });

            it('should handle negative modulo', () =>
            {
                const exprResult = parser.parseExpression('-10 MOD 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should handle zero remainder', () =>
            {
                const exprResult = parser.parseExpression('12 MOD 4');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Exponentiation', () =>
        {
            it('should parse caret exponentiation', () =>
            {
                const exprResult = parser.parseExpression('2 ^ 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(8);
            });

            it('should parse double-star exponentiation', () =>
            {
                const exprResult = parser.parseExpression('2 ** 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(8);
            });

            it('should handle fractional exponents', () =>
            {
                const exprResult = parser.parseExpression('16 ^ 0.5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBeCloseTo(4);
            });

            it('should handle negative exponents with parentheses', () =>
            {
                const exprResult = parser.parseExpression('2 ^ (-2)');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBeCloseTo(0.25);
            });

            it('should be right-associative', () =>
            {
                const exprResult = parser.parseExpression('2 ^ 2 ^ 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBeCloseTo(256);
            });
        });
    });

    describe('Unary Operators', () =>
    {
        it('should parse unary plus', () =>
        {
            const exprResult = parser.parseExpression('+42');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(42);
        });

        it('should parse unary minus', () =>
        {
            const exprResult = parser.parseExpression('-42');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(-42);
        });

        it('should parse double negation', () =>
        {
            const exprResult = parser.parseExpression('--42');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(42);
        });

        it('should parse unary with parentheses', () =>
        {
            const exprResult = parser.parseExpression('-(3 + 4)');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(-7);
        });

        it('should parse unary with complex expression', () =>
        {
            const exprResult = parser.parseExpression('-2 * 3');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(-6);
        });
    });

    describe('Comparison Operations', () =>
    {
        describe('Equality', () =>
        {
            it('should parse equality for true case', () =>
            {
                const exprResult = parser.parseExpression('5 = 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should parse equality for false case', () =>
            {
                const exprResult = parser.parseExpression('5 = 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(0);
            });

            it('should parse string equality', () =>
            {
                const exprResult = parser.parseExpression('"Hello" = "Hello"');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });
        });

        describe('Inequality', () =>
        {
            it('should parse inequality for true case', () =>
            {
                const exprResult = parser.parseExpression('5 <> 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should parse inequality for false case', () =>
            {
                const exprResult = parser.parseExpression('5 <> 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Less Than', () =>
        {
            it('should parse less than for true case', () =>
            {
                const exprResult = parser.parseExpression('3 < 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should parse less than for false case', () =>
            {
                const exprResult = parser.parseExpression('5 < 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should parse less than for equal case', () =>
            {
                const exprResult = parser.parseExpression('5 < 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Greater Than', () =>
        {
            it('should parse greater than for true case', () =>
            {
                const exprResult = parser.parseExpression('5 > 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse greater than for false case', () =>
            {
                const exprResult = parser.parseExpression('3 > 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Less Than or Equal', () =>
        {
            it('should parse <= for less case', () =>
            {
                const exprResult = parser.parseExpression('3 <= 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse <= for equal case', () =>
            {
                const exprResult = parser.parseExpression('5 <= 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse <= for greater case', () =>
            {
                const exprResult = parser.parseExpression('7 <= 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Greater Than or Equal', () =>
        {
            it('should parse >= for greater case', () =>
            {
                const exprResult = parser.parseExpression('5 >= 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse >= for equal case', () =>
            {
                const exprResult = parser.parseExpression('5 >= 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse >= for less case', () =>
            {
                const exprResult = parser.parseExpression('3 >= 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });
    });

    describe('Logical Operations', () =>
    {
        describe('AND', () =>
        {
            it('should parse AND with both true', () =>
            {
                const exprResult = parser.parseExpression('1 AND 1');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(1);
            });

            it('should parse AND with one false', () =>
            {
                const exprResult = parser.parseExpression('1 AND 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should parse AND with bitwise operation', () =>
            {
                const exprResult = parser.parseExpression('15 AND 7');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(7);
            });
        });

        describe('OR', () =>
        {
            it('should parse OR with one true', () =>
            {
                const exprResult = parser.parseExpression('0 OR 1');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(1);
            });

            it('should parse OR with both false', () =>
            {
                const exprResult = parser.parseExpression('0 OR 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should parse OR with bitwise operation', () =>
            {
                const exprResult = parser.parseExpression('8 OR 4');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(12);
            });
        });

        describe('NOT', () =>
        {
            it('should parse NOT of zero', () =>
            {
                const exprResult = parser.parseExpression('NOT 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should parse NOT of non-zero', () =>
            {
                const exprResult = parser.parseExpression('NOT 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-6);
            });

            it('should parse double NOT', () =>
            {
                const exprResult = parser.parseExpression('NOT NOT 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(5);
            });
        });

        describe('XOR', () =>
        {
            it('should parse XOR with different values', () =>
            {
                const exprResult = parser.parseExpression('1 XOR 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(1);
            });

            it('should parse XOR with same values', () =>
            {
                const exprResult = parser.parseExpression('1 XOR 1');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should parse XOR with bitwise operation', () =>
            {
                const exprResult = parser.parseExpression('12 XOR 10');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(6);
            });
        });

        describe('NAND', () =>
        {
            it('should parse NAND with both true', () =>
            {
                const exprResult = parser.parseExpression('1 NAND 1');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-2);
            });

            it('should parse NAND with one false', () =>
            {
                const exprResult = parser.parseExpression('1 NAND 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });
        });

        describe('NOR', () =>
        {
            it('should parse NOR with both false', () =>
            {
                const exprResult = parser.parseExpression('0 NOR 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse NOR with one true', () =>
            {
                const exprResult = parser.parseExpression('1 NOR 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-2);
            });
        });

        describe('XNOR', () =>
        {
            it('should parse XNOR with same values', () =>
            {
                const exprResult = parser.parseExpression('1 XNOR 1');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse XNOR with different values', () =>
            {
                const exprResult = parser.parseExpression('1 XNOR 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-2);
            });
        });

        describe('IMP (Implication)', () =>
        {
            it('should parse IMP with true implies true', () =>
            {
                const exprResult = parser.parseExpression('1 IMP 1');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse IMP with true implies false', () =>
            {
                const exprResult = parser.parseExpression('1 IMP 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-2);
            });

            it('should parse IMP with false implies anything', () =>
            {
                const exprResult = parser.parseExpression('0 IMP 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });
        });
    });

    describe('Operator Precedence', () =>
    {
        describe('Arithmetic Precedence', () =>
        {
            it('should respect multiplication over addition', () =>
            {
                const exprResult = parser.parseExpression('2 + 3 * 4');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(14);
            });

            it('should respect division over subtraction', () =>
            {
                const exprResult = parser.parseExpression('10 - 8 / 2');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBeCloseTo(6);
            });

            it('should respect exponentiation over multiplication', () =>
            {
                const exprResult = parser.parseExpression('2 * 3 ^ 2');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBeCloseTo(18);
            });

            it('should respect MOD at same level as multiplication', () =>
            {
                const exprResult = parser.parseExpression('10 + 7 MOD 3');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(11);
            });
        });

        describe('Comparison Precedence', () =>
        {
            it('should respect arithmetic over comparison', () =>
            {
                const exprResult = parser.parseExpression('2 + 3 = 5');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse multiple comparisons', () =>
            {
                const exprResult = parser.parseExpression('1 < 2 AND 3 < 4');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(-1);
            });
        });

        describe('Logical Precedence', () =>
        {
            it('should respect AND over OR', () =>
            {
                const exprResult = parser.parseExpression('0 OR 1 AND 1');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(1);
            });

            it('should respect NOT over AND', () =>
            {
                const exprResult = parser.parseExpression('NOT 0 AND 0');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should respect XOR precedence', () =>
            {
                const exprResult = parser.parseExpression('1 OR 1 XOR 1');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Parentheses', () =>
        {
            it('should handle parentheses overriding precedence', () =>
            {
                const exprResult = parser.parseExpression('(2 + 3) * 4');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(20);
            });

            it('should handle nested parentheses', () =>
            {
                const exprResult = parser.parseExpression('((2 + 3) * 4) - 5');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(15);
            });

            it('should handle multiple parenthesized groups', () =>
            {
                const exprResult = parser.parseExpression('(2 + 3) * (4 + 5)');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(45);
            });

            it('should handle deeply nested parentheses', () =>
            {
                const exprResult = parser.parseExpression('(((2)))');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(2);
            });
        });
    });

    describe('Variable References', () =>
    {
        describe('Basic Variables', () =>
        {
            it('should parse integer variable', () =>
            {
                context.setVariable('x%', { type: EduBasicType.Integer, value: 42 });
                const exprResult = parser.parseExpression('x%');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(42);
            });

            it('should parse real variable', () =>
            {
                context.setVariable('pi#', { type: EduBasicType.Real, value: 3.14159 });
                const exprResult = parser.parseExpression('pi#');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(3.14159);
            });

            it('should parse string variable', () =>
            {
                context.setVariable('name$', { type: EduBasicType.String, value: 'Alice' });
                const exprResult = parser.parseExpression('name$');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.String);
                expect(result.value).toBe('Alice');
            });

            it('should parse complex variable', () =>
            {
                context.setVariable('z&', { type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
                const exprResult = parser.parseExpression('z&');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Complex);
                expect((result.value as any).real).toBe(3);
                expect((result.value as any).imaginary).toBe(4);
            });
        });

        describe('Variables in Expressions', () =>
        {
            it('should parse variables in arithmetic', () =>
            {
                context.setVariable('x%', { type: EduBasicType.Integer, value: 10 });
                context.setVariable('y%', { type: EduBasicType.Integer, value: 5 });
                const exprResult = parser.parseExpression('x% + y%');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(15);
            });

            it('should parse variables in complex expression', () =>
            {
                context.setVariable('a%', { type: EduBasicType.Integer, value: 5 });
                context.setVariable('b%', { type: EduBasicType.Integer, value: 3 });
                const exprResult = parser.parseExpression('(a% + b%) * 2');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBe(16);
            });

            it('should parse mixed literals and variables', () =>
            {
                context.setVariable('radius#', { type: EduBasicType.Real, value: 5 });
                const exprResult = parser.parseExpression('2 * 3.14159 * radius#');
                expect(exprResult.success).toBe(true);
                if (!exprResult.success) return;
            const result = exprResult.value.evaluate(context);
                
                expect(result.value).toBeCloseTo(31.4159);
            });
        });
    });

    describe('Constants (Nullary Expressions)', () =>
    {
        it('should parse PI# in uppercase', () =>
        {
            const exprResult = parser.parseExpression('PI#');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.PI);
        });

        it('should parse pi# in lowercase (case-insensitive)', () =>
        {
            const exprResult = parser.parseExpression('pi#');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.PI);
        });

        it('should parse Pi# in mixed case (case-insensitive)', () =>
        {
            const exprResult = parser.parseExpression('Pi#');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.PI);
        });

        it('should parse E# in lowercase (case-insensitive)', () =>
        {
            const exprResult = parser.parseExpression('e#');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.E);
        });

        it('should parse RND# in lowercase (case-insensitive)', () =>
        {
            const exprResult = parser.parseExpression('rnd#');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeGreaterThanOrEqual(0);
            expect(result.value).toBeLessThan(1);
        });

        it('should parse DATE$ in lowercase (case-insensitive)', () =>
        {
            const exprResult = parser.parseExpression('date$');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('should parse INKEY$, TIME$, and NOW% constants', () =>
        {
            const inkey = parser.parseExpression('INKEY$');
            expect(inkey.success).toBe(true);
            if (!inkey.success)
            {
                return;
            }
            expect(inkey.value.evaluate(context).type).toBe(EduBasicType.String);

            const time = parser.parseExpression('TIME$');
            expect(time.success).toBe(true);
            if (!time.success)
            {
                return;
            }
            expect(time.value.evaluate(context).type).toBe(EduBasicType.String);

            const now = parser.parseExpression('NOW%');
            expect(now.success).toBe(true);
            if (!now.success)
            {
                return;
            }
            expect(now.value.evaluate(context).type).toBe(EduBasicType.Integer);
        });

        it('should parse TRUE% in lowercase (case-insensitive)', () =>
        {
            const exprResult = parser.parseExpression('true%');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should parse FALSE% in lowercase (case-insensitive)', () =>
        {
            const exprResult = parser.parseExpression('false%');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });

    describe('Complex Expressions', () =>
    {
        it('should parse complex arithmetic expression', () =>
        {
            const exprResult = parser.parseExpression('2 + 3 * 4 - 5 / 2');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBeCloseTo(11.5);
        });

        it('should parse expression with all arithmetic operators', () =>
        {
            const exprResult = parser.parseExpression('10 + 5 * 2 - 8 / 4 ^ 2');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBeCloseTo(19.5);
        });

        it('should parse logical expression with arithmetic', () =>
        {
            const exprResult = parser.parseExpression('(5 > 3) AND (2 < 4)');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(-1);
        });

        it('should parse complex nested expression', () =>
        {
            const exprResult = parser.parseExpression('((2 + 3) * (4 - 1)) / (5 + 2)');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBeCloseTo(15 / 7);
        });

        it('should parse expression with mixed operations', () =>
        {
            context.setVariable('x%', { type: EduBasicType.Integer, value: 10 });
            context.setVariable('y%', { type: EduBasicType.Integer, value: 3 });
            const exprResult = parser.parseExpression('x% MOD y% + 2 * y%');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(7);
        });

        it('should parse string comparison in logical context', () =>
        {
            const exprResult = parser.parseExpression('("A" < "B") AND ("X" > "W")');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(-1);
        });
    });

    describe('Edge Cases', () =>
    {
        it('should parse single value expression', () =>
        {
            const exprResult = parser.parseExpression('42');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(42);
        });

        it('should handle multiple unary operators', () =>
        {
            const exprResult = parser.parseExpression('---5');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(-5);
        });

        it('should handle zero in various contexts', () =>
        {
            const exprResult = parser.parseExpression('0 + 0 * 0');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(0);
        });

        it('should handle large integer values', () =>
        {
            const exprResult = parser.parseExpression('1000000 + 2000000');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBe(3000000);
        });

        it('should handle very small real values', () =>
        {
            const exprResult = parser.parseExpression('0.0001 + 0.0002');
                expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.value).toBeCloseTo(0.0003);
        });
    });

    describe('Error Handling', () =>
    {
        it('should return failure on empty expression', () =>
        {
            const exprResult = parser.parseExpression('');
            expect(exprResult.success).toBe(false);
        });

        it('should return failure on unmatched left parenthesis', () =>
        {
            const exprResult = parser.parseExpression('(2 + 3');
            expect(exprResult.success).toBe(false);
        });

        it('should parse expression with trailing parenthesis', () =>
        {
            const exprResult = parser.parseExpression('2 + 3)');
            expect(exprResult.success).toBe(false);
        });

        it('should return failure on missing operand', () =>
        {
            const exprResult = parser.parseExpression('2 +');
            expect(exprResult.success).toBe(false);
        });

        it('should return failure on invalid operator sequence', () =>
        {
            const exprResult = parser.parseExpression('2 * * 3');
            expect(exprResult.success).toBe(false);
        });

        it('should return default value for undefined variable', () =>
        {
            const exprResult = parser.parseExpression('undefined_var%');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }
            const result = exprResult.value.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });

        it('should parse ** exponentiation', () =>
        {
            const exprResult = parser.parseExpression('2 ** 3');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }

            const result = exprResult.value.evaluate(context);
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(8.0);
        });

        it('should parse bracket access with identifier inside brackets', () =>
        {
            context.setVariable('key$', { type: EduBasicType.String, value: 'value' }, false);
            context.setVariable('s', { type: EduBasicType.Structure, value: new Map([['key$', { type: EduBasicType.String, value: 'ok' }]]) }, false);

            const exprResult = parser.parseExpression('s[key$]');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }

            const result = exprResult.value.evaluate(context);
            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('ok');
        });

        it('should parse bracket access with an expression inside brackets', () =>
        {
            context.setVariable('a%[]', {
                type: EduBasicType.Array,
                elementType: EduBasicType.Integer,
                value: [
                    { type: EduBasicType.Integer, value: 10 },
                    { type: EduBasicType.Integer, value: 20 }
                ]
            }, false);

            const exprResult = parser.parseExpression('a%[][1+1]');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }

            const result = exprResult.value.evaluate(context);
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(20);
        });

        it('should parse bracket access where the bracket expression starts with an identifier', () =>
        {
            context.setVariable('a%[]', {
                type: EduBasicType.Array,
                elementType: EduBasicType.Integer,
                value: [
                    { type: EduBasicType.Integer, value: 10 },
                    { type: EduBasicType.Integer, value: 20 }
                ]
            }, false);
            context.setVariable('i%', { type: EduBasicType.Integer, value: 1 }, false);

            const exprResult = parser.parseExpression('a%[][i%+1]');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }

            const result = exprResult.value.evaluate(context);
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(20);
        });

        it('should return failure when extra tokens remain after a valid expression', () =>
        {
            const exprResult = parser.parseExpression('1 2');
            expect(exprResult.success).toBe(false);
        });

        it('should return failure when a unary operator has a missing closing parenthesis', () =>
        {
            const exprResult = parser.parseExpression('SIN(1');
            expect(exprResult.success).toBe(false);
        });

        it('should parse a unary keyword operator with parentheses', () =>
        {
            const exprResult = parser.parseExpression('SIN(0)');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }

            const result = exprResult.value.evaluate(context);
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(0.0);
        });

        it('should parse a unary keyword operator without parentheses', () =>
        {
            const exprResult = parser.parseExpression('SIN 0');
            expect(exprResult.success).toBe(true);
            if (!exprResult.success)
            {
                return;
            }

            const result = exprResult.value.evaluate(context);
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeCloseTo(0.0);
        });

        it('should parse and evaluate additional unary keyword operators', () =>
        {
            const cosResult = parser.parseExpression('COS(0)');
            expect(cosResult.success).toBe(true);
            if (!cosResult.success)
            {
                return;
            }
            const cosValue = cosResult.value.evaluate(context);
            expect(cosValue.type).toBe(EduBasicType.Real);
            expect(cosValue.value).toBeCloseTo(1.0);

            const sqrtResult = parser.parseExpression('SQRT 4');
            expect(sqrtResult.success).toBe(true);
            if (!sqrtResult.success)
            {
                return;
            }
            const sqrtValue = sqrtResult.value.evaluate(context);
            expect(sqrtValue.type).toBe(EduBasicType.Real);
            expect(sqrtValue.value).toBeCloseTo(2.0);

            const absResult = parser.parseExpression('ABS(-5)');
            expect(absResult.success).toBe(true);
            if (!absResult.success)
            {
                return;
            }
            const absValue = absResult.value.evaluate(context);
            expect(absValue.type).toBe(EduBasicType.Real);
            expect(absValue.value).toBe(5);

            const chrResult = parser.parseExpression('CHR(65)');
            expect(chrResult.success).toBe(true);
            if (!chrResult.success)
            {
                return;
            }
            const chrValue = chrResult.value.evaluate(context);
            expect(chrValue.type).toBe(EduBasicType.String);
            expect(chrValue.value).toBe('A');

            const ucaseResult = parser.parseExpression('UCASE("hello")');
            expect(ucaseResult.success).toBe(true);
            if (!ucaseResult.success)
            {
                return;
            }
            const ucaseValue = ucaseResult.value.evaluate(context);
            expect(ucaseValue.type).toBe(EduBasicType.String);
            expect(ucaseValue.value).toBe('HELLO');

            const intResult = parser.parseExpression('INT(3.14)');
            expect(intResult.success).toBe(true);
            if (!intResult.success)
            {
                return;
            }
            const intValue = intResult.value.evaluate(context);
            expect(intValue).toEqual({ type: EduBasicType.Integer, value: 3 });
        });

        it('should parse call expressions like LEFT$ and RIGHT$', () =>
        {
            const leftResult = parser.parseExpression('"abc" LEFT 2');
            expect(leftResult.success).toBe(true);
            if (!leftResult.success)
            {
                return;
            }

            const leftValue = leftResult.value.evaluate(context);
            expect(leftValue).toEqual({ type: EduBasicType.String, value: 'ab' });

            const rightResult = parser.parseExpression('"abc" RIGHT 1');
            expect(rightResult.success).toBe(true);
            if (!rightResult.success)
            {
                return;
            }

            const rightValue = rightResult.value.evaluate(context);
            expect(rightValue).toEqual({ type: EduBasicType.String, value: 'c' });
        });

        it('should parse and evaluate additional operator expressions', () =>
        {
            context.setVariable('a%[]', {
                type: EduBasicType.Array,
                elementType: EduBasicType.Integer,
                value: [
                    { type: EduBasicType.Integer, value: 1 },
                    { type: EduBasicType.Integer, value: 2 }
                ]
            }, false);
            context.setVariable('b%[]', { type: EduBasicType.Array, elementType: EduBasicType.Integer, value: [] }, false);
            context.setVariable('a$[]', {
                type: EduBasicType.Array,
                elementType: EduBasicType.String,
                value: [
                    { type: EduBasicType.String, value: 'x' },
                    { type: EduBasicType.String, value: 'y' }
                ]
            }, false);

            const mid = parser.parseExpression('"Hello" MID 2 TO 4');
            expect(mid.success).toBe(true);
            if (!mid.success)
            {
                return;
            }
            expect(mid.value.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'ell' });

            const instr = parser.parseExpression('"abc" INSTR "b"');
            expect(instr.success).toBe(true);
            if (!instr.success)
            {
                return;
            }
            expect(instr.value.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 2 });

            const replace = parser.parseExpression('"a.a" REPLACE "." WITH "!"');
            expect(replace.success).toBe(true);
            if (!replace.success)
            {
                return;
            }
            expect(replace.value.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'a!a' });

            const starts = parser.parseExpression('"abc" STARTSWITH "a"');
            expect(starts.success).toBe(true);
            if (!starts.success)
            {
                return;
            }
            expect(starts.value.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: -1 });

            const ends = parser.parseExpression('"abc" ENDSWITH "c"');
            expect(ends.success).toBe(true);
            if (!ends.success)
            {
                return;
            }
            expect(ends.value.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: -1 });

            const stringLen = parser.parseExpression('| "abc" |');
            expect(stringLen.success).toBe(true);
            if (!stringLen.success)
            {
                return;
            }
            expect(stringLen.value.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 3 });

            const arrayLen = parser.parseExpression('| a%[] |');
            expect(arrayLen.success).toBe(true);
            if (!arrayLen.success)
            {
                return;
            }
            expect(arrayLen.value.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 2 });

            const join = parser.parseExpression('a$[] JOIN ","');
            expect(join.success).toBe(true);
            if (!join.success)
            {
                return;
            }
            expect(join.value.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'x,y' });

            const find = parser.parseExpression('a%[] FIND 2');
            expect(find.success).toBe(true);
            if (!find.success)
            {
                return;
            }
            expect(find.value.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 2 });

            const indexOf = parser.parseExpression('a%[] INDEXOF 2');
            expect(indexOf.success).toBe(true);
            if (!indexOf.success)
            {
                return;
            }
            expect(indexOf.value.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 2 });

            const includes = parser.parseExpression('a%[] INCLUDES 2');
            expect(includes.success).toBe(true);
            if (!includes.success)
            {
                return;
            }
            expect(includes.value.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: -1 });
        });

        it('should return failure on unterminated bracket access', () =>
        {
            const exprResult = parser.parseExpression('a%[][1');
            expect(exprResult.success).toBe(false);
        });
    });
});

