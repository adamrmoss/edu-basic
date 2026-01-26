import { Injectable } from '@angular/core';
import { Token, TokenType, Tokenizer } from './tokenizer.service';
import { Expression } from '../../lang/expressions/expression';
import { LiteralExpression } from '../../lang/expressions/literal-expression';
import { BinaryExpression, BinaryOperator, BinaryOperatorCategory } from '../../lang/expressions/binary-expression';
import { UnaryExpression, UnaryOperator, UnaryOperatorCategory } from '../../lang/expressions/unary-expression';
import { FunctionCallExpression, FunctionName } from '../../lang/expressions/function-call-expression';
import { VariableExpression } from '../../lang/expressions/special/variable-expression';
import { ParenthesizedExpression } from '../../lang/expressions/special/parenthesized-expression';
import { NullaryExpression } from '../../lang/expressions/nullary-expression';
import { EduBasicType } from '../../lang/edu-basic-value';
import { Constant } from '../../lang/expressions/helpers/constant-evaluator';
import { ParseResult, success, failure } from './parser/parse-result';

@Injectable({
    providedIn: 'root'
})
export class ExpressionParserService
{
    private tokens: Token[] = [];
    private current: number = 0;
    private tokenizer: Tokenizer = new Tokenizer();

    public parseExpression(source: string): ParseResult<Expression>
    {
        this.tokens = this.tokenizer.tokenize(source);
        this.current = 0;
        const exprResult = this.expression();
        
        if (!exprResult.success)
        {
            return exprResult;
        }
        
        if (!this.isAtEnd())
        {
            const unexpectedToken = this.peek();
            return failure(`Unexpected token: ${unexpectedToken.value} at line ${unexpectedToken.line}`);
        }
        
        return success(exprResult.value);
    }

    private expression(): ParseResult<Expression>
    {
        return this.imp();
    }

    private imp(): ParseResult<Expression>
    {
        const exprResult = this.xorXnor();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.matchKeyword('IMP'))
        {
            const rightResult = this.xorXnor();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, BinaryOperator.Imp, rightResult.value, BinaryOperatorCategory.Logical);
        }

        return success(expr);
    }

    private xorXnor(): ParseResult<Expression>
    {
        const exprResult = this.orNor();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.matchKeyword('XOR') || this.matchKeyword('XNOR'))
        {
            const operator = this.previous().value === 'XOR' ? BinaryOperator.Xor : BinaryOperator.Xnor;
            const rightResult = this.orNor();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Logical);
        }

        return success(expr);
    }

    private orNor(): ParseResult<Expression>
    {
        const exprResult = this.andNand();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.matchKeyword('OR') || this.matchKeyword('NOR'))
        {
            const operator = this.previous().value === 'OR' ? BinaryOperator.Or : BinaryOperator.Nor;
            const rightResult = this.andNand();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Logical);
        }

        return success(expr);
    }

    private andNand(): ParseResult<Expression>
    {
        const exprResult = this.not();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.matchKeyword('AND') || this.matchKeyword('NAND'))
        {
            const operator = this.previous().value === 'AND' ? BinaryOperator.And : BinaryOperator.Nand;
            const rightResult = this.not();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Logical);
        }

        return success(expr);
    }

    private not(): ParseResult<Expression>
    {
        if (this.matchKeyword('NOT'))
        {
            const operandResult = this.not();
            if (!operandResult.success)
            {
                return operandResult;
            }
            return success(new UnaryExpression(UnaryOperator.Not, operandResult.value, UnaryOperatorCategory.Prefix));
        }

        return this.comparison();
    }

    private comparison(): ParseResult<Expression>
    {
        const exprResult = this.addSub();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

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
                    return failure(`Unknown comparison operator: ${operatorToken}`);
            }

            const rightResult = this.addSub();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Comparison);
        }

        return success(expr);
    }

    private addSub(): ParseResult<Expression>
    {
        const exprResult = this.mulDiv();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        while (this.match(TokenType.Plus, TokenType.Minus))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '+' ? BinaryOperator.Add : BinaryOperator.Subtract;
            const rightResult = this.mulDiv();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Arithmetic);
        }

        return success(expr);
    }

    private mulDiv(): ParseResult<Expression>
    {
        const exprResult = this.unaryPlusMinus();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

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
                    return failure(`Unknown operator: ${operatorToken}`);
            }

            const rightResult = this.unaryPlusMinus();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Arithmetic);
        }

        return success(expr);
    }

    private unaryPlusMinus(): ParseResult<Expression>
    {
        if (this.match(TokenType.Plus, TokenType.Minus))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '+' ? UnaryOperator.Plus : UnaryOperator.Minus;
            const operandResult = this.unaryPlusMinus();
            if (!operandResult.success)
            {
                return operandResult;
            }
            return success(new UnaryExpression(operator, operandResult.value, UnaryOperatorCategory.Prefix));
        }

        return this.exponentiation();
    }

    private exponentiation(): ParseResult<Expression>
    {
        const exprResult = this.primary();
        
        if (!exprResult.success)
        {
            return exprResult;
        }

        let expr = exprResult.value;

        if (this.match(TokenType.Caret, TokenType.StarStar))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '^' ? BinaryOperator.Power : BinaryOperator.PowerAlt;
            const rightResult = this.exponentiation();
            if (!rightResult.success)
            {
                return rightResult;
            }
            expr = new BinaryExpression(expr, operator, rightResult.value, BinaryOperatorCategory.Arithmetic);
        }

        return success(expr);
    }

    private primary(): ParseResult<Expression>
    {
        if (this.match(TokenType.Integer))
        {
            const value = parseInt(this.previous().value);
            return success(new LiteralExpression({ type: EduBasicType.Integer, value }));
        }

        if (this.match(TokenType.Real))
        {
            const value = parseFloat(this.previous().value);
            return success(new LiteralExpression({ type: EduBasicType.Real, value }));
        }

        if (this.match(TokenType.Complex))
        {
            const text = this.previous().value;
            const complexValue = this.parseComplexLiteral(text);
            if (complexValue === null)
            {
                return failure(`Invalid complex literal: ${text}`);
            }
            return success(new LiteralExpression({ type: EduBasicType.Complex, value: complexValue }));
        }

        if (this.match(TokenType.String))
        {
            const value = this.previous().value;
            return success(new LiteralExpression({ type: EduBasicType.String, value }));
        }

        // Check for constants
        if (this.check(TokenType.Identifier))
        {
            const constantName = this.peek().value;
            const constant = this.parseConstant(constantName);
            if (constant !== null)
            {
                this.advance();
                return success(new NullaryExpression(constant));
            }
        }

        // Check for function calls
        if (this.check(TokenType.Identifier))
        {
            const functionName = this.peek().value;
            const parsedFunction = this.parseFunctionCall(functionName);
            if (parsedFunction !== null)
            {
                return success(parsedFunction);
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
                // Parentheses are optional for unary functions
                if (this.match(TokenType.LeftParen))
                {
                    const argumentResult = this.expression();
                    if (!argumentResult.success)
                    {
                        return argumentResult;
                    }
                    const rightParenResult = this.consume(TokenType.RightParen, `Expected ')' after ${keyword} argument`);
                    if (!rightParenResult.success)
                    {
                        return rightParenResult;
                    }
                    return success(new UnaryExpression(unaryOp.operator, argumentResult.value, unaryOp.category));
                }
                else
                {
                    // No parentheses - parse the next expression as the argument
                    const argumentResult = this.unaryPlusMinus();
                    if (!argumentResult.success)
                    {
                        return argumentResult;
                    }
                    return success(new UnaryExpression(unaryOp.operator, argumentResult.value, unaryOp.category));
                }
            }
        }

        if (this.match(TokenType.Identifier))
        {
            const name = this.previous().value;
            return success(new VariableExpression(name));
        }

        if (this.match(TokenType.LeftParen))
        {
            const exprResult = this.expression();
            if (!exprResult.success)
            {
                return exprResult;
            }
            const rightParenResult = this.consume(TokenType.RightParen, "Expected ')' after expression");
            if (!rightParenResult.success)
            {
                return rightParenResult;
            }
            return success(new ParenthesizedExpression(exprResult.value));
        }

        const token = this.peek();
        return failure(`Unexpected token: ${token.value} at line ${token.line}`);
    }

    private parseConstant(name: string): Constant | null
    {
        const upperName = name.toUpperCase();
        switch (upperName)
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
                const argResult = this.expression();
                if (!argResult.success)
                {
                    return failure(argResult.error || 'Failed to parse function argument expression');
                }
                args.push(argResult.value);
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

    private parseComplexLiteral(text: string): { real: number; imaginary: number } | null
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

        return null;
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

    private consume(type: TokenType, message: string): ParseResult<Token>
    {
        if (this.check(type))
        {
            return success(this.advance());
        }

        const actualToken = this.isAtEnd() 
            ? 'end of input' 
            : this.peek().value;
        return failure(`Expected ${message}, got: ${actualToken}`);
    }
}
