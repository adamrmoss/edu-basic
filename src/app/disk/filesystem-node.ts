export abstract class FileSystemNode
{
    public abstract readonly name: string;
    public abstract readonly path: string;
    public abstract readonly type: 'file' | 'directory';

    public abstract get data(): Uint8Array | null;
    public abstract set data(value: Uint8Array);
    public abstract delete(): boolean;
}

export class FileNode extends FileSystemNode
{
    public readonly type: 'file' = 'file';
    private _data: Uint8Array;

    public constructor(
        public readonly name: string,
        public readonly path: string,
        data: Uint8Array = new Uint8Array(0)
    )
    {
        super();
        this._data = data;
    }

    public get data(): Uint8Array
    {
        return this._data;
    }

    public set data(value: Uint8Array)
    {
        this._data = value;
    }

    public delete(): boolean
    {
        return true;
    }
}

export class DirectoryNode extends FileSystemNode
{
    public readonly type: 'directory' = 'directory';
    private _children: Map<string, FileSystemNode> = new Map();

    public constructor(
        public readonly name: string,
        public readonly path: string
    )
    {
        super();
    }

    public get children(): Map<string, FileSystemNode>
    {
        return this._children;
    }

    public get hasChildren(): boolean
    {
        return this._children.size > 0;
    }

    public get data(): null
    {
        return null;
    }

    public set data(value: Uint8Array)
    {
    }

    public getChild(name: string): FileSystemNode | undefined
    {
        return this._children.get(name);
    }

    public addChild(node: FileSystemNode): void
    {
        this._children.set(node.name, node);
    }

    public removeChild(name: string): boolean
    {
        return this._children.delete(name);
    }

    public delete(): boolean
    {
        return this._children.size === 0;
    }
}
