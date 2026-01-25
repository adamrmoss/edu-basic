import { Expression } from '../../../../lang/expressions/expression';
import {
    ArcStatement,
    CircleStatement,
    GetStatement,
    LineStatement,
    OvalStatement,
    PaintStatement,
    PsetStatement,
    PutStatement,
    RectangleStatement,
    TriangleStatement,
    TurtleStatement
} from '../../../../lang/statements/graphics';
import { LineInputStatement } from '../../../../lang/statements/file-io';
import { Statement } from '../../../../lang/statements/statement';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';

export class GraphicsParsers
{
    public static parsePset(context: ParserContext): PsetStatement
    {
        context.consume(TokenType.Keyword, 'PSET');
        context.consume(TokenType.LeftParen, '(');
        
        const x = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            color = context.parseExpression();
        }
        
        return new PsetStatement(x, y, color);
    }

    public static parseRectangle(context: ParserContext): RectangleStatement
    {
        context.consume(TokenType.Keyword, 'RECTANGLE');
        context.consume(TokenType.Keyword, 'FROM');
        context.consume(TokenType.LeftParen, '(');
        
        const x1 = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y1 = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        context.consume(TokenType.Keyword, 'TO');
        context.consume(TokenType.LeftParen, '(');
        
        const x2 = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y2 = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            color = context.parseExpression();
        }
        
        const filled = context.matchKeyword('FILLED');
        
        return new RectangleStatement(x1, y1, x2, y2, color, filled);
    }

    public static parseOval(context: ParserContext): OvalStatement
    {
        context.consume(TokenType.Keyword, 'OVAL');
        context.consume(TokenType.Keyword, 'AT');
        context.consume(TokenType.LeftParen, '(');
        
        const centerX = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const centerY = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        context.consume(TokenType.Keyword, 'RADII');
        context.consume(TokenType.LeftParen, '(');
        
        const radiusX = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const radiusY = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            color = context.parseExpression();
        }
        
        const filled = context.matchKeyword('FILLED');
        
        return new OvalStatement(centerX, centerY, radiusX, radiusY, color, filled);
    }

    public static parseCircle(context: ParserContext): CircleStatement
    {
        context.consume(TokenType.Keyword, 'CIRCLE');
        context.consume(TokenType.Keyword, 'AT');
        context.consume(TokenType.LeftParen, '(');
        
        const centerX = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const centerY = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        context.consume(TokenType.Keyword, 'RADIUS');
        
        const radius = context.parseExpression();
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            color = context.parseExpression();
        }
        
        const filled = context.matchKeyword('FILLED');
        
        return new CircleStatement(centerX, centerY, radius, color, filled);
    }

    public static parseTriangle(context: ParserContext): TriangleStatement
    {
        context.consume(TokenType.Keyword, 'TRIANGLE');
        context.consume(TokenType.LeftParen, '(');
        
        const x1 = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y1 = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        context.consume(TokenType.LeftParen, '(');
        
        const x2 = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y2 = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        context.consume(TokenType.LeftParen, '(');
        
        const x3 = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y3 = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            color = context.parseExpression();
        }
        
        const filled = context.matchKeyword('FILLED');
        
        return new TriangleStatement(x1, y1, x2, y2, x3, y3, color, filled);
    }

    public static parseArc(context: ParserContext): ArcStatement
    {
        context.consume(TokenType.Keyword, 'ARC');
        context.consume(TokenType.Keyword, 'AT');
        context.consume(TokenType.LeftParen, '(');
        
        const centerX = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const centerY = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        context.consume(TokenType.Keyword, 'RADIUS');
        
        const radius = context.parseExpression();
        
        context.consume(TokenType.Keyword, 'FROM');
        
        const startAngle = context.parseExpression();
        
        context.consume(TokenType.Keyword, 'TO');
        
        const endAngle = context.parseExpression();
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            color = context.parseExpression();
        }
        
        return new ArcStatement(centerX, centerY, radius, startAngle, endAngle, color);
    }

    public static parsePaint(context: ParserContext): PaintStatement
    {
        context.consume(TokenType.Keyword, 'PAINT');
        context.consume(TokenType.LeftParen, '(');
        
        const x = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        context.consume(TokenType.Keyword, 'WITH');
        
        const color = context.parseExpression();
        
        return new PaintStatement(x, y, color);
    }

    public static parseGet(context: ParserContext): GetStatement
    {
        context.consume(TokenType.Keyword, 'GET');
        
        const arrayVar = context.consume(TokenType.Identifier, 'array variable').value;
        
        context.consume(TokenType.Keyword, 'FROM');
        context.consume(TokenType.LeftParen, '(');
        
        const x1 = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y1 = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        context.consume(TokenType.Keyword, 'TO');
        context.consume(TokenType.LeftParen, '(');
        
        const x2 = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y2 = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        return new GetStatement(arrayVar, x1, y1, x2, y2);
    }

    public static parsePut(context: ParserContext): PutStatement
    {
        context.consume(TokenType.Keyword, 'PUT');
        
        const arrayVar = context.consume(TokenType.Identifier, 'array variable').value;
        
        context.consume(TokenType.Keyword, 'AT');
        context.consume(TokenType.LeftParen, '(');
        
        const x = context.parseExpression();
        context.consume(TokenType.Comma, ',');
        
        const y = context.parseExpression();
        context.consume(TokenType.RightParen, ')');
        
        return new PutStatement(arrayVar, x, y);
    }

    public static parseTurtle(context: ParserContext): TurtleStatement
    {
        context.consume(TokenType.Keyword, 'TURTLE');
        
        const commands = context.parseExpression();
        
        return new TurtleStatement(commands);
    }

    public static parseLineInputOrGraphics(context: ParserContext): Statement
    {
        context.consume(TokenType.Keyword, 'LINE');
        
        if (context.matchKeyword('INPUT'))
        {
            const varName = context.consume(TokenType.Identifier, 'variable name').value;
            
            context.consume(TokenType.Keyword, 'FROM');
            
            const fileHandle = context.parseExpression();
            
            return new LineInputStatement(varName, fileHandle);
        }
        else if (context.matchKeyword('FROM'))
        {
            context.consume(TokenType.LeftParen, '(');
            
            const x1 = context.parseExpression();
            context.consume(TokenType.Comma, ',');
            
            const y1 = context.parseExpression();
            context.consume(TokenType.RightParen, ')');
            
            context.consume(TokenType.Keyword, 'TO');
            context.consume(TokenType.LeftParen, '(');
            
            const x2 = context.parseExpression();
            context.consume(TokenType.Comma, ',');
            
            const y2 = context.parseExpression();
            context.consume(TokenType.RightParen, ')');
            
            let color: Expression | null = null;
            if (context.matchKeyword('WITH'))
            {
                color = context.parseExpression();
            }
            
            return new LineStatement(x1, y1, x2, y2, color);
        }
        
        throw new Error('Expected INPUT or FROM after LINE');
    }
}
