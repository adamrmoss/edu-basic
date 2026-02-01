import { Expression } from '../../expressions/expression';
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
} from '../../statements/graphics';
import { LineInputStatement } from '../../statements/file-io';
import { Statement } from '../../statements/statement';
import { TokenType } from '../tokenizer';
import { ParserContext } from './parser-context';
import { ParseResult, success, failure } from '../parse-result';

export class GraphicsParsers
{
    public static parsePset(context: ParserContext): ParseResult<PsetStatement>
    {
        const psetTokenResult = context.consume(TokenType.Keyword, 'PSET');
        if (!psetTokenResult.success)
        {
            return psetTokenResult;
        }
        const leftParenResult = context.consume(TokenType.LeftParen, '(');
        if (!leftParenResult.success)
        {
            return leftParenResult;
        }
        
        const xResult = context.parseExpression();
        if (!xResult.success)
        {
            return xResult;
        }
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const yResult = context.parseExpression();
        if (!yResult.success)
        {
            return yResult;
        }
        const rightParenResult = context.consume(TokenType.RightParen, ')');
        if (!rightParenResult.success)
        {
            return rightParenResult;
        }
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            const colorResult = context.parseExpression();
            if (!colorResult.success)
            {
                return colorResult;
            }
            color = colorResult.value;
        }
        
        return success(new PsetStatement(xResult.value, yResult.value, color));
    }

    public static parseRectangle(context: ParserContext): ParseResult<RectangleStatement>
    {
        const rectTokenResult = context.consume(TokenType.Keyword, 'RECTANGLE');
        if (!rectTokenResult.success)
        {
            return rectTokenResult;
        }
        const fromTokenResult = context.consume(TokenType.Keyword, 'FROM');
        if (!fromTokenResult.success)
        {
            return fromTokenResult;
        }
        const leftParen1Result = context.consume(TokenType.LeftParen, '(');
        if (!leftParen1Result.success)
        {
            return leftParen1Result;
        }
        
        const x1Result = context.parseExpression();
        if (!x1Result.success)
        {
            return x1Result;
        }
        const comma1Result = context.consume(TokenType.Comma, ',');
        if (!comma1Result.success)
        {
            return comma1Result;
        }
        
        const y1Result = context.parseExpression();
        if (!y1Result.success)
        {
            return y1Result;
        }
        const rightParen1Result = context.consume(TokenType.RightParen, ')');
        if (!rightParen1Result.success)
        {
            return rightParen1Result;
        }
        
        const toTokenResult = context.consume(TokenType.Keyword, 'TO');
        if (!toTokenResult.success)
        {
            return toTokenResult;
        }
        const leftParen2Result = context.consume(TokenType.LeftParen, '(');
        if (!leftParen2Result.success)
        {
            return leftParen2Result;
        }
        
        const x2Result = context.parseExpression();
        if (!x2Result.success)
        {
            return x2Result;
        }
        const comma2Result = context.consume(TokenType.Comma, ',');
        if (!comma2Result.success)
        {
            return comma2Result;
        }
        
        const y2Result = context.parseExpression();
        if (!y2Result.success)
        {
            return y2Result;
        }
        const rightParen2Result = context.consume(TokenType.RightParen, ')');
        if (!rightParen2Result.success)
        {
            return rightParen2Result;
        }
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            const colorResult = context.parseExpression();
            if (!colorResult.success)
            {
                return colorResult;
            }
            color = colorResult.value;
        }
        
        const filled = context.matchKeyword('FILLED');
        
        return success(new RectangleStatement(x1Result.value, y1Result.value, x2Result.value, y2Result.value, color, filled));
    }

    public static parseOval(context: ParserContext): ParseResult<OvalStatement>
    {
        const ovalTokenResult = context.consume(TokenType.Keyword, 'OVAL');
        if (!ovalTokenResult.success)
        {
            return ovalTokenResult;
        }
        const atTokenResult = context.consume(TokenType.Keyword, 'AT');
        if (!atTokenResult.success)
        {
            return atTokenResult;
        }
        const leftParen1Result = context.consume(TokenType.LeftParen, '(');
        if (!leftParen1Result.success)
        {
            return leftParen1Result;
        }
        
        const centerXResult = context.parseExpression();
        if (!centerXResult.success)
        {
            return centerXResult;
        }
        const comma1Result = context.consume(TokenType.Comma, ',');
        if (!comma1Result.success)
        {
            return comma1Result;
        }
        
        const centerYResult = context.parseExpression();
        if (!centerYResult.success)
        {
            return centerYResult;
        }
        const rightParen1Result = context.consume(TokenType.RightParen, ')');
        if (!rightParen1Result.success)
        {
            return rightParen1Result;
        }
        
        const radiiTokenResult = context.consume(TokenType.Keyword, 'RADII');
        if (!radiiTokenResult.success)
        {
            return radiiTokenResult;
        }
        const leftParen2Result = context.consume(TokenType.LeftParen, '(');
        if (!leftParen2Result.success)
        {
            return leftParen2Result;
        }
        
        const radiusXResult = context.parseExpression();
        if (!radiusXResult.success)
        {
            return radiusXResult;
        }
        const comma2Result = context.consume(TokenType.Comma, ',');
        if (!comma2Result.success)
        {
            return comma2Result;
        }
        
        const radiusYResult = context.parseExpression();
        if (!radiusYResult.success)
        {
            return radiusYResult;
        }
        const rightParen2Result = context.consume(TokenType.RightParen, ')');
        if (!rightParen2Result.success)
        {
            return rightParen2Result;
        }
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            const colorResult = context.parseExpression();
            if (!colorResult.success)
            {
                return colorResult;
            }
            color = colorResult.value;
        }
        
        const filled = context.matchKeyword('FILLED');
        
        return success(new OvalStatement(centerXResult.value, centerYResult.value, radiusXResult.value, radiusYResult.value, color, filled));
    }

    public static parseCircle(context: ParserContext): ParseResult<CircleStatement>
    {
        const circleTokenResult = context.consume(TokenType.Keyword, 'CIRCLE');
        if (!circleTokenResult.success)
        {
            return circleTokenResult;
        }
        const atTokenResult = context.consume(TokenType.Keyword, 'AT');
        if (!atTokenResult.success)
        {
            return atTokenResult;
        }
        const leftParenResult = context.consume(TokenType.LeftParen, '(');
        if (!leftParenResult.success)
        {
            return leftParenResult;
        }
        
        const centerXResult = context.parseExpression();
        if (!centerXResult.success)
        {
            return centerXResult;
        }
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const centerYResult = context.parseExpression();
        if (!centerYResult.success)
        {
            return centerYResult;
        }
        const rightParenResult = context.consume(TokenType.RightParen, ')');
        if (!rightParenResult.success)
        {
            return rightParenResult;
        }
        
        const radiusTokenResult = context.consume(TokenType.Keyword, 'RADIUS');
        if (!radiusTokenResult.success)
        {
            return radiusTokenResult;
        }
        
        const radiusResult = context.parseExpression();
        if (!radiusResult.success)
        {
            return radiusResult;
        }
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            const colorResult = context.parseExpression();
            if (!colorResult.success)
            {
                return colorResult;
            }
            color = colorResult.value;
        }
        
        const filled = context.matchKeyword('FILLED');
        
        return success(new CircleStatement(centerXResult.value, centerYResult.value, radiusResult.value, color, filled));
    }

    public static parseTriangle(context: ParserContext): ParseResult<TriangleStatement>
    {
        const triangleTokenResult = context.consume(TokenType.Keyword, 'TRIANGLE');
        if (!triangleTokenResult.success)
        {
            return triangleTokenResult;
        }
        const leftParen1Result = context.consume(TokenType.LeftParen, '(');
        if (!leftParen1Result.success)
        {
            return leftParen1Result;
        }
        
        const x1Result = context.parseExpression();
        if (!x1Result.success)
        {
            return x1Result;
        }
        const comma1Result = context.consume(TokenType.Comma, ',');
        if (!comma1Result.success)
        {
            return comma1Result;
        }
        
        const y1Result = context.parseExpression();
        if (!y1Result.success)
        {
            return y1Result;
        }
        const rightParen1Result = context.consume(TokenType.RightParen, ')');
        if (!rightParen1Result.success)
        {
            return rightParen1Result;
        }
        const leftParen2Result = context.consume(TokenType.LeftParen, '(');
        if (!leftParen2Result.success)
        {
            return leftParen2Result;
        }
        
        const x2Result = context.parseExpression();
        if (!x2Result.success)
        {
            return x2Result;
        }
        const comma2Result = context.consume(TokenType.Comma, ',');
        if (!comma2Result.success)
        {
            return comma2Result;
        }
        
        const y2Result = context.parseExpression();
        if (!y2Result.success)
        {
            return y2Result;
        }
        const rightParen2Result = context.consume(TokenType.RightParen, ')');
        if (!rightParen2Result.success)
        {
            return rightParen2Result;
        }
        const leftParen3Result = context.consume(TokenType.LeftParen, '(');
        if (!leftParen3Result.success)
        {
            return leftParen3Result;
        }
        
        const x3Result = context.parseExpression();
        if (!x3Result.success)
        {
            return x3Result;
        }
        const comma3Result = context.consume(TokenType.Comma, ',');
        if (!comma3Result.success)
        {
            return comma3Result;
        }
        
        const y3Result = context.parseExpression();
        if (!y3Result.success)
        {
            return y3Result;
        }
        const rightParen3Result = context.consume(TokenType.RightParen, ')');
        if (!rightParen3Result.success)
        {
            return rightParen3Result;
        }
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            const colorResult = context.parseExpression();
            if (!colorResult.success)
            {
                return colorResult;
            }
            color = colorResult.value;
        }
        
        const filled = context.matchKeyword('FILLED');
        
        return success(new TriangleStatement(x1Result.value, y1Result.value, x2Result.value, y2Result.value, x3Result.value, y3Result.value, color, filled));
    }

    public static parseArc(context: ParserContext): ParseResult<ArcStatement>
    {
        const arcTokenResult = context.consume(TokenType.Keyword, 'ARC');
        if (!arcTokenResult.success)
        {
            return arcTokenResult;
        }
        const atTokenResult = context.consume(TokenType.Keyword, 'AT');
        if (!atTokenResult.success)
        {
            return atTokenResult;
        }
        const leftParenResult = context.consume(TokenType.LeftParen, '(');
        if (!leftParenResult.success)
        {
            return leftParenResult;
        }
        
        const centerXResult = context.parseExpression();
        if (!centerXResult.success)
        {
            return centerXResult;
        }
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const centerYResult = context.parseExpression();
        if (!centerYResult.success)
        {
            return centerYResult;
        }
        const rightParenResult = context.consume(TokenType.RightParen, ')');
        if (!rightParenResult.success)
        {
            return rightParenResult;
        }
        
        const radiusTokenResult = context.consume(TokenType.Keyword, 'RADIUS');
        if (!radiusTokenResult.success)
        {
            return radiusTokenResult;
        }
        
        const radiusResult = context.parseExpression();
        if (!radiusResult.success)
        {
            return radiusResult;
        }
        
        const fromTokenResult = context.consume(TokenType.Keyword, 'FROM');
        if (!fromTokenResult.success)
        {
            return fromTokenResult;
        }
        
        const startAngleResult = context.parseExpression();
        if (!startAngleResult.success)
        {
            return startAngleResult;
        }
        
        const toTokenResult = context.consume(TokenType.Keyword, 'TO');
        if (!toTokenResult.success)
        {
            return toTokenResult;
        }
        
        const endAngleResult = context.parseExpression();
        if (!endAngleResult.success)
        {
            return endAngleResult;
        }
        
        let color: Expression | null = null;
        if (context.matchKeyword('WITH'))
        {
            const colorResult = context.parseExpression();
            if (!colorResult.success)
            {
                return colorResult;
            }
            color = colorResult.value;
        }
        
        return success(new ArcStatement(centerXResult.value, centerYResult.value, radiusResult.value, startAngleResult.value, endAngleResult.value, color));
    }

    public static parsePaint(context: ParserContext): ParseResult<PaintStatement>
    {
        const paintTokenResult = context.consume(TokenType.Keyword, 'PAINT');
        if (!paintTokenResult.success)
        {
            return paintTokenResult;
        }
        const leftParenResult = context.consume(TokenType.LeftParen, '(');
        if (!leftParenResult.success)
        {
            return leftParenResult;
        }
        
        const xResult = context.parseExpression();
        if (!xResult.success)
        {
            return xResult;
        }
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const yResult = context.parseExpression();
        if (!yResult.success)
        {
            return yResult;
        }
        const rightParenResult = context.consume(TokenType.RightParen, ')');
        if (!rightParenResult.success)
        {
            return rightParenResult;
        }
        
        const withTokenResult = context.consume(TokenType.Keyword, 'WITH');
        if (!withTokenResult.success)
        {
            return withTokenResult;
        }
        
        const colorResult = context.parseExpression();
        if (!colorResult.success)
        {
            return colorResult;
        }
        
        return success(new PaintStatement(xResult.value, yResult.value, colorResult.value));
    }

    public static parseGet(context: ParserContext): ParseResult<GetStatement>
    {
        const getTokenResult = context.consume(TokenType.Keyword, 'GET');
        if (!getTokenResult.success)
        {
            return getTokenResult;
        }
        
        const arrayVarTokenResult = context.consume(TokenType.Identifier, 'array variable');
        if (!arrayVarTokenResult.success)
        {
            return arrayVarTokenResult;
        }
        
        const fromTokenResult = context.consume(TokenType.Keyword, 'FROM');
        if (!fromTokenResult.success)
        {
            return fromTokenResult;
        }
        const leftParen1Result = context.consume(TokenType.LeftParen, '(');
        if (!leftParen1Result.success)
        {
            return leftParen1Result;
        }
        
        const x1Result = context.parseExpression();
        if (!x1Result.success)
        {
            return x1Result;
        }
        const comma1Result = context.consume(TokenType.Comma, ',');
        if (!comma1Result.success)
        {
            return comma1Result;
        }
        
        const y1Result = context.parseExpression();
        if (!y1Result.success)
        {
            return y1Result;
        }
        const rightParen1Result = context.consume(TokenType.RightParen, ')');
        if (!rightParen1Result.success)
        {
            return rightParen1Result;
        }
        
        const toTokenResult = context.consume(TokenType.Keyword, 'TO');
        if (!toTokenResult.success)
        {
            return toTokenResult;
        }
        const leftParen2Result = context.consume(TokenType.LeftParen, '(');
        if (!leftParen2Result.success)
        {
            return leftParen2Result;
        }
        
        const x2Result = context.parseExpression();
        if (!x2Result.success)
        {
            return x2Result;
        }
        const comma2Result = context.consume(TokenType.Comma, ',');
        if (!comma2Result.success)
        {
            return comma2Result;
        }
        
        const y2Result = context.parseExpression();
        if (!y2Result.success)
        {
            return y2Result;
        }
        const rightParen2Result = context.consume(TokenType.RightParen, ')');
        if (!rightParen2Result.success)
        {
            return rightParen2Result;
        }
        
        return success(new GetStatement(arrayVarTokenResult.value.value, x1Result.value, y1Result.value, x2Result.value, y2Result.value));
    }

    public static parsePut(context: ParserContext): ParseResult<PutStatement>
    {
        const putTokenResult = context.consume(TokenType.Keyword, 'PUT');
        if (!putTokenResult.success)
        {
            return putTokenResult;
        }
        
        const arrayVarTokenResult = context.consume(TokenType.Identifier, 'array variable');
        if (!arrayVarTokenResult.success)
        {
            return arrayVarTokenResult;
        }
        
        const atTokenResult = context.consume(TokenType.Keyword, 'AT');
        if (!atTokenResult.success)
        {
            return atTokenResult;
        }
        const leftParenResult = context.consume(TokenType.LeftParen, '(');
        if (!leftParenResult.success)
        {
            return leftParenResult;
        }
        
        const xResult = context.parseExpression();
        if (!xResult.success)
        {
            return xResult;
        }
        const commaResult = context.consume(TokenType.Comma, ',');
        if (!commaResult.success)
        {
            return commaResult;
        }
        
        const yResult = context.parseExpression();
        if (!yResult.success)
        {
            return yResult;
        }
        const rightParenResult = context.consume(TokenType.RightParen, ')');
        if (!rightParenResult.success)
        {
            return rightParenResult;
        }
        
        return success(new PutStatement(arrayVarTokenResult.value.value, xResult.value, yResult.value));
    }

    public static parseTurtle(context: ParserContext): ParseResult<TurtleStatement>
    {
        const turtleTokenResult = context.consume(TokenType.Keyword, 'TURTLE');
        if (!turtleTokenResult.success)
        {
            return turtleTokenResult;
        }
        
        const commandsResult = context.parseExpression();
        if (!commandsResult.success)
        {
            return commandsResult;
        }
        
        return success(new TurtleStatement(commandsResult.value));
    }

    public static parseLineInputOrGraphics(context: ParserContext): ParseResult<Statement>
    {
        const lineTokenResult = context.consume(TokenType.Keyword, 'LINE');
        if (!lineTokenResult.success)
        {
            return lineTokenResult;
        }
        
        if (context.matchKeyword('INPUT'))
        {
            const varNameTokenResult = context.consume(TokenType.Identifier, 'variable name');
            if (!varNameTokenResult.success)
            {
                return varNameTokenResult;
            }
            
            const fromTokenResult = context.consume(TokenType.Keyword, 'FROM');
            if (!fromTokenResult.success)
            {
                return fromTokenResult;
            }
            
            const fileHandleResult = context.parseExpression();
            if (!fileHandleResult.success)
            {
                return fileHandleResult;
            }
            
            return success(new LineInputStatement(varNameTokenResult.value.value, fileHandleResult.value));
        }
        else if (context.matchKeyword('FROM'))
        {
            const leftParen1Result = context.consume(TokenType.LeftParen, '(');
            if (!leftParen1Result.success)
            {
                return leftParen1Result;
            }
            
            const x1Result = context.parseExpression();
            if (!x1Result.success)
            {
                return x1Result;
            }
            const comma1Result = context.consume(TokenType.Comma, ',');
            if (!comma1Result.success)
            {
                return comma1Result;
            }
            
            const y1Result = context.parseExpression();
            if (!y1Result.success)
            {
                return y1Result;
            }
            const rightParen1Result = context.consume(TokenType.RightParen, ')');
            if (!rightParen1Result.success)
            {
                return rightParen1Result;
            }
            
            const toTokenResult = context.consume(TokenType.Keyword, 'TO');
            if (!toTokenResult.success)
            {
                return toTokenResult;
            }
            const leftParen2Result = context.consume(TokenType.LeftParen, '(');
            if (!leftParen2Result.success)
            {
                return leftParen2Result;
            }
            
            const x2Result = context.parseExpression();
            if (!x2Result.success)
            {
                return x2Result;
            }
            const comma2Result = context.consume(TokenType.Comma, ',');
            if (!comma2Result.success)
            {
                return comma2Result;
            }
            
            const y2Result = context.parseExpression();
            if (!y2Result.success)
            {
                return y2Result;
            }
            const rightParen2Result = context.consume(TokenType.RightParen, ')');
            if (!rightParen2Result.success)
            {
                return rightParen2Result;
            }
            
            let color: Expression | null = null;
            if (context.matchKeyword('WITH'))
            {
                const colorResult = context.parseExpression();
                if (!colorResult.success)
                {
                    return colorResult;
                }
                color = colorResult.value;
            }
            
            return success(new LineStatement(x1Result.value, y1Result.value, x2Result.value, y2Result.value, color));
        }
        
        return failure('Expected INPUT or FROM after LINE');
    }
}
