/**
 * Base type for nodes in the in-memory virtual filesystem.
 */
export abstract class FileSystemNode
{
    /**
     * Node name (path segment, not including parent directories).
     */
    public abstract readonly name: string;

    /**
     * Full path to this node, relative to the filesystem root.
     */
    public abstract path: string;

    /**
     * Discriminator for node kind.
     */
    public abstract readonly type: 'file' | 'directory';

    /**
     * File contents for file nodes, or `null` for directory nodes.
     */
    public abstract get data(): Uint8Array | null;

    /**
     * Update file contents for file nodes.
     */
    public abstract set data(value: Uint8Array);

    /**
     * Delete this node, if allowed by the owning filesystem.
     */
    public abstract delete(): boolean;
}

/**
 * Leaf filesystem node representing a file.
 */
export class FileNode extends FileSystemNode
{
    /**
     * Discriminator for file nodes.
     */
    public readonly type: 'file' = 'file';
    private _data: Uint8Array;
    private _path: string;

    /**
     * Create a new file node.
     *
     * @param name File name (path segment).
     * @param path Full path (relative to root).
     * @param data Initial file contents.
     */
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

    /**
     * Full path to this file (relative to root).
     */
    public get path(): string
    {
        return this._path;
    }

    /**
     * Update the file path (relative to root).
     */
    public set path(value: string)
    {
        this._path = value;
    }

    /**
     * File contents.
     */
    public get data(): Uint8Array
    {
        return this._data;
    }

    /**
     * Update file contents.
     */
    public set data(value: Uint8Array)
    {
        this._data = value;
    }

    /**
     * Delete this node.
     *
     * Note: actual deletion is handled by `FileSystemService`.
     */
    public delete(): boolean
    {
        return true;
    }
}

/**
 * Filesystem node representing a directory containing child nodes.
 */
export class DirectoryNode extends FileSystemNode
{
    /**
     * Discriminator for directory nodes.
     */
    public readonly type: 'directory' = 'directory';
    private _children: Map<string, FileSystemNode> = new Map();
    private _path: string;

    /**
     * Create a new directory node.
     *
     * @param name Directory name (path segment).
     * @param path Full path (relative to root).
     */
    public constructor(
        public readonly name: string,
        path: string
    )
    {
        super();
        this._path = path;
    }

    /**
     * Full path to this directory (relative to root).
     */
    public get path(): string
    {
        return this._path;
    }

    /**
     * Update the directory path and recursively update child paths.
     */
    public set path(value: string)
    {
        this._path = value;
        this.updateChildrenPaths();
    }

    /**
     * Map of child name to node.
     */
    public get children(): Map<string, FileSystemNode>
    {
        return this._children;
    }

    /**
     * Whether this directory currently contains any child nodes.
     */
    public get hasChildren(): boolean
    {
        return this._children.size > 0;
    }

    /**
     * Directories do not have file contents.
     */
    public get data(): null
    {
        return null;
    }

    /**
     * Directories ignore attempts to set file contents.
     */
    public set data(value: Uint8Array)
    {
    }

    /**
     * Get a direct child node by name.
     *
     * @param name Child node name.
     * @returns The child node, if present.
     */
    public getChild(name: string): FileSystemNode | undefined
    {
        return this._children.get(name);
    }

    /**
     * Add a child node to this directory.
     *
     * @param node Child node to add.
     */
    public addChild(node: FileSystemNode): void
    {
        this._children.set(node.name, node);
    }

    /**
     * Remove a child node from this directory.
     *
     * @param name Child node name.
     * @returns `true` when a child was removed.
     */
    public removeChild(name: string): boolean
    {
        return this._children.delete(name);
    }

    /**
     * Delete this directory if it is empty.
     */
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

    /**
     * Move this directory between parents and update paths recursively.
     *
     * @param oldParent Current parent, if any.
     * @param newParent New parent directory.
     * @returns `true` when the move succeeds.
     */
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
