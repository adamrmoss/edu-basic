import { Injectable } from '@angular/core';
import { Token, TokenType, Tokenizer } from './tokenizer.service';
import { Expression } from '../../lang/expressions/expression';
import { LiteralExpression } from '../../lang/expressions/literals/literal-expression';
import { ArithmeticExpression, ArithmeticOperator } from '../../lang/expressions/arithmetic/arithmetic-expression';
import { ComparisonExpression, ComparisonOperator } from '../../lang/expressions/comparison/comparison-expression';
import { LogicalExpression, LogicalOperator } from '../../lang/expressions/logical/logical-expression';
import { UnaryOperatorExpression, UnaryOperator } from '../../lang/expressions/arithmetic/unary-operator-expression';
import { VariableExpression } from '../../lang/expressions/special/variable-expression';
import { ParenthesizedExpression } from '../../lang/expressions/special/parenthesized-expression';
import { EduBasicType } from '../../lang/edu-basic-value';

@Injectable({
    providedIn: 'root'
})
export class ExpressionParserService
{
    private tokens: Token[] = [];
    private current: number = 0;
    private tokenizer: Tokenizer = new Tokenizer();

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
            expr = new LogicalExpression(expr, LogicalOperator.Imp, right);
        }

        return expr;
    }

    private xorXnor(): Expression
    {
        let expr = this.orNor();

        while (this.matchKeyword('XOR') || this.matchKeyword('XNOR'))
        {
            const operator = this.previous().value === 'XOR' ? LogicalOperator.Xor : LogicalOperator.Xnor;
            const right = this.orNor();
            expr = new LogicalExpression(expr, operator, right);
        }

        return expr;
    }

    private orNor(): Expression
    {
        let expr = this.andNand();

        while (this.matchKeyword('OR') || this.matchKeyword('NOR'))
        {
            const operator = this.previous().value === 'OR' ? LogicalOperator.Or : LogicalOperator.Nor;
            const right = this.andNand();
            expr = new LogicalExpression(expr, operator, right);
        }

        return expr;
    }

    private andNand(): Expression
    {
        let expr = this.not();

        while (this.matchKeyword('AND') || this.matchKeyword('NAND'))
        {
            const operator = this.previous().value === 'AND' ? LogicalOperator.And : LogicalOperator.Nand;
            const right = this.not();
            expr = new LogicalExpression(expr, operator, right);
        }

        return expr;
    }

    private not(): Expression
    {
        if (this.matchKeyword('NOT'))
        {
            const operand = this.not();
            return new LogicalExpression(null, LogicalOperator.Not, operand);
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
            let operator: ComparisonOperator;

            switch (operatorToken)
            {
                case '=':
                    operator = ComparisonOperator.Equal;
                    break;
                case '<>':
                    operator = ComparisonOperator.NotEqual;
                    break;
                case '<':
                    operator = ComparisonOperator.LessThan;
                    break;
                case '>':
                    operator = ComparisonOperator.GreaterThan;
                    break;
                case '<=':
                    operator = ComparisonOperator.LessThanOrEqual;
                    break;
                case '>=':
                    operator = ComparisonOperator.GreaterThanOrEqual;
                    break;
                default:
                    throw new Error(`Unknown comparison operator: ${operatorToken}`);
            }

            const right = this.addSub();
            expr = new ComparisonExpression(expr, operator, right);
        }

        return expr;
    }

    private addSub(): Expression
    {
        let expr = this.mulDiv();

        while (this.match(TokenType.Plus, TokenType.Minus))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '+' ? ArithmeticOperator.Add : ArithmeticOperator.Subtract;
            const right = this.mulDiv();
            expr = new ArithmeticExpression(expr, operator, right);
        }

        return expr;
    }

    private mulDiv(): Expression
    {
        let expr = this.unaryPlusMinus();

        while (this.match(TokenType.Star, TokenType.Slash) || this.matchKeyword('MOD'))
        {
            const operatorToken = this.previous().value;
            let operator: ArithmeticOperator;

            switch (operatorToken)
            {
                case '*':
                    operator = ArithmeticOperator.Multiply;
                    break;
                case '/':
                    operator = ArithmeticOperator.Divide;
                    break;
                case 'MOD':
                    operator = ArithmeticOperator.Modulo;
                    break;
                default:
                    throw new Error(`Unknown operator: ${operatorToken}`);
            }

            const right = this.unaryPlusMinus();
            expr = new ArithmeticExpression(expr, operator, right);
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
            return new UnaryOperatorExpression(operator, operand);
        }

        return this.exponentiation();
    }

    private exponentiation(): Expression
    {
        let expr = this.primary();

        if (this.match(TokenType.Caret, TokenType.StarStar))
        {
            const operatorToken = this.previous().value;
            const operator = operatorToken === '^' ? ArithmeticOperator.Power : ArithmeticOperator.PowerAlt;
            const right = this.exponentiation();
            expr = new ArithmeticExpression(expr, operator, right);
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
