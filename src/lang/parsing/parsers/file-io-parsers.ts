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
} from '../../statements/file-io';
import { TokenType } from '../tokenizer';
import { ParserContext } from './parser-context';
import { ParseResult, success, failure } from '../parse-result';

export class FileIoParsers
{
    public static parseOpen(context: ParserContext): ParseResult<OpenStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // OPEN filenameExpr FOR READ|APPEND|OVERWRITE AS handleVar%
        const openTokenResult = context.consumeKeyword('OPEN');
        if (!openTokenResult.success)
        {
            return openTokenResult;
        }
        
        const filenameResult = context.parseExpression();
        if (!filenameResult.success)
        {
            return filenameResult;
        }
        
        const forTokenResult = context.consumeKeyword('FOR');
        if (!forTokenResult.success)
        {
            return forTokenResult;
        }
        
        let mode: FileMode;
        const modeTokenResult = context.consume(TokenType.Keyword, 'file mode');
        if (!modeTokenResult.success)
        {
            return modeTokenResult;
        }
        
        switch (modeTokenResult.value.value.toUpperCase())
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
                return failure(`Invalid file mode: ${modeTokenResult.value.value}`);
        }
        
        const asTokenResult = context.consumeKeyword('AS');
        if (!asTokenResult.success)
        {
            return asTokenResult;
        }
        
        const handleVarTokenResult = context.consume(TokenType.Identifier, 'file handle variable');
        if (!handleVarTokenResult.success)
        {
            return handleVarTokenResult;
        }
        
        return success(new OpenStatement(filenameResult.value, mode, handleVarTokenResult.value.value));
    }

    public static parseClose(context: ParserContext): ParseResult<CloseStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // CLOSE fileHandleExpr
        const closeTokenResult = context.consumeKeyword('CLOSE');
        if (!closeTokenResult.success)
        {
            return closeTokenResult;
        }
        
        const fileHandleResult = context.parseExpression();
        if (!fileHandleResult.success)
        {
            return fileHandleResult;
        }
        
        return success(new CloseStatement(fileHandleResult.value));
    }

    public static parseRead(context: ParserContext): ParseResult<ReadFileStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // READ varName FROM fileHandleExpr
        const readTokenResult = context.consumeKeyword('READ');
        if (!readTokenResult.success)
        {
            return readTokenResult;
        }
        
        const varNameTokenResult = context.consume(TokenType.Identifier, 'variable name');
        if (!varNameTokenResult.success)
        {
            return varNameTokenResult;
        }
        
        const fromTokenResult = context.consumeKeyword('FROM');
        if (!fromTokenResult.success)
        {
            return fromTokenResult;
        }
        
        const fileHandleResult = context.parseExpression();
        if (!fileHandleResult.success)
        {
            return fileHandleResult;
        }
        
        return success(new ReadFileStatement(varNameTokenResult.value.value, fileHandleResult.value));
    }

    public static parseWrite(context: ParserContext): ParseResult<WriteFileStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // WRITE valueExpr TO fileHandleExpr
        const writeTokenResult = context.consumeKeyword('WRITE');
        if (!writeTokenResult.success)
        {
            return writeTokenResult;
        }
        
        const expressionResult = context.parseExpression();
        if (!expressionResult.success)
        {
            return expressionResult;
        }
        
        const toTokenResult = context.consumeKeyword('TO');
        if (!toTokenResult.success)
        {
            return toTokenResult;
        }
        
        const fileHandleResult = context.parseExpression();
        if (!fileHandleResult.success)
        {
            return fileHandleResult;
        }
        
        return success(new WriteFileStatement(expressionResult.value, fileHandleResult.value));
    }

    public static parseSeek(context: ParserContext): ParseResult<SeekStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // SEEK positionExpr IN fileHandleExpr
        const seekTokenResult = context.consumeKeyword('SEEK');
        if (!seekTokenResult.success)
        {
            return seekTokenResult;
        }
        
        const positionResult = context.parseExpression();
        if (!positionResult.success)
        {
            return positionResult;
        }
        
        const inTokenResult = context.consumeKeyword('IN');
        if (!inTokenResult.success)
        {
            return inTokenResult;
        }
        
        const fileHandleResult = context.parseExpression();
        if (!fileHandleResult.success)
        {
            return fileHandleResult;
        }
        
        return success(new SeekStatement(positionResult.value, fileHandleResult.value));
    }

    public static parseReadfile(context: ParserContext): ParseResult<ReadfileStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // NOTE: The language reference documents:
        // READFILE "filename" INTO contentVariable$
        //
        // Current implementation parses:
        // READFILE contentVariable$ FROM "filename"
        const readfileTokenResult = context.consumeKeyword('READFILE');
        if (!readfileTokenResult.success)
        {
            return readfileTokenResult;
        }
        
        const varNameTokenResult = context.consume(TokenType.Identifier, 'variable name');
        if (!varNameTokenResult.success)
        {
            return varNameTokenResult;
        }
        
        const fromTokenResult = context.consumeKeyword('FROM');
        if (!fromTokenResult.success)
        {
            return fromTokenResult;
        }
        
        const filenameResult = context.parseExpression();
        if (!filenameResult.success)
        {
            return filenameResult;
        }
        
        return success(new ReadfileStatement(varNameTokenResult.value.value, filenameResult.value));
    }

    public static parseWritefile(context: ParserContext): ParseResult<WritefileStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // WRITEFILE contentExpr TO filenameExpr
        const writefileTokenResult = context.consumeKeyword('WRITEFILE');
        if (!writefileTokenResult.success)
        {
            return writefileTokenResult;
        }
        
        const contentResult = context.parseExpression();
        if (!contentResult.success)
        {
            return contentResult;
        }
        
        const toTokenResult = context.consumeKeyword('TO');
        if (!toTokenResult.success)
        {
            return toTokenResult;
        }
        
        const filenameResult = context.parseExpression();
        if (!filenameResult.success)
        {
            return filenameResult;
        }
        
        return success(new WritefileStatement(contentResult.value, filenameResult.value));
    }

    public static parseListdir(context: ParserContext): ParseResult<ListdirStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // NOTE: The language reference documents:
        // LISTDIR "path" INTO filesArray$[]
        //
        // Current implementation parses:
        // LISTDIR filesArray$[] FROM "path"
        const listdirTokenResult = context.consumeKeyword('LISTDIR');
        if (!listdirTokenResult.success)
        {
            return listdirTokenResult;
        }
        
        const arrayVarTokenResult = context.consume(TokenType.Identifier, 'array variable');
        if (!arrayVarTokenResult.success)
        {
            return arrayVarTokenResult;
        }
        
        const fromTokenResult = context.consumeKeyword('FROM');
        if (!fromTokenResult.success)
        {
            return fromTokenResult;
        }
        
        const pathResult = context.parseExpression();
        if (!pathResult.success)
        {
            return pathResult;
        }
        
        return success(new ListdirStatement(arrayVarTokenResult.value.value, pathResult.value));
    }

    public static parseMkdir(context: ParserContext): ParseResult<MkdirStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // MKDIR pathExpr
        const mkdirTokenResult = context.consumeKeyword('MKDIR');
        if (!mkdirTokenResult.success)
        {
            return mkdirTokenResult;
        }
        
        const pathResult = context.parseExpression();
        if (!pathResult.success)
        {
            return pathResult;
        }
        
        return success(new MkdirStatement(pathResult.value));
    }

    public static parseRmdir(context: ParserContext): ParseResult<RmdirStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // RMDIR pathExpr
        const rmdirTokenResult = context.consumeKeyword('RMDIR');
        if (!rmdirTokenResult.success)
        {
            return rmdirTokenResult;
        }
        
        const pathResult = context.parseExpression();
        if (!pathResult.success)
        {
            return pathResult;
        }
        
        return success(new RmdirStatement(pathResult.value));
    }

    public static parseCopy(context: ParserContext): ParseResult<CopyStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // COPY sourceExpr TO destinationExpr
        const copyTokenResult = context.consumeKeyword('COPY');
        if (!copyTokenResult.success)
        {
            return copyTokenResult;
        }
        
        const sourceResult = context.parseExpression();
        if (!sourceResult.success)
        {
            return sourceResult;
        }
        
        const toTokenResult = context.consumeKeyword('TO');
        if (!toTokenResult.success)
        {
            return toTokenResult;
        }
        
        const destinationResult = context.parseExpression();
        if (!destinationResult.success)
        {
            return destinationResult;
        }
        
        return success(new CopyStatement(sourceResult.value, destinationResult.value));
    }

    public static parseMove(context: ParserContext): ParseResult<MoveStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // MOVE sourceExpr TO destinationExpr
        const moveTokenResult = context.consumeKeyword('MOVE');
        if (!moveTokenResult.success)
        {
            return moveTokenResult;
        }
        
        const sourceResult = context.parseExpression();
        if (!sourceResult.success)
        {
            return sourceResult;
        }
        
        const toTokenResult = context.consumeKeyword('TO');
        if (!toTokenResult.success)
        {
            return toTokenResult;
        }
        
        const destinationResult = context.parseExpression();
        if (!destinationResult.success)
        {
            return destinationResult;
        }
        
        return success(new MoveStatement(sourceResult.value, destinationResult.value));
    }

    public static parseDelete(context: ParserContext): ParseResult<DeleteStatement>
    {
        // Spec: docs/edu-basic-language.md
        //
        // DELETE filenameExpr
        const deleteTokenResult = context.consumeKeyword('DELETE');
        if (!deleteTokenResult.success)
        {
            return deleteTokenResult;
        }
        
        const filenameResult = context.parseExpression();
        if (!filenameResult.success)
        {
            return filenameResult;
        }
        
        return success(new DeleteStatement(filenameResult.value));
    }
}
