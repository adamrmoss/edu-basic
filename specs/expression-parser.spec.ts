import { ExpressionParserService } from '../src/app/interpreter/expression-parser.service';
import { ExecutionContext } from '../src/lang/execution-context';
import { EduBasicType } from '../src/lang/edu-basic-value';

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
                const expr = parser.parseExpression('42');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(42);
            });

            it('should parse zero', () =>
            {
                const expr = parser.parseExpression('0');
                expect(expr).not.toBeNull();
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(0);
            });

            it('should parse negative integers', () =>
            {
                const expr = parser.parseExpression('-123');
                expect(expr).not.toBeNull();
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-123);
            });

            it('should parse hexadecimal literals', () =>
            {
                const expr = parser.parseExpression('&HFF');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(255);
            });

            it('should parse binary literals', () =>
            {
                const expr = parser.parseExpression('&B1010');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(10);
            });
        });

        describe('Real Literals', () =>
        {
            it('should parse basic real numbers', () =>
            {
                const expr = parser.parseExpression('3.14');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(3.14);
            });

            it('should parse real with leading dot', () =>
            {
                const expr = parser.parseExpression('.5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(0.5);
            });

            it('should parse real with trailing dot', () =>
            {
                const expr = parser.parseExpression('10.');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(10.0);
            });

            it('should parse scientific notation', () =>
            {
                const expr = parser.parseExpression('1.5E+10');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(1.5e10);
            });

            it('should parse negative exponent', () =>
            {
                const expr = parser.parseExpression('3.2E-4');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(0.00032);
            });
        });

        describe('Complex Literals', () =>
        {
            it('should parse pure imaginary', () =>
            {
                const expr = parser.parseExpression('4i');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Complex);
                expect((result.value as any).real).toBe(0);
                expect((result.value as any).imaginary).toBe(4);
            });

            it('should parse complex with addition', () =>
            {
                const expr = parser.parseExpression('3+4i');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Complex);
                expect((result.value as any).real).toBe(3);
                expect((result.value as any).imaginary).toBe(4);
            });

            it('should parse complex with subtraction', () =>
            {
                const expr = parser.parseExpression('10.5-2.5i');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Complex);
                expect((result.value as any).real).toBeCloseTo(10.5);
                expect((result.value as any).imaginary).toBeCloseTo(-2.5);
            });

            it('should parse complex with scientific notation', () =>
            {
                const expr = parser.parseExpression('1.5E+10+2.5E-5i');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Complex);
                expect((result.value as any).real).toBeCloseTo(1.5e10);
                expect((result.value as any).imaginary).toBeCloseTo(2.5e-5);
            });
        });

        describe('String Literals', () =>
        {
            it('should parse basic strings', () =>
            {
                const expr = parser.parseExpression('"Hello"');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.String);
                expect(result.value).toBe('Hello');
            });

            it('should parse empty strings', () =>
            {
                const expr = parser.parseExpression('""');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.String);
                expect(result.value).toBe('');
            });

            it('should parse strings with escape sequences', () =>
            {
                const expr = parser.parseExpression('"Line1\\nLine2"');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
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
                const expr = parser.parseExpression('5 + 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(8);
            });

            it('should parse real addition', () =>
            {
                const expr = parser.parseExpression('5.5 + 3.2');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(8.7);
            });

            it('should parse chained addition', () =>
            {
                const expr = parser.parseExpression('1 + 2 + 3 + 4');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(10);
            });
        });

        describe('Subtraction', () =>
        {
            it('should parse integer subtraction', () =>
            {
                const expr = parser.parseExpression('10 - 4');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(6);
            });

            it('should parse chained subtraction', () =>
            {
                const expr = parser.parseExpression('20 - 5 - 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(12);
            });

            it('should handle negative results', () =>
            {
                const expr = parser.parseExpression('5 - 10');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-5);
            });
        });

        describe('Multiplication', () =>
        {
            it('should parse integer multiplication', () =>
            {
                const expr = parser.parseExpression('6 * 7');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(42);
            });

            it('should parse real multiplication', () =>
            {
                const expr = parser.parseExpression('2.5 * 4');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(10.0);
            });

            it('should parse chained multiplication', () =>
            {
                const expr = parser.parseExpression('2 * 3 * 4');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(24);
            });
        });

        describe('Division', () =>
        {
            it('should parse division', () =>
            {
                const expr = parser.parseExpression('15 / 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(5);
            });

            it('should handle non-integer results', () =>
            {
                const expr = parser.parseExpression('7 / 2');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(3.5);
            });

            it('should parse chained division', () =>
            {
                const expr = parser.parseExpression('100 / 5 / 2');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBeCloseTo(10);
            });
        });

        describe('Modulo', () =>
        {
            it('should parse modulo operation', () =>
            {
                const expr = parser.parseExpression('10 MOD 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(1);
            });

            it('should handle negative modulo', () =>
            {
                const expr = parser.parseExpression('-10 MOD 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should handle zero remainder', () =>
            {
                const expr = parser.parseExpression('12 MOD 4');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Exponentiation', () =>
        {
            it('should parse caret exponentiation', () =>
            {
                const expr = parser.parseExpression('2 ^ 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(8);
            });

            it('should parse double-star exponentiation', () =>
            {
                const expr = parser.parseExpression('2 ** 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(8);
            });

            it('should handle fractional exponents', () =>
            {
                const expr = parser.parseExpression('16 ^ 0.5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBeCloseTo(4);
            });

            it('should handle negative exponents with parentheses', () =>
            {
                const expr = parser.parseExpression('2 ^ (-2)');
                const result = expr!.evaluate(context);
                
                expect(result.value).toBeCloseTo(0.25);
            });

            it('should be right-associative', () =>
            {
                const expr = parser.parseExpression('2 ^ 2 ^ 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBeCloseTo(256);
            });
        });
    });

    describe('Unary Operators', () =>
    {
        it('should parse unary plus', () =>
        {
            const expr = parser.parseExpression('+42');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(42);
        });

        it('should parse unary minus', () =>
        {
            const expr = parser.parseExpression('-42');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(-42);
        });

        it('should parse double negation', () =>
        {
            const expr = parser.parseExpression('--42');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(42);
        });

        it('should parse unary with parentheses', () =>
        {
            const expr = parser.parseExpression('-(3 + 4)');
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(-7);
        });

        it('should parse unary with complex expression', () =>
        {
            const expr = parser.parseExpression('-2 * 3');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(-6);
        });
    });

    describe('Comparison Operations', () =>
    {
        describe('Equality', () =>
        {
            it('should parse equality for true case', () =>
            {
                const expr = parser.parseExpression('5 = 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should parse equality for false case', () =>
            {
                const expr = parser.parseExpression('5 = 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(0);
            });

            it('should parse string equality', () =>
            {
                const expr = parser.parseExpression('"Hello" = "Hello"');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });
        });

        describe('Inequality', () =>
        {
            it('should parse inequality for true case', () =>
            {
                const expr = parser.parseExpression('5 <> 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should parse inequality for false case', () =>
            {
                const expr = parser.parseExpression('5 <> 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Less Than', () =>
        {
            it('should parse less than for true case', () =>
            {
                const expr = parser.parseExpression('3 < 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should parse less than for false case', () =>
            {
                const expr = parser.parseExpression('5 < 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should parse less than for equal case', () =>
            {
                const expr = parser.parseExpression('5 < 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Greater Than', () =>
        {
            it('should parse greater than for true case', () =>
            {
                const expr = parser.parseExpression('5 > 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse greater than for false case', () =>
            {
                const expr = parser.parseExpression('3 > 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Less Than or Equal', () =>
        {
            it('should parse <= for less case', () =>
            {
                const expr = parser.parseExpression('3 <= 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse <= for equal case', () =>
            {
                const expr = parser.parseExpression('5 <= 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse <= for greater case', () =>
            {
                const expr = parser.parseExpression('7 <= 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Greater Than or Equal', () =>
        {
            it('should parse >= for greater case', () =>
            {
                const expr = parser.parseExpression('5 >= 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse >= for equal case', () =>
            {
                const expr = parser.parseExpression('5 >= 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse >= for less case', () =>
            {
                const expr = parser.parseExpression('3 >= 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
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
                const expr = parser.parseExpression('1 AND 1');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(1);
            });

            it('should parse AND with one false', () =>
            {
                const expr = parser.parseExpression('1 AND 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should parse AND with bitwise operation', () =>
            {
                const expr = parser.parseExpression('15 AND 7');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(7);
            });
        });

        describe('OR', () =>
        {
            it('should parse OR with one true', () =>
            {
                const expr = parser.parseExpression('0 OR 1');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(1);
            });

            it('should parse OR with both false', () =>
            {
                const expr = parser.parseExpression('0 OR 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should parse OR with bitwise operation', () =>
            {
                const expr = parser.parseExpression('8 OR 4');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(12);
            });
        });

        describe('NOT', () =>
        {
            it('should parse NOT of zero', () =>
            {
                const expr = parser.parseExpression('NOT 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(-1);
            });

            it('should parse NOT of non-zero', () =>
            {
                const expr = parser.parseExpression('NOT 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-6);
            });

            it('should parse double NOT', () =>
            {
                const expr = parser.parseExpression('NOT NOT 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(5);
            });
        });

        describe('XOR', () =>
        {
            it('should parse XOR with different values', () =>
            {
                const expr = parser.parseExpression('1 XOR 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(1);
            });

            it('should parse XOR with same values', () =>
            {
                const expr = parser.parseExpression('1 XOR 1');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should parse XOR with bitwise operation', () =>
            {
                const expr = parser.parseExpression('12 XOR 10');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(6);
            });
        });

        describe('NAND', () =>
        {
            it('should parse NAND with both true', () =>
            {
                const expr = parser.parseExpression('1 NAND 1');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-2);
            });

            it('should parse NAND with one false', () =>
            {
                const expr = parser.parseExpression('1 NAND 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });
        });

        describe('NOR', () =>
        {
            it('should parse NOR with both false', () =>
            {
                const expr = parser.parseExpression('0 NOR 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse NOR with one true', () =>
            {
                const expr = parser.parseExpression('1 NOR 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-2);
            });
        });

        describe('XNOR', () =>
        {
            it('should parse XNOR with same values', () =>
            {
                const expr = parser.parseExpression('1 XNOR 1');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse XNOR with different values', () =>
            {
                const expr = parser.parseExpression('1 XNOR 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-2);
            });
        });

        describe('IMP (Implication)', () =>
        {
            it('should parse IMP with true implies true', () =>
            {
                const expr = parser.parseExpression('1 IMP 1');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse IMP with true implies false', () =>
            {
                const expr = parser.parseExpression('1 IMP 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-2);
            });

            it('should parse IMP with false implies anything', () =>
            {
                const expr = parser.parseExpression('0 IMP 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
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
                const expr = parser.parseExpression('2 + 3 * 4');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(14);
            });

            it('should respect division over subtraction', () =>
            {
                const expr = parser.parseExpression('10 - 8 / 2');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBeCloseTo(6);
            });

            it('should respect exponentiation over multiplication', () =>
            {
                const expr = parser.parseExpression('2 * 3 ^ 2');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBeCloseTo(18);
            });

            it('should respect MOD at same level as multiplication', () =>
            {
                const expr = parser.parseExpression('10 + 7 MOD 3');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(11);
            });
        });

        describe('Comparison Precedence', () =>
        {
            it('should respect arithmetic over comparison', () =>
            {
                const expr = parser.parseExpression('2 + 3 = 5');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });

            it('should parse multiple comparisons', () =>
            {
                const expr = parser.parseExpression('1 < 2 AND 3 < 4');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(-1);
            });
        });

        describe('Logical Precedence', () =>
        {
            it('should respect AND over OR', () =>
            {
                const expr = parser.parseExpression('0 OR 1 AND 1');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(1);
            });

            it('should respect NOT over AND', () =>
            {
                const expr = parser.parseExpression('NOT 0 AND 0');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });

            it('should respect XOR precedence', () =>
            {
                const expr = parser.parseExpression('1 OR 1 XOR 1');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(0);
            });
        });

        describe('Parentheses', () =>
        {
            it('should handle parentheses overriding precedence', () =>
            {
                const expr = parser.parseExpression('(2 + 3) * 4');
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(20);
            });

            it('should handle nested parentheses', () =>
            {
                const expr = parser.parseExpression('((2 + 3) * 4) - 5');
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(15);
            });

            it('should handle multiple parenthesized groups', () =>
            {
                const expr = parser.parseExpression('(2 + 3) * (4 + 5)');
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(45);
            });

            it('should handle deeply nested parentheses', () =>
            {
                const expr = parser.parseExpression('(((2)))');
                const result = expr!.evaluate(context);
                
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
                const expr = parser.parseExpression('x%');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Integer);
                expect(result.value).toBe(42);
            });

            it('should parse real variable', () =>
            {
                context.setVariable('pi#', { type: EduBasicType.Real, value: 3.14159 });
                const expr = parser.parseExpression('pi#');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.Real);
                expect(result.value).toBeCloseTo(3.14159);
            });

            it('should parse string variable', () =>
            {
                context.setVariable('name$', { type: EduBasicType.String, value: 'Alice' });
                const expr = parser.parseExpression('name$');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.type).toBe(EduBasicType.String);
                expect(result.value).toBe('Alice');
            });

            it('should parse complex variable', () =>
            {
                context.setVariable('z&', { type: EduBasicType.Complex, value: { real: 3, imaginary: 4 } });
                const expr = parser.parseExpression('z&');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
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
                const expr = parser.parseExpression('x% + y%');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(15);
            });

            it('should parse variables in complex expression', () =>
            {
                context.setVariable('a%', { type: EduBasicType.Integer, value: 5 });
                context.setVariable('b%', { type: EduBasicType.Integer, value: 3 });
                const expr = parser.parseExpression('(a% + b%) * 2');
                const result = expr!.evaluate(context);
                
                expect(result.value).toBe(16);
            });

            it('should parse mixed literals and variables', () =>
            {
                context.setVariable('radius#', { type: EduBasicType.Real, value: 5 });
                const expr = parser.parseExpression('2 * 3.14159 * radius#');
                expect(expr).not.toBeNull();
                const result = expr!.evaluate(context);
                
                expect(result.value).toBeCloseTo(31.4159);
            });
        });
    });

    describe('Constants (Nullary Expressions)', () =>
    {
        it('should parse PI# in uppercase', () =>
        {
            const expr = parser.parseExpression('PI#');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.PI);
        });

        it('should parse pi# in lowercase (case-insensitive)', () =>
        {
            const expr = parser.parseExpression('pi#');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.PI);
        });

        it('should parse Pi# in mixed case (case-insensitive)', () =>
        {
            const expr = parser.parseExpression('Pi#');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.PI);
        });

        it('should parse E# in lowercase (case-insensitive)', () =>
        {
            const expr = parser.parseExpression('e#');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.E);
        });

        it('should parse RND# in lowercase (case-insensitive)', () =>
        {
            const expr = parser.parseExpression('rnd#');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBeGreaterThanOrEqual(0);
            expect(result.value).toBeLessThan(1);
        });

        it('should parse DATE$ in lowercase (case-insensitive)', () =>
        {
            const expr = parser.parseExpression('date$');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('should parse TRUE% in lowercase (case-insensitive)', () =>
        {
            const expr = parser.parseExpression('true%');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should parse FALSE% in lowercase (case-insensitive)', () =>
        {
            const expr = parser.parseExpression('false%');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });

    describe('Complex Expressions', () =>
    {
        it('should parse complex arithmetic expression', () =>
        {
            const expr = parser.parseExpression('2 + 3 * 4 - 5 / 2');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBeCloseTo(11.5);
        });

        it('should parse expression with all arithmetic operators', () =>
        {
            const expr = parser.parseExpression('10 + 5 * 2 - 8 / 4 ^ 2');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBeCloseTo(19.5);
        });

        it('should parse logical expression with arithmetic', () =>
        {
            const expr = parser.parseExpression('(5 > 3) AND (2 < 4)');
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(-1);
        });

        it('should parse complex nested expression', () =>
        {
            const expr = parser.parseExpression('((2 + 3) * (4 - 1)) / (5 + 2)');
            const result = expr!.evaluate(context);
            
            expect(result.value).toBeCloseTo(15 / 7);
        });

        it('should parse expression with mixed operations', () =>
        {
            context.setVariable('x%', { type: EduBasicType.Integer, value: 10 });
            context.setVariable('y%', { type: EduBasicType.Integer, value: 3 });
            const expr = parser.parseExpression('x% MOD y% + 2 * y%');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(7);
        });

        it('should parse string comparison in logical context', () =>
        {
            const expr = parser.parseExpression('("A" < "B") AND ("X" > "W")');
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(-1);
        });
    });

    describe('Edge Cases', () =>
    {
        it('should parse single value expression', () =>
        {
            const expr = parser.parseExpression('42');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(42);
        });

        it('should handle multiple unary operators', () =>
        {
            const expr = parser.parseExpression('---5');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(-5);
        });

        it('should handle zero in various contexts', () =>
        {
            const expr = parser.parseExpression('0 + 0 * 0');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(0);
        });

        it('should handle large integer values', () =>
        {
            const expr = parser.parseExpression('1000000 + 2000000');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBe(3000000);
        });

        it('should handle very small real values', () =>
        {
            const expr = parser.parseExpression('0.0001 + 0.0002');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.value).toBeCloseTo(0.0003);
        });
    });

    describe('Error Handling', () =>
    {
        it('should throw on empty expression', () =>
        {
            expect(() => parser.parseExpression('')).toThrow();
        });

        it('should throw on unmatched left parenthesis', () =>
        {
            expect(() => parser.parseExpression('(2 + 3')).toThrow();
        });

        it('should parse expression with trailing parenthesis', () =>
        {
            const expr = parser.parseExpression('2 + 3)');
            expect(expr).toBeNull();
        });

        it('should throw on missing operand', () =>
        {
            expect(() => parser.parseExpression('2 +')).toThrow();
        });

        it('should throw on invalid operator sequence', () =>
        {
            expect(() => parser.parseExpression('2 * * 3')).toThrow();
        });

        it('should return default value for undefined variable', () =>
        {
            const expr = parser.parseExpression('undefined_var%');
                expect(expr).not.toBeNull();
            const result = expr!.evaluate(context);
            
            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });
});

