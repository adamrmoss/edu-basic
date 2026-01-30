import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { DirectoryNode, FileSystemNode } from '../../../app/disk/filesystem-node';

export class ListdirStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly path: Expression
    )
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        if (!this.arrayVariable.endsWith('[]'))
        {
            throw new Error('LISTDIR: destination must be an array');
        }

        const pathValue = this.path.evaluate(context);
        if (pathValue.type !== EduBasicType.String)
        {
            throw new Error('LISTDIR: path must be a string');
        }

        const path = pathValue.value as string;
        const fileSystem = runtime.getFileSystem();
        const dir = ListdirStatement.findDirectory(fileSystem.getRoot(), path);
        if (!dir)
        {
            throw new Error(`LISTDIR: directory not found: ${path}`);
        }

        const entries: EduBasicValue[] = [];
        for (const child of dir.children.values())
        {
            entries.push({ type: EduBasicType.String, value: child.name });
        }

        context.setVariable(this.arrayVariable, { type: EduBasicType.Array, value: entries, elementType: EduBasicType.String }, false);
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `LISTDIR ${this.arrayVariable} FROM ${this.path.toString()}`;
    }

    private static findDirectory(root: DirectoryNode, path: string): DirectoryNode | null
    {
        const normalized = (path || '').trim();

        if (!normalized || normalized === '.')
        {
            return root;
        }

        const parts = normalized.split('/').filter(p => p.length > 0 && p !== '.');
        let current: FileSystemNode = root;

        for (const part of parts)
        {
            if (current.type !== 'directory')
            {
                return null;
            }

            const dir = current as DirectoryNode;
            const child = dir.getChild(part);
            if (!child)
            {
                return null;
            }

            current = child;
        }

        if (current.type !== 'directory')
        {
            return null;
        }

        return current as DirectoryNode;
    }
}
