export abstract class FileSystemNode
{
    public abstract readonly name: string;
    public abstract path: string;
    public abstract readonly type: 'file' | 'directory';

    public abstract get data(): Uint8Array | null;
    public abstract set data(value: Uint8Array);
    public abstract delete(): boolean;
}

export class FileNode extends FileSystemNode
{
    public readonly type: 'file' = 'file';
    private _data: Uint8Array;
    private _path: string;

    public constructor(
        public readonly name: string,
        path: string,
        data: Uint8Array = new Uint8Array(0)
    )
    {
        super();
        this._data = data;
        this._path = path;
    }

    public get path(): string
    {
        return this._path;
    }

    public set path(value: string)
    {
        this._path = value;
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
    private _path: string;

    public constructor(
        public readonly name: string,
        path: string
    )
    {
        super();
        this._path = path;
    }

    public get path(): string
    {
        return this._path;
    }

    public set path(value: string)
    {
        this._path = value;
        this.updateChildrenPaths();
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

    private updateChildrenPaths(): void
    {
        for (const child of this._children.values())
        {
            const newChildPath = this._path ? `${this._path}/${child.name}` : child.name;
            child.path = newChildPath;
        }
    }

    public moveTo(oldParent: DirectoryNode | null, newParent: DirectoryNode): boolean
    {
        if (newParent === this)
        {
            return false;
        }

        const oldPath = this._path;
        const newPath = newParent._path ? `${newParent._path}/${this.name}` : this.name;

        if (newPath.startsWith(oldPath + '/'))
        {
            return false;
        }

        if (oldParent)
        {
            oldParent.removeChild(this.name);
        }

        this._path = newPath;
        this.updateChildrenPaths();
        newParent.addChild(this);
        
        return true;
    }
}
