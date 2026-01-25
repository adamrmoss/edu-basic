import { ExecutionContext } from '../src/lang/execution-context';
import { Program } from '../src/lang/program';
import { RuntimeExecution } from '../src/lang/runtime-execution';
import { ExecutionResult } from '../src/lang/statements/statement';
import { EduBasicType } from '../src/lang/edu-basic-value';
import { Graphics } from '../src/lang/graphics';
import { Audio } from '../src/lang/audio';
import { FileSystemService } from '../src/app/files/filesystem.service';

import { CloseStatement, FileMode, OpenStatement, ReadfileStatement, WritefileStatement } from '../src/lang/statements/file-io';

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
