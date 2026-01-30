import { EduBasicType } from '../src/lang/edu-basic-value';
import { LiteralExpression } from '../src/lang/expressions/literal-expression';
import { VariableExpression } from '../src/lang/expressions/special/variable-expression';
import { OpenStatement, FileMode, ReadFileStatement, WriteFileStatement } from '../src/lang/statements/file-io';

import { createRuntimeFixture } from './statements/program-execution-test-fixtures';

describe('File I/O (READ/WRITE by file handle)', () =>
{
    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    it('should WRITE and then READ numeric scalars and arrays', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        const filename = new LiteralExpression({ type: EduBasicType.String, value: 'bin.dat' });
        new OpenStatement(filename, FileMode.Overwrite, 'fh%').execute(context, graphics, audio, program, runtime);
        const fh = new VariableExpression('fh%');

        new WriteFileStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 123 }), fh)
            .execute(context, graphics, audio, program, runtime);

        context.setVariable('nums%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 1 },
                { type: EduBasicType.Integer, value: 2 },
            ],
        } as any, false);

        new WriteFileStatement(new VariableExpression('nums%[]'), fh)
            .execute(context, graphics, audio, program, runtime);

        runtime.getFileSystem().closeFile(context.getVariable('fh%').value as number);

        new OpenStatement(filename, FileMode.Read, 'rh%').execute(context, graphics, audio, program, runtime);
        const rh = new VariableExpression('rh%');

        new ReadFileStatement('x%', rh).execute(context, graphics, audio, program, runtime);
        expect(context.getVariable('x%').value).toBe(123);

        context.setVariable('buf%[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Integer,
            value: [
                { type: EduBasicType.Integer, value: 0 },
                { type: EduBasicType.Integer, value: 0 },
            ],
        } as any, false);

        new ReadFileStatement('buf%[]', rh).execute(context, graphics, audio, program, runtime);
        const buf = context.getVariable('buf%[]');
        expect(buf.type).toBe(EduBasicType.Array);
    });

    it('WRITE should write text strings with newline; READ string should read length-prefixed strings', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        new OpenStatement(new LiteralExpression({ type: EduBasicType.String, value: 't.txt' }), FileMode.Overwrite, 'fh%')
            .execute(context, graphics, audio, program, runtime);
        const fh = context.getVariable('fh%').value as number;

        new WriteFileStatement(new LiteralExpression({ type: EduBasicType.String, value: 'hi' }), new VariableExpression('fh%'))
            .execute(context, graphics, audio, program, runtime);

        runtime.getFileSystem().closeFile(fh);
        const raw = runtime.getFileSystem().readFile('t.txt')!;
        expect(new TextDecoder('utf-8').decode(raw)).toBe('hi\n');

        const encoder = new TextEncoder();
        const payload = encoder.encode('ok');
        const data = new Uint8Array(4 + payload.length);
        const view = new DataView(data.buffer);
        view.setInt32(0, payload.length, true);
        data.set(payload, 4);
        runtime.getFileSystem().writeFile('binstr.dat', data);

        new OpenStatement(new LiteralExpression({ type: EduBasicType.String, value: 'binstr.dat' }), FileMode.Read, 'rh%')
            .execute(context, graphics, audio, program, runtime);

        new ReadFileStatement('s$', new VariableExpression('rh%'))
            .execute(context, graphics, audio, program, runtime);

        expect(context.getVariable('s$').value).toBe('ok');
    });

    it('should validate READ/WRITE error cases', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        const badHandle = new LiteralExpression({ type: EduBasicType.String, value: 'x' });
        expect(() =>
        {
            new ReadFileStatement('x%', badHandle).execute(context, graphics, audio, program, runtime);
        }).toThrow('READ: file handle must be an integer');

        expect(() =>
        {
            new WriteFileStatement(new LiteralExpression({ type: EduBasicType.Integer, value: 1 }), badHandle)
                .execute(context, graphics, audio, program, runtime);
        }).toThrow('WRITE: file handle must be an integer');

        new OpenStatement(new LiteralExpression({ type: EduBasicType.String, value: 'x.bin' }), FileMode.Overwrite, 'fh%')
            .execute(context, graphics, audio, program, runtime);
        const fh = new VariableExpression('fh%');

        expect(() =>
        {
            new ReadFileStatement('obj', fh).execute(context, graphics, audio, program, runtime);
        }).toThrow('READ: cannot read STRUCTURE values');

        expect(() =>
        {
            new WriteFileStatement(new LiteralExpression({ type: EduBasicType.Structure, value: new Map() } as any), fh)
                .execute(context, graphics, audio, program, runtime);
        }).toThrow('WRITE: cannot write STRUCTURE values');
    });

    it('WRITE should support nested arrays and binary string elements', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        new OpenStatement(new LiteralExpression({ type: EduBasicType.String, value: 'nested.bin' }), FileMode.Overwrite, 'fh%')
            .execute(context, graphics, audio, program, runtime);
        const fhExpr = new VariableExpression('fh%');

        context.setVariable('nested[]', {
            type: EduBasicType.Array,
            elementType: EduBasicType.Array,
            value: [
                {
                    type: EduBasicType.Array,
                    elementType: EduBasicType.String,
                    value: [{ type: EduBasicType.String, value: 'ok' }],
                },
            ],
        } as any, false);

        new WriteFileStatement(new VariableExpression('nested[]'), fhExpr)
            .execute(context, graphics, audio, program, runtime);

        runtime.getFileSystem().closeFile(context.getVariable('fh%').value as number);
        const bytes = runtime.getFileSystem().readFile('nested.bin')!;

        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        expect(view.getInt32(0, true)).toBe(2);
    });

    it('READ should handle EOF and validate array destination types', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        const data = new Uint8Array([1, 2, 3]);
        runtime.getFileSystem().writeFile('short.bin', data);

        new OpenStatement(new LiteralExpression({ type: EduBasicType.String, value: 'short.bin' }), FileMode.Read, 'fh%')
            .execute(context, graphics, audio, program, runtime);

        expect(() =>
        {
            new ReadFileStatement('x%', new VariableExpression('fh%'))
                .execute(context, graphics, audio, program, runtime);
        }).toThrow('READ: end of file');

        new OpenStatement(new LiteralExpression({ type: EduBasicType.String, value: 'short.bin' }), FileMode.Read, 'fh2%')
            .execute(context, graphics, audio, program, runtime);
        context.setVariable('arr%[]', { type: EduBasicType.Integer, value: 0 } as any, false);

        expect(() =>
        {
            new ReadFileStatement('arr%[]', new VariableExpression('fh2%'))
                .execute(context, graphics, audio, program, runtime);
        }).toThrow('READ: arr%[] is not an array');
    });

    it('WRITE should write real and complex values in binary', () =>
    {
        const { context, program, graphics, audio, runtime, fileSystem } = createRuntimeFixture();
        fileSystem.clear();

        new OpenStatement(new LiteralExpression({ type: EduBasicType.String, value: 'nums.bin' }), FileMode.Overwrite, 'fh%')
            .execute(context, graphics, audio, program, runtime);

        new WriteFileStatement(new LiteralExpression({ type: EduBasicType.Real, value: 1.5 }), new VariableExpression('fh%'))
            .execute(context, graphics, audio, program, runtime);

        new WriteFileStatement(new LiteralExpression({ type: EduBasicType.Complex, value: { real: 2, imaginary: 3 } } as any), new VariableExpression('fh%'))
            .execute(context, graphics, audio, program, runtime);

        runtime.getFileSystem().closeFile(context.getVariable('fh%').value as number);

        const bytes = runtime.getFileSystem().readFile('nums.bin')!;
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

        expect(view.getFloat64(0, true)).toBe(1.5);
        expect(view.getFloat64(8, true)).toBe(2);
        expect(view.getFloat64(16, true)).toBe(3);
    });
});

