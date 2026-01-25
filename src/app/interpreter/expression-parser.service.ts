import { Injectable } from '@angular/core';
import { Token, TokenType, Tokenizer } from './tokenizer.service';
import { Expression } from '../../lang/expressions/expression';
import { LiteralExpression } from '../../lang/expressions/literal-expression';
import { BinaryExpression, BinaryOperator, BinaryOperatorCategory } from '../../lang/expressions/binary-expression';
import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '../../lang/expressions/unary-expression';
import { FunctionCallExpression, FunctionName } from '../../lang/expressions/function-call-expression';
import { VariableExpression } from '../../lang/expressions/special/variable-expression';
import { ParenthesizedExpression } from '../../lang/expressions/special/parenthesized-expression';
import { EduBasicType } from '../../lang/edu-basic-value';
import { Constant, ConstantEvaluator } from '../../lang/expressions/helpers/constant-evaluator';

@Injectable({
    providedIn: 'root'
})
export class ExpressionParserService
{
    private tokens: Token[] = [];
    private current: number = 0;
    private tokenizer: Tokenizer = new Tokenizer();
    private constantEvaluator: ConstantEvaluator = new ConstantEvaluator();

    public parseExpression(source: string): Expression
    {
        this.tokens = this.tokenizer.tokenize(source);
        this.current = 0;
        return this.expression();
    }

    private expression(): Expression
    {
        return this.imp();
    }

    private imp(): Expression
    {
        let expr = this.xorXnor();

        while (this.matchKeyword('IMP'))
        {
            const right = this.xorXnor();
            expr = new BinaryExpression(expr, BinaryOperator.Imp, right, BinaryOperatorCategory.Logical);
        }

        return expr;
    }

    private xorXnor(): Expression
    {
        let expr = this.orNor();

        while (this.matchKeyword('XOR') || this.matchKeyword('XNOR'))
        {
            const operator = this.previous().value === 'XOR' ? BinaryOperator.Xor : BinaryOperator.Xnor;
            const right = this.orNor();
            expr = new BinaryExpression(expr, operator, right, BinaryOperatorCategory.Logical);
        }

        return expr;
    }

    private orNor(): Expression
    {
        let expr = this.andNand();

        while (this.matchKeyword('OR') || this.matchKeyword('NOR'))
        {
            const operator = this.previous().value === 'OR' ? BinaryOperator.Or : BinaryOperator.Nor;
            const right = this.andNand();
            expr = new BinaryExpression(expr, operator, right, BinaryOperatorCategory.Logical);
        }

        return expr;
    }

    private andNand(): Expression
    {
        let expr = this.not();

        while (this.matchKeyword('AND') || this.matchKeyword('NAND'))
        {
            const operator = this.previous().value === 'AND' ? BinaryOperator.And : BinaryOperator.Nand;
            const right = this.not();
            expr = new BinaryExpression(expr, operator, right, BinaryOperatorCategory.Logical);
        }

        return expr;
    }

    private not(): Expression
    {
        if (this.matchKeyword('NOT'))
        {
            const operand = this.not();
            return new UnaryExpression(UnaryOperator.Not, operand, UnaryOperatorCategory.Prefix);
        }

        return this.comparison();
    }

    private comparison(): Expression
    {
        let expr = this.addSub();

        while (this.match(TokenType.Equal, TokenType.NotEqual, TokenType.Less, 
                         TokenType.Greater, TokenType.LessEqual, TokenType.GreaterEqual))
        {
            const operatorToken = this.previous().value;
            let operator: BinaryOperator;

            switch (operatorToken)
            {
                case '=':
                    operator = BinaryOperator.Equal;
                    break;
                case '<>':
                    operator = BinaryOperator.NotEqual;
                    break;
                case '<':
                    operator = BinaryOperator.LessThan;
                    break;
                case '>':
                    operator = BinaryOperator.GreaterThan;
                    break;
                case '<=':
                    operator = BinaryOperator.LessThanOrEqual;
                    break;
                case '>=':
                    operator = BinaryOperator.GreaterThanOrEqual;
                    break;
                default:
                    throw new Error(`Unknown comparison operator: ${operatorToken}`);
            }

            const right = this.addSub();
            expr = new BinaryExpression(expr, operator, right, BinaryOperatorCategory.Comparison);
        }

        return expr;
    }

    private addSub(): Expression
    {
        let expr = this.mulDiv();

        while (this.match(TokenType.Plus, TokenType.Minus))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '+' ? BinaryOperator.Add : BinaryOperator.Subtract;
            const right = this.mulDiv();
            expr = new BinaryExpression(expr, operator, right, BinaryOperatorCategory.Arithmetic);
        }

        return expr;
    }

    private mulDiv(): Expression
    {
        let expr = this.unaryPlusMinus();

        while (this.match(TokenType.Star, TokenType.Slash) || this.matchKeyword('MOD'))
        {
            const operatorToken = this.previous().value;
            let operator: BinaryOperator;

            switch (operatorToken)
            {
                case '*':
                    operator = BinaryOperator.Multiply;
                    break;
                case '/':
                    operator = BinaryOperator.Divide;
                    break;
                case 'MOD':
                    operator = BinaryOperator.Modulo;
                    break;
                default:
                    throw new Error(`Unknown operator: ${operatorToken}`);
            }

            const right = this.unaryPlusMinus();
            expr = new BinaryExpression(expr, operator, right, BinaryOperatorCategory.Arithmetic);
        }

        return expr;
    }

    private unaryPlusMinus(): Expression
    {
        if (this.match(TokenType.Plus, TokenType.Minus))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '+' ? UnaryOperator.Plus : UnaryOperator.Minus;
            const operand = this.unaryPlusMinus();
            return new UnaryExpression(operator, operand, UnaryOperatorCategory.Prefix);
        }

        return this.exponentiation();
    }

    private exponentiation(): Expression
    {
        let expr = this.primary();

        if (this.match(TokenType.Caret, TokenType.StarStar))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '^' ? BinaryOperator.Power : BinaryOperator.PowerAlt;
            const right = this.exponentiation();
            expr = new BinaryExpression(expr, operator, right, BinaryOperatorCategory.Arithmetic);
        }

        return expr;
    }

    private primary(): Expression
    {
        if (this.match(TokenType.Integer))
        {
            const value = parseInt(this.previous().value);
            return new LiteralExpression({ type: EduBasicType.Integer, value });
        }

        if (this.match(TokenType.Real))
        {
            const value = parseFloat(this.previous().value);
            return new LiteralExpression({ type: EduBasicType.Real, value });
        }

        if (this.match(TokenType.Complex))
        {
            const text = this.previous().value;
            const complexValue = this.parseComplexLiteral(text);
            return new LiteralExpression({ type: EduBasicType.Complex, value: complexValue });
        }

        if (this.match(TokenType.String))
        {
            const value = this.previous().value;
            return new LiteralExpression({ type: EduBasicType.String, value });
        }

        // Check for constants
        if (this.check(TokenType.Identifier))
        {
            const constantName = this.peek().value;
            const constant = this.parseConstant(constantName);
            if (constant !== null)
            {
                this.advance();
                const constantValue = this.constantEvaluator.evaluate(constant);
                return new LiteralExpression(constantValue);
            }
        }

        // Check for function calls
        if (this.check(TokenType.Identifier))
        {
            const functionName = this.peek().value;
            const parsedFunction = this.parseFunctionCall(functionName);
            if (parsedFunction !== null)
            {
                return parsedFunction;
            }
        }

        // Check for unary function operators (SIN, COS, ABS, etc.)
        if (this.check(TokenType.Keyword))
        {
            const keyword = this.peek().value;
            const unaryOp = this.parseUnaryFunction(keyword);
            if (unaryOp !== null)
            {
                this.advance();
                this.consume(TokenType.LeftParen, `Expected '(' after ${keyword}`);
                const argument = this.expression();
                this.consume(TokenType.RightParen, `Expected ')' after ${keyword} argument`);
                return new UnaryExpression(unaryOp.operator, argument, unaryOp.category);
            }
        }

        if (this.match(TokenType.Identifier))
        {
            const name = this.previous().value;
            return new VariableExpression(name);
        }

        if (this.match(TokenType.LeftParen))
        {
            const expr = this.expression();
            this.consume(TokenType.RightParen, "Expected ')' after expression");
            return new ParenthesizedExpression(expr);
        }

        throw new Error(`Unexpected token: ${this.peek().value} at line ${this.peek().line}`);
    }

    private parseConstant(name: string): Constant | null
    {
        switch (name)
        {
            case 'PI#':
            case 'PI':
                return Constant.Pi;
            case 'E#':
            case 'E':
                return Constant.E;
            case 'TRUE%':
            case 'TRUE':
                return Constant.True;
            case 'FALSE%':
            case 'FALSE':
                return Constant.False;
            case 'RND#':
            case 'RND':
                return Constant.Rnd;
            case 'INKEY$':
            case 'INKEY':
                return Constant.Inkey;
            case 'DATE$':
            case 'DATE':
                return Constant.Date;
            case 'TIME$':
            case 'TIME':
                return Constant.Time;
            case 'NOW%':
            case 'NOW':
                return Constant.Now;
            default:
                return null;
        }
    }

    private parseFunctionCall(name: string): FunctionCallExpression | null
    {
        // Check if it's a function call (identifier followed by '(')
        if (!this.check(TokenType.Identifier) || this.peek().value !== name)
        {
            return null;
        }

        const nextIndex = this.current + 1;
        if (nextIndex >= this.tokens.length || this.tokens[nextIndex].type !== TokenType.LeftParen)
        {
            return null;
        }

        // Parse function name
        let functionName: FunctionName | null = null;

        switch (name.toUpperCase())
        {
            // String functions (2 args)
            case 'LEFT':
            case 'LEFT$':
                functionName = FunctionName.Left;
                break;
            case 'RIGHT':
            case 'RIGHT$':
                functionName = FunctionName.Right;
                break;
            case 'INSTR':
                functionName = FunctionName.Instr;
                break;
            case 'REPLACE':
                functionName = FunctionName.Replace;
                break;
            case 'STARTSWITH':
                functionName = FunctionName.Startswith;
                break;
            case 'ENDSWITH':
                functionName = FunctionName.Endswith;
                break;
            
            // String functions (3 args)
            case 'MID':
            case 'MID$':
                functionName = FunctionName.Mid;
                break;
            
            // Array functions (2 args)
            case 'FIND':
                functionName = FunctionName.Find;
                break;
            case 'INDEXOF':
                functionName = FunctionName.IndexOf;
                break;
            case 'INCLUDES':
                functionName = FunctionName.Includes;
                break;
            case 'JOIN':
                functionName = FunctionName.Join;
                break;
            
            // Array functions (1 arg)
            case 'SIZE':
                functionName = FunctionName.Size;
                break;
            case 'EMPTY':
                functionName = FunctionName.Empty;
                break;
            case 'LEN':
                functionName = FunctionName.Len;
                break;
        }

        if (functionName === null)
        {
            return null;
        }

        // Parse arguments
        this.advance(); // consume function name
        this.consume(TokenType.LeftParen, `Expected '(' after ${name}`);
        
        const args: Expression[] = [];
        if (!this.check(TokenType.RightParen))
        {
            do
            {
                args.push(this.expression());
            }
            while (this.match(TokenType.Comma));
        }
        
        this.consume(TokenType.RightParen, `Expected ')' after ${name} arguments`);
        
        return new FunctionCallExpression(functionName, args);
    }

    private parseUnaryFunction(keyword: string): { operator: UnaryOperator; category: UnaryOperatorCategory } | null
    {
        switch (keyword.toUpperCase())
        {
            // Mathematical
            case 'SIN':
                return { operator: UnaryOperator.Sin, category: UnaryOperatorCategory.Mathematical };
            case 'COS':
                return { operator: UnaryOperator.Cos, category: UnaryOperatorCategory.Mathematical };
            case 'TAN':
                return { operator: UnaryOperator.Tan, category: UnaryOperatorCategory.Mathematical };
            case 'ASIN':
                return { operator: UnaryOperator.Asin, category: UnaryOperatorCategory.Mathematical };
            case 'ACOS':
                return { operator: UnaryOperator.Acos, category: UnaryOperatorCategory.Mathematical };
            case 'ATAN':
                return { operator: UnaryOperator.Atan, category: UnaryOperatorCategory.Mathematical };
            case 'SINH':
                return { operator: UnaryOperator.Sinh, category: UnaryOperatorCategory.Mathematical };
            case 'COSH':
                return { operator: UnaryOperator.Cosh, category: UnaryOperatorCategory.Mathematical };
            case 'TANH':
                return { operator: UnaryOperator.Tanh, category: UnaryOperatorCategory.Mathematical };
            case 'ASINH':
                return { operator: UnaryOperator.Asinh, category: UnaryOperatorCategory.Mathematical };
            case 'ACOSH':
                return { operator: UnaryOperator.Acosh, category: UnaryOperatorCategory.Mathematical };
            case 'ATANH':
                return { operator: UnaryOperator.Atanh, category: UnaryOperatorCategory.Mathematical };
            case 'EXP':
                return { operator: UnaryOperator.Exp, category: UnaryOperatorCategory.Mathematical };
            case 'LOG':
                return { operator: UnaryOperator.Log, category: UnaryOperatorCategory.Mathematical };
            case 'LOG10':
                return { operator: UnaryOperator.Log10, category: UnaryOperatorCategory.Mathematical };
            case 'LOG2':
                return { operator: UnaryOperator.Log2, category: UnaryOperatorCategory.Mathematical };
            case 'SQRT':
                return { operator: UnaryOperator.Sqrt, category: UnaryOperatorCategory.Mathematical };
            case 'CBRT':
                return { operator: UnaryOperator.Cbrt, category: UnaryOperatorCategory.Mathematical };
            case 'ROUND':
                return { operator: UnaryOperator.Round, category: UnaryOperatorCategory.Mathematical };
            case 'FLOOR':
                return { operator: UnaryOperator.Floor, category: UnaryOperatorCategory.Mathematical };
            case 'CEIL':
                return { operator: UnaryOperator.Ceil, category: UnaryOperatorCategory.Mathematical };
            case 'TRUNC':
                return { operator: UnaryOperator.Trunc, category: UnaryOperatorCategory.Mathematical };
            case 'EXPAND':
                return { operator: UnaryOperator.Expand, category: UnaryOperatorCategory.Mathematical };
            case 'SGN':
                return { operator: UnaryOperator.Sgn, category: UnaryOperatorCategory.Mathematical };
            case 'ABS':
                return { operator: UnaryOperator.Abs, category: UnaryOperatorCategory.Mathematical };
            
            // Complex
            case 'REAL':
                return { operator: UnaryOperator.Real, category: UnaryOperatorCategory.Complex };
            case 'IMAG':
                return { operator: UnaryOperator.Imag, category: UnaryOperatorCategory.Complex };
            case 'REALPART':
                return { operator: UnaryOperator.Realpart, category: UnaryOperatorCategory.Complex };
            case 'IMAGPART':
                return { operator: UnaryOperator.Imagpart, category: UnaryOperatorCategory.Complex };
            case 'CONJ':
                return { operator: UnaryOperator.Conj, category: UnaryOperatorCategory.Complex };
            case 'CABS':
                return { operator: UnaryOperator.Cabs, category: UnaryOperatorCategory.Complex };
            case 'CARG':
                return { operator: UnaryOperator.Carg, category: UnaryOperatorCategory.Complex };
            case 'CSQRT':
                return { operator: UnaryOperator.Csqrt, category: UnaryOperatorCategory.Complex };
            
            // String manipulation
            case 'ASC':
                return { operator: UnaryOperator.Asc, category: UnaryOperatorCategory.StringManipulation };
            case 'CHR':
            case 'CHR$':
                return { operator: UnaryOperator.Chr, category: UnaryOperatorCategory.StringManipulation };
            case 'UCASE':
            case 'UPPER':
            case 'UPPER$':
                return { operator: UnaryOperator.Ucase, category: UnaryOperatorCategory.StringManipulation };
            case 'LCASE':
            case 'LOWER':
            case 'LOWER$':
                return { operator: UnaryOperator.Lcase, category: UnaryOperatorCategory.StringManipulation };
            case 'LTRIM':
            case 'LTRIM$':
                return { operator: UnaryOperator.Ltrim, category: UnaryOperatorCategory.StringManipulation };
            case 'RTRIM':
            case 'RTRIM$':
                return { operator: UnaryOperator.Rtrim, category: UnaryOperatorCategory.StringManipulation };
            case 'TRIM':
            case 'TRIM$':
                return { operator: UnaryOperator.Trim, category: UnaryOperatorCategory.StringManipulation };
            case 'REVERSE':
            case 'REVERSE$':
                return { operator: UnaryOperator.Reverse, category: UnaryOperatorCategory.StringManipulation };
            
            // Type conversion
            case 'INT':
            case 'CINT':
                return { operator: UnaryOperator.Int, category: UnaryOperatorCategory.TypeConversion };
            case 'STR':
            case 'CSTR':
            case 'STR$':
                return { operator: UnaryOperator.Str, category: UnaryOperatorCategory.TypeConversion };
            case 'VAL':
                return { operator: UnaryOperator.Val, category: UnaryOperatorCategory.TypeConversion };
            case 'HEX':
            case 'HEX$':
                return { operator: UnaryOperator.Hex, category: UnaryOperatorCategory.TypeConversion };
            case 'BIN':
            case 'BIN$':
                return { operator: UnaryOperator.Bin, category: UnaryOperatorCategory.TypeConversion };
            
            default:
                return null;
        }
    }

    private parseComplexLiteral(text: string): { real: number; imaginary: number }
    {
        const imagOnly = /^([+-]?[\d.]+(?:[eE][+-]?\d+)?)[iI]$/;
        const fullComplex = /^([+-]?[\d.]+(?:[eE][+-]?\d+)?)([+-][\d.]+(?:[eE][+-]?\d+)?)[iI]$/;

        let match = text.match(imagOnly);
        
        if (match)
        {
            return { real: 0, imaginary: parseFloat(match[1]) };
        }

        match = text.match(fullComplex);
        
        if (match)
        {
            return { real: parseFloat(match[1]), imaginary: parseFloat(match[2]) };
        }

        throw new Error(`Invalid complex literal: ${text}`);
    }

    private match(...types: TokenType[]): boolean
    {
        for (const type of types)
        {
            if (this.check(type))
            {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private matchKeyword(keyword: string): boolean
    {
        if (this.check(TokenType.Keyword) && this.peek().value === keyword)
        {
            this.advance();
            return true;
        }

        return false;
    }

    private check(type: TokenType): boolean
    {
        if (this.isAtEnd())
        {
            return false;
        }

        return this.peek().type === type;
    }

    private advance(): Token
    {
        if (!this.isAtEnd())
        {
            this.current++;
        }

        return this.previous();
    }

    private isAtEnd(): boolean
    {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token
    {
        return this.tokens[this.current];
    }

    private previous(): Token
    {
        return this.tokens[this.current - 1];
    }

    private consume(type: TokenType, message: string): Token
    {
        if (this.check(type))
        {
            return this.advance();
        }

        throw new Error(message);
    }
}
