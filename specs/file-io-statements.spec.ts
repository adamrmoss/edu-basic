import { ExecutionContext } from '../src/lang/execution-context';
import { Program } from '../src/lang/program';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { ExecutionResult } from '../src/lang/statements/statement';
import { EduBasicType } from '../src/lang/edu-basic-value';
import { Graphics } from '../src/lang/graphics';
import { Audio } from '../src/lang/audio';
import { FileSystemService } from '../src/app/disk/filesystem.service';

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
} from '../src/lang/statements/file-io';

import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { VariableExpression } from '../src/lang/expressions/special/variable-expression';

describe('File I/O Statements', () => {
    let context: ExecutionContext;
    let program: Program;
    let runtime: RuntimeExecution;
    let graphics: Graphics;
    let audio: Audio;
    let fileSystem: FileSystemService;

    beforeEach(() => {
        context = new ExecutionContext();
        program = new Program();
        graphics = new Graphics();
        audio = new Audio();
        fileSystem = new FileSystemService();
        runtime = new RuntimeExecution(program, context, graphics, audio, fileSystem);
    });

    afterEach(() => {
        fileSystem.clear();
    });

    describe('OpenStatement', () => {
        it('should open file for reading', () => {
            const data = new TextEncoder().encode('Test content');
            fileSystem.writeFile('test.txt', data);

            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'test.txt' });
            const stmt = new OpenStatement(filename, FileMode.Read, 'handle%');

            const result = stmt.execute(context, graphics, audio, program, runtime);

            expect(result.result).toBe(ExecutionResult.Continue);
            
            const handleValue = context.getVariable('handle%');
            expect(handleValue.type).toBe(EduBasicType.Integer);
            expect(handleValue.value).toBeGreaterThan(0);
        });

        it('should open file for writing', () => {
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'new.txt' });
            const stmt = new OpenStatement(filename, FileMode.Overwrite, 'handle%');

            const result = stmt.execute(context, graphics, audio, program, runtime);

            expect(result.result).toBe(ExecutionResult.Continue);
            
            const handleValue = context.getVariable('handle%');
            expect(handleValue.type).toBe(EduBasicType.Integer);
            expect(handleValue.value).toBeGreaterThan(0);
        });

        it('should open file for appending', () => {
            const data = new TextEncoder().encode('Existing');
            fileSystem.writeFile('append.txt', data);

            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'append.txt' });
            const stmt = new OpenStatement(filename, FileMode.Append, 'handle%');

            const result = stmt.execute(context, graphics, audio, program, runtime);

            expect(result.result).toBe(ExecutionResult.Continue);
        });

        it('should throw error when opening non-existent file for reading', () => {
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'missing.txt' });
            const stmt = new OpenStatement(filename, FileMode.Read, 'handle%');

            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('File not found: missing.txt');
        });

        it('should throw error for non-string filename', () => {
            const filename = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const stmt = new OpenStatement(filename, FileMode.Read, 'handle%');

            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('OPEN: filename must be a string');
        });

        it('should generate unique handles', () => {
            fileSystem.writeFile('file1.txt', new Uint8Array([1]));
            fileSystem.writeFile('file2.txt', new Uint8Array([2]));

            const file1 = new LiteralExpression({ type: EduBasicType.String, value: 'file1.txt' });
            const file2 = new LiteralExpression({ type: EduBasicType.String, value: 'file2.txt' });

            const stmt1 = new OpenStatement(file1, FileMode.Read, 'handle1%');
            const stmt2 = new OpenStatement(file2, FileMode.Read, 'handle2%');

            stmt1.execute(context, graphics, audio, program, runtime);
            stmt2.execute(context, graphics, audio, program, runtime);

            const handle1 = context.getVariable('handle1%').value as number;
            const handle2 = context.getVariable('handle2%').value as number;

            expect(handle1).not.toBe(handle2);
        });

        it('should format toString correctly', () => {
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'test.txt' });
            const stmt = new OpenStatement(filename, FileMode.Read, 'handle%');

            expect(stmt.toString()).toBe('OPEN "test.txt" FOR READ AS handle%');
        });
    });

    describe('CloseStatement', () => {
        it('should close open file handle', () => {
            fileSystem.writeFile('test.txt', new Uint8Array([1, 2, 3]));

            const handle = fileSystem.openFile('test.txt', 'read');
            context.setVariable('handle%', { type: EduBasicType.Integer, value: handle });

            const handleExpr = new VariableExpression('handle%');
            const stmt = new CloseStatement(handleExpr);

            const result = stmt.execute(context, graphics, audio, program, runtime);

            expect(result.result).toBe(ExecutionResult.Continue);
        });

        it('should throw error for invalid handle', () => {
            context.setVariable('invalid%', { type: EduBasicType.Integer, value: 999 });

            const handleExpr = new VariableExpression('invalid%');
            const stmt = new CloseStatement(handleExpr);

            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('Invalid file handle: 999');
        });

        it('should throw error for non-integer handle', () => {
            context.setVariable('bad$', { type: EduBasicType.String, value: 'not a handle' });

            const handleExpr = new VariableExpression('bad$');
            const stmt = new CloseStatement(handleExpr);

            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('CLOSE: file handle must be an integer');
        });

        it('should format toString correctly', () => {
            const handleExpr = new VariableExpression('handle%');
            const stmt = new CloseStatement(handleExpr);

            expect(stmt.toString()).toBe('CLOSE handle%');
        });
    });

    describe('ReadfileStatement', () => {
        it('should read entire file into variable', () => {
            const content = 'Hello, World!';
            const data = new TextEncoder().encode(content);
            fileSystem.writeFile('hello.txt', data);

            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'hello.txt' });
            const stmt = new ReadfileStatement('content$', filename);

            const result = stmt.execute(context, graphics, audio, program, runtime);

            expect(result.result).toBe(ExecutionResult.Continue);
            
            const contentValue = context.getVariable('content$');
            expect(contentValue.type).toBe(EduBasicType.String);
            expect(contentValue.value).toBe(content);
        });

        it('should read UTF-8 encoded file', () => {
            const content = 'Hello 世界 🌍';
            const data = new TextEncoder().encode(content);
            fileSystem.writeFile('unicode.txt', data);

            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'unicode.txt' });
            const stmt = new ReadfileStatement('text$', filename);

            stmt.execute(context, graphics, audio, program, runtime);

            const textValue = context.getVariable('text$');
            expect(textValue.value).toBe(content);
        });

        it('should throw error for non-existent file', () => {
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'missing.txt' });
            const stmt = new ReadfileStatement('content$', filename);

            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('READFILE: file not found: missing.txt');
        });

        it('should throw error for non-string filename', () => {
            const filename = new LiteralExpression({ type: EduBasicType.Integer, value: 123 });
            const stmt = new ReadfileStatement('content$', filename);

            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('READFILE: filename must be a string');
        });

        it('should read empty file', () => {
            fileSystem.writeFile('empty.txt', new Uint8Array(0));

            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'empty.txt' });
            const stmt = new ReadfileStatement('empty$', filename);

            stmt.execute(context, graphics, audio, program, runtime);

            const emptyValue = context.getVariable('empty$');
            expect(emptyValue.value).toBe('');
        });

        it('should format toString correctly', () => {
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'data.txt' });
            const stmt = new ReadfileStatement('content$', filename);

            expect(stmt.toString()).toBe('READFILE content$ FROM "data.txt"');
        });
    });

    describe('WritefileStatement', () => {
        it('should write string to file', () => {
            const content = new LiteralExpression({ type: EduBasicType.String, value: 'Test content' });
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'output.txt' });
            const stmt = new WritefileStatement(content, filename);

            const result = stmt.execute(context, graphics, audio, program, runtime);

            expect(result.result).toBe(ExecutionResult.Continue);
            
            const data = fileSystem.readFile('output.txt');
            expect(data).not.toBeNull();
            
            const text = new TextDecoder('utf-8').decode(data!);
            expect(text).toBe('Test content');
        });

        it('should write UTF-8 encoded content', () => {
            const content = new LiteralExpression({ type: EduBasicType.String, value: 'Hello 世界 🌍' });
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'unicode.txt' });
            const stmt = new WritefileStatement(content, filename);

            stmt.execute(context, graphics, audio, program, runtime);

            const data = fileSystem.readFile('unicode.txt');
            const text = new TextDecoder('utf-8').decode(data!);
            expect(text).toBe('Hello 世界 🌍');
        });

        it('should overwrite existing file', () => {
            fileSystem.writeFile('overwrite.txt', new TextEncoder().encode('Old content'));

            const content = new LiteralExpression({ type: EduBasicType.String, value: 'New content' });
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'overwrite.txt' });
            const stmt = new WritefileStatement(content, filename);

            stmt.execute(context, graphics, audio, program, runtime);

            const data = fileSystem.readFile('overwrite.txt');
            const text = new TextDecoder('utf-8').decode(data!);
            expect(text).toBe('New content');
        });

        it('should write empty string', () => {
            const content = new LiteralExpression({ type: EduBasicType.String, value: '' });
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'empty.txt' });
            const stmt = new WritefileStatement(content, filename);

            stmt.execute(context, graphics, audio, program, runtime);

            const data = fileSystem.readFile('empty.txt');
            expect(data?.length).toBe(0);
        });

        it('should throw error for non-string filename', () => {
            const content = new LiteralExpression({ type: EduBasicType.String, value: 'content' });
            const filename = new LiteralExpression({ type: EduBasicType.Integer, value: 42 });
            const stmt = new WritefileStatement(content, filename);

            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('WRITEFILE: filename must be a string');
        });

        it('should throw error for non-string content', () => {
            const content = new LiteralExpression({ type: EduBasicType.Integer, value: 123 });
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'test.txt' });
            const stmt = new WritefileStatement(content, filename);

            expect(() => {
                stmt.execute(context, graphics, audio, program, runtime);
            }).toThrow('WRITEFILE: content must be a string');
        });

        it('should format toString correctly', () => {
            const content = new LiteralExpression({ type: EduBasicType.String, value: 'data' });
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'file.txt' });
            const stmt = new WritefileStatement(content, filename);

            expect(stmt.toString()).toBe('WRITEFILE "data" TO "file.txt"');
        });
    });

    describe('WRITE/READ/SEEK/LINE INPUT Statements', () => {
        it('should write and read a binary integer via file handle', () => {
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'data.bin' });
            const openWrite = new OpenStatement(filename, FileMode.Overwrite, 'fh%');
            openWrite.execute(context, graphics, audio, program, runtime);

            const handleExpr = new VariableExpression('fh%');
            const write = new WriteFileStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 123 }),
                handleExpr
            );
            write.execute(context, graphics, audio, program, runtime);
            new CloseStatement(handleExpr).execute(context, graphics, audio, program, runtime);

            const openRead = new OpenStatement(filename, FileMode.Read, 'rh%');
            openRead.execute(context, graphics, audio, program, runtime);

            const readHandleExpr = new VariableExpression('rh%');
            const read = new ReadFileStatement('value%', readHandleExpr);
            read.execute(context, graphics, audio, program, runtime);

            expect(context.getVariable('value%')).toEqual({ type: EduBasicType.Integer, value: 123 });
        });

        it('should validate SEEK argument types and clamp negative positions', () =>
        {
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'seek2.bin' });
            const openWrite = new OpenStatement(filename, FileMode.Overwrite, 'fh%');
            openWrite.execute(context, graphics, audio, program, runtime);

            const handleExpr = new VariableExpression('fh%');

            const badHandle = new SeekStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 0 }),
                new LiteralExpression({ type: EduBasicType.String, value: 'nope' })
            );
            expect(() =>
            {
                badHandle.execute(context, graphics, audio, program, runtime);
            }).toThrow('SEEK: file handle must be an integer');

            const badPos = new SeekStatement(
                new LiteralExpression({ type: EduBasicType.String, value: 'nope' }),
                handleExpr
            );
            expect(() =>
            {
                badPos.execute(context, graphics, audio, program, runtime);
            }).toThrow('SEEK: position must be a number');

            const seekSpy = jest.spyOn(fileSystem, 'seek');
            const clamp = new SeekStatement(new LiteralExpression({ type: EduBasicType.Integer, value: -5 }), handleExpr);
            clamp.execute(context, graphics, audio, program, runtime);
            expect(seekSpy).toHaveBeenCalledWith(expect.any(Number), 0);
        });

        it('should allow seeking past EOF for writable handles', () => {
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'seek.bin' });
            const openWrite = new OpenStatement(filename, FileMode.Overwrite, 'fh%');
            openWrite.execute(context, graphics, audio, program, runtime);

            const handleExpr = new VariableExpression('fh%');
            const seek = new SeekStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 10 }), handleExpr);
            seek.execute(context, graphics, audio, program, runtime);

            const write = new WriteFileStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                handleExpr
            );
            write.execute(context, graphics, audio, program, runtime);
            new CloseStatement(handleExpr).execute(context, graphics, audio, program, runtime);

            const data = fileSystem.readFile('seek.bin');
            expect(data).not.toBeNull();
            expect(data!.length).toBe(14);
        });

        it('should read multiple scalar types from a file handle', () =>
        {
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'types.bin' });
            const openWrite = new OpenStatement(filename, FileMode.Overwrite, 'fh%');
            openWrite.execute(context, graphics, audio, program, runtime);

            const handleExpr = new VariableExpression('fh%');

            new WriteFileStatement(new LiteralExpression({ type: EduBasicType.Real, value: 3.25 }), handleExpr)
                .execute(context, graphics, audio, program, runtime);

            // WRITE of a scalar string writes text with newline; to exercise READ string (length-prefixed),
            // write the string as an array element so it uses binary string encoding.
            new WriteFileStatement(new LiteralExpression({
                type: EduBasicType.Array,
                elementType: EduBasicType.String,
                value: [{ type: EduBasicType.String, value: 'hi' }]
            } as any), handleExpr).execute(context, graphics, audio, program, runtime);

            new WriteFileStatement(new LiteralExpression({ type: EduBasicType.Complex, value: { real: 1, imaginary: -2 } }), handleExpr)
                .execute(context, graphics, audio, program, runtime);

            new CloseStatement(handleExpr).execute(context, graphics, audio, program, runtime);

            const openRead = new OpenStatement(filename, FileMode.Read, 'rh%');
            openRead.execute(context, graphics, audio, program, runtime);

            const readHandleExpr = new VariableExpression('rh%');

            new ReadFileStatement('r#', readHandleExpr).execute(context, graphics, audio, program, runtime);
            expect(context.getVariable('r#')).toEqual({ type: EduBasicType.Real, value: 3.25 });

            new ReadFileStatement('s$', readHandleExpr).execute(context, graphics, audio, program, runtime);
            expect(context.getVariable('s$')).toEqual({ type: EduBasicType.String, value: 'hi' });

            new ReadFileStatement('z&', readHandleExpr).execute(context, graphics, audio, program, runtime);
            expect(context.getVariable('z&')).toEqual({ type: EduBasicType.Complex, value: { real: 1, imaginary: -2 } });
        });

        it('should throw on READ end-of-file and invalid target types', () =>
        {
            fileSystem.writeFile('empty.bin', new Uint8Array(0));

            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'empty.bin' });
            const openRead = new OpenStatement(filename, FileMode.Read, 'fh%');
            openRead.execute(context, graphics, audio, program, runtime);

            const handleExpr = new VariableExpression('fh%');

            expect(() =>
            {
                new ReadFileStatement('x%', handleExpr).execute(context, graphics, audio, program, runtime);
            }).toThrow('READ: end of file');

            const badHandle = new ReadFileStatement('x%', new LiteralExpression({ type: EduBasicType.String, value: 'nope' }));
            expect(() =>
            {
                badHandle.execute(context, graphics, audio, program, runtime);
            }).toThrow('READ: file handle must be an integer');

            const badTarget = new ReadFileStatement('s', handleExpr);
            expect(() =>
            {
                badTarget.execute(context, graphics, audio, program, runtime);
            }).toThrow('READ: cannot read STRUCTURE values');
        });

        it('should throw when reading into an array variable that is not an array', () =>
        {
            fileSystem.writeFile('ints.bin', new Uint8Array(0));

            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'ints.bin' });
            const openRead = new OpenStatement(filename, FileMode.Read, 'fh%');
            openRead.execute(context, graphics, audio, program, runtime);

            context.setVariable('a%[]', { type: EduBasicType.Integer, value: 0 } as any, false);
            const handleExpr = new VariableExpression('fh%');
            expect(() =>
            {
                new ReadFileStatement('a%[]', handleExpr).execute(context, graphics, audio, program, runtime);
            }).toThrow('READ: a%[] is not an array');
        });

        it('should read text lines (including newline) using LINE INPUT', () => {
            fileSystem.writeFile('lines.txt', new TextEncoder().encode('a\nb\n'));

            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'lines.txt' });
            const openRead = new OpenStatement(filename, FileMode.Read, 'fh%');
            openRead.execute(context, graphics, audio, program, runtime);

            const handleExpr = new VariableExpression('fh%');

            new LineInputStatement('line$', handleExpr).execute(context, graphics, audio, program, runtime);
            expect(context.getVariable('line$').value).toBe('a\n');

            new LineInputStatement('line$', handleExpr).execute(context, graphics, audio, program, runtime);
            expect(context.getVariable('line$').value).toBe('b\n');

            expect(() => {
                new LineInputStatement('line$', handleExpr).execute(context, graphics, audio, program, runtime);
            }).toThrow('LINE INPUT: end of file');
        });
    });

    describe('LISTDIR/MKDIR/RMDIR/COPY/MOVE/DELETE Statements', () => {
        it('should create and remove an empty directory', () => {
            const mkdir = new MkdirStatement(new LiteralExpression({ type: EduBasicType.String, value: 'temp' }));
            mkdir.execute(context, graphics, audio, program, runtime);
            expect(fileSystem.directoryExists('temp')).toBe(true);

            const rmdir = new RmdirStatement(new LiteralExpression({ type: EduBasicType.String, value: 'temp' }));
            rmdir.execute(context, graphics, audio, program, runtime);
            expect(fileSystem.directoryExists('temp')).toBe(false);
        });

        it('should throw for non-string MKDIR path', () =>
        {
            const mkdir = new MkdirStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }));
            expect(() =>
            {
                mkdir.execute(context, graphics, audio, program, runtime);
            }).toThrow('MKDIR: path must be a string');
        });

        it('should throw for non-string RMDIR path', () =>
        {
            const rmdir = new RmdirStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }));
            expect(() =>
            {
                rmdir.execute(context, graphics, audio, program, runtime);
            }).toThrow('RMDIR: path must be a string');
        });

        it('should throw when RMDIR cannot remove a directory', () =>
        {
            const rmdir = new RmdirStatement(new LiteralExpression({ type: EduBasicType.String, value: 'missing-dir' }));
            expect(() =>
            {
                rmdir.execute(context, graphics, audio, program, runtime);
            }).toThrow('RMDIR: could not remove directory: missing-dir');
        });

        it('should list directory entries into a string array', () => {
            fileSystem.createDirectory('dir');
            fileSystem.writeFile('dir/a.txt', new Uint8Array([1]));
            fileSystem.createDirectory('dir/sub');

            const stmt = new ListdirStatement(
                'files$[]',
                new LiteralExpression({ type: EduBasicType.String, value: 'dir' })
            );
            stmt.execute(context, graphics, audio, program, runtime);

            const value = context.getVariable('files$[]');
            expect(value.type).toBe(EduBasicType.Array);
            if (value.type !== EduBasicType.Array)
            {
                return;
            }
            expect(value.elementType).toBe(EduBasicType.String);

            const entries = value.value.map((v) => v.value);
            expect(entries).toEqual(expect.arrayContaining(['a.txt', 'sub']));
        });

        it('LISTDIR should validate destination and path, and reject missing directories', () =>
        {
            const badDest = new ListdirStatement(
                'files$',
                new LiteralExpression({ type: EduBasicType.String, value: '.' })
            );
            expect(() =>
            {
                badDest.execute(context, graphics, audio, program, runtime);
            }).toThrow('LISTDIR: destination must be an array');

            const badPathType = new ListdirStatement(
                'files$[]',
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
            );
            expect(() =>
            {
                badPathType.execute(context, graphics, audio, program, runtime);
            }).toThrow('LISTDIR: path must be a string');

            const missingDir = new ListdirStatement(
                'files$[]',
                new LiteralExpression({ type: EduBasicType.String, value: 'missing' })
            );
            expect(() =>
            {
                missingDir.execute(context, graphics, audio, program, runtime);
            }).toThrow('LISTDIR: directory not found: missing');

            fileSystem.writeFile('a.txt', new Uint8Array([1]));
            const fileAsDir = new ListdirStatement(
                'files$[]',
                new LiteralExpression({ type: EduBasicType.String, value: 'a.txt' })
            );
            expect(() =>
            {
                fileAsDir.execute(context, graphics, audio, program, runtime);
            }).toThrow('LISTDIR: directory not found: a.txt');
        });

        it('should copy, move, and delete files', () => {
            fileSystem.writeFile('src.txt', new TextEncoder().encode('data'));

            new CopyStatement(
                new LiteralExpression({ type: EduBasicType.String, value: 'src.txt' }),
                new LiteralExpression({ type: EduBasicType.String, value: 'dst.txt' })
            ).execute(context, graphics, audio, program, runtime);

            expect(fileSystem.readFile('dst.txt')).not.toBeNull();

            new MoveStatement(
                new LiteralExpression({ type: EduBasicType.String, value: 'dst.txt' }),
                new LiteralExpression({ type: EduBasicType.String, value: 'moved.txt' })
            ).execute(context, graphics, audio, program, runtime);

            expect(fileSystem.readFile('dst.txt')).toBeNull();
            expect(fileSystem.readFile('moved.txt')).not.toBeNull();

            new DeleteStatement(new LiteralExpression({ type: EduBasicType.String, value: 'moved.txt' }))
                .execute(context, graphics, audio, program, runtime);

            expect(fileSystem.readFile('moved.txt')).toBeNull();
        });

        it('MOVE should validate types and error conditions', () =>
        {
            const nonString = new MoveStatement(
                new LiteralExpression({ type: EduBasicType.Integer, value: 1 }),
                new LiteralExpression({ type: EduBasicType.String, value: 'x' })
            );
            expect(() =>
            {
                nonString.execute(context, graphics, audio, program, runtime);
            }).toThrow('MOVE: source and destination must be strings');

            const missing = new MoveStatement(
                new LiteralExpression({ type: EduBasicType.String, value: 'missing.txt' }),
                new LiteralExpression({ type: EduBasicType.String, value: 'dst.txt' })
            );
            expect(() =>
            {
                missing.execute(context, graphics, audio, program, runtime);
            }).toThrow('MOVE: file not found: missing.txt');

            fileSystem.writeFile('src2.txt', new Uint8Array([1]));
            const deleteSpy = jest.spyOn(fileSystem, 'deleteFile').mockReturnValue(false);
            const cannotDelete = new MoveStatement(
                new LiteralExpression({ type: EduBasicType.String, value: 'src2.txt' }),
                new LiteralExpression({ type: EduBasicType.String, value: 'dst2.txt' })
            );
            expect(() =>
            {
                cannotDelete.execute(context, graphics, audio, program, runtime);
            }).toThrow('MOVE: could not delete source: src2.txt');
            deleteSpy.mockRestore();
        });

        it('should throw for non-string DELETE filename', () =>
        {
            const del = new DeleteStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }));
            expect(() =>
            {
                del.execute(context, graphics, audio, program, runtime);
            }).toThrow('DELETE: filename must be a string');
        });

        it('should throw when DELETE file does not exist', () =>
        {
            const del = new DeleteStatement(new LiteralExpression({ type: EduBasicType.String, value: 'missing.txt' }));
            expect(() =>
            {
                del.execute(context, graphics, audio, program, runtime);
            }).toThrow('DELETE: file not found: missing.txt');
        });
    });

    describe('Integration Tests', () => {
        it('should write and read file in sequence', () => {
            const writeContent = new LiteralExpression({ type: EduBasicType.String, value: 'Integration test' });
            const filename = new LiteralExpression({ type: EduBasicType.String, value: 'test.txt' });
            const writeStmt = new WritefileStatement(writeContent, filename);

            writeStmt.execute(context, graphics, audio, program, runtime);

            const readFilename = new LiteralExpression({ type: EduBasicType.String, value: 'test.txt' });
            const readStmt = new ReadfileStatement('result$', readFilename);

            readStmt.execute(context, graphics, audio, program, runtime);

            const result = context.getVariable('result$');
            expect(result.value).toBe('Integration test');
        });

        it('should open, close, and verify file operations', () => {
            const data = new TextEncoder().encode('Test');
            fileSystem.writeFile('file.txt', data);

            const openFilename = new LiteralExpression({ type: EduBasicType.String, value: 'file.txt' });
            const openStmt = new OpenStatement(openFilename, FileMode.Read, 'fh%');

            openStmt.execute(context, graphics, audio, program, runtime);

            const handleValue = context.getVariable('fh%');
            expect(handleValue.type).toBe(EduBasicType.Integer);

            const handleExpr = new VariableExpression('fh%');
            const closeStmt = new CloseStatement(handleExpr);

            const closeResult = closeStmt.execute(context, graphics, audio, program, runtime);
            expect(closeResult.result).toBe(ExecutionResult.Continue);
        });

        it('should handle multiple file operations', () => {
            const write1 = new LiteralExpression({ type: EduBasicType.String, value: 'File 1' });
            const file1 = new LiteralExpression({ type: EduBasicType.String, value: 'file1.txt' });
            new WritefileStatement(write1, file1).execute(context, graphics, audio, program, runtime);

            const write2 = new LiteralExpression({ type: EduBasicType.String, value: 'File 2' });
            const file2 = new LiteralExpression({ type: EduBasicType.String, value: 'file2.txt' });
            new WritefileStatement(write2, file2).execute(context, graphics, audio, program, runtime);

            new ReadfileStatement('content1$', file1).execute(context, graphics, audio, program, runtime);
            new ReadfileStatement('content2$', file2).execute(context, graphics, audio, program, runtime);

            expect(context.getVariable('content1$').value).toBe('File 1');
            expect(context.getVariable('content2$').value).toBe('File 2');
        });
    });
});
