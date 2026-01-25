import {
    CloseStatement,
    CopyStatement,
    DeleteStatement,
    FileMode,
    LineInputStatement,
    ListdirStatement,
    MkdirStatement,
    MoveStatement,
    OpenStatement,
    ReadFileStatement,
    ReadfileStatement,
    RmdirStatement,
    SeekStatement,
    WriteFileStatement,
    WritefileStatement
} from '../../../../lang/statements/file-io';
import { TokenType } from '../../tokenizer.service';
import { ParserContext } from './parser-context';

export class FileIoParsers
{
    public static parseOpen(context: ParserContext): OpenStatement
    {
        context.consume(TokenType.Keyword, 'OPEN');
        
        const filename = context.parseExpression();
        
        context.consume(TokenType.Keyword, 'FOR');
        
        let mode: FileMode;
        const modeToken = context.consume(TokenType.Keyword, 'file mode');
        
        switch (modeToken.value.toUpperCase())
        {
            case 'READ':
                mode = FileMode.Read;
                break;
            case 'APPEND':
                mode = FileMode.Append;
                break;
            case 'OVERWRITE':
                mode = FileMode.Overwrite;
                break;
            default:
                throw new Error(`Invalid file mode: ${modeToken.value}`);
        }
        
        context.consume(TokenType.Keyword, 'AS');
        
        const handleVar = context.consume(TokenType.Identifier, 'file handle variable').value;
        
        return new OpenStatement(filename, mode, handleVar);
    }

    public static parseClose(context: ParserContext): CloseStatement
    {
        context.consume(TokenType.Keyword, 'CLOSE');
        
        const fileHandle = context.parseExpression();
        
        return new CloseStatement(fileHandle);
    }

    public static parseRead(context: ParserContext): ReadFileStatement
    {
        context.consume(TokenType.Keyword, 'READ');
        
        const varName = context.consume(TokenType.Identifier, 'variable name').value;
        
        context.consume(TokenType.Keyword, 'FROM');
        
        const fileHandle = context.parseExpression();
        
        return new ReadFileStatement(varName, fileHandle);
    }

    public static parseWrite(context: ParserContext): WriteFileStatement
    {
        context.consume(TokenType.Keyword, 'WRITE');
        
        const expression = context.parseExpression();
        
        context.consume(TokenType.Keyword, 'TO');
        
        const fileHandle = context.parseExpression();
        
        return new WriteFileStatement(expression, fileHandle);
    }

    public static parseSeek(context: ParserContext): SeekStatement
    {
        context.consume(TokenType.Keyword, 'SEEK');
        
        const position = context.parseExpression();
        
        context.consume(TokenType.Keyword, 'IN');
        
        const fileHandle = context.parseExpression();
        
        return new SeekStatement(position, fileHandle);
    }

    public static parseReadfile(context: ParserContext): ReadfileStatement
    {
        context.consume(TokenType.Keyword, 'READFILE');
        
        const varName = context.consume(TokenType.Identifier, 'variable name').value;
        
        context.consume(TokenType.Keyword, 'FROM');
        
        const filename = context.parseExpression();
        
        return new ReadfileStatement(varName, filename);
    }

    public static parseWritefile(context: ParserContext): WritefileStatement
    {
        context.consume(TokenType.Keyword, 'WRITEFILE');
        
        const content = context.parseExpression();
        
        context.consume(TokenType.Keyword, 'TO');
        
        const filename = context.parseExpression();
        
        return new WritefileStatement(content, filename);
    }

    public static parseListdir(context: ParserContext): ListdirStatement
    {
        context.consume(TokenType.Keyword, 'LISTDIR');
        
        const arrayVar = context.consume(TokenType.Identifier, 'array variable').value;
        
        context.consume(TokenType.Keyword, 'FROM');
        
        const path = context.parseExpression();
        
        return new ListdirStatement(arrayVar, path);
    }

    public static parseMkdir(context: ParserContext): MkdirStatement
    {
        context.consume(TokenType.Keyword, 'MKDIR');
        
        const path = context.parseExpression();
        
        return new MkdirStatement(path);
    }

    public static parseRmdir(context: ParserContext): RmdirStatement
    {
        context.consume(TokenType.Keyword, 'RMDIR');
        
        const path = context.parseExpression();
        
        return new RmdirStatement(path);
    }

    public static parseCopy(context: ParserContext): CopyStatement
    {
        context.consume(TokenType.Keyword, 'COPY');
        
        const source = context.parseExpression();
        
        context.consume(TokenType.Keyword, 'TO');
        
        const destination = context.parseExpression();
        
        return new CopyStatement(source, destination);
    }

    public static parseMove(context: ParserContext): MoveStatement
    {
        context.consume(TokenType.Keyword, 'MOVE');
        
        const source = context.parseExpression();
        
        context.consume(TokenType.Keyword, 'TO');
        
        const destination = context.parseExpression();
        
        return new MoveStatement(source, destination);
    }

    public static parseDelete(context: ParserContext): DeleteStatement
    {
        context.consume(TokenType.Keyword, 'DELETE');
        
        const filename = context.parseExpression();
        
        return new DeleteStatement(filename);
    }
}
