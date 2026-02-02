import { Injectable } from '@angular/core';
import { FileSystemNode, FileNode, DirectoryNode } from './filesystem-node';

/**
 * Open file handle metadata for the virtual filesystem.
 */
export interface FileHandle
{
    /**
     * File path for this handle.
     */
    path: string;

    /**
     * Open mode for the handle.
     */
    mode: 'read' | 'write' | 'append';

    /**
     * Current cursor position in bytes.
     */
    position: number;

    /**
     * In-memory buffer for this handle.
     */
    buffer: Uint8Array;
}

/**
 * In-memory hierarchical file system used by the app and language runtime.
 *
 * Features:
 * - Directory and file nodes rooted at a single `DirectoryNode`.
 * - Byte-oriented file read/write APIs for disk + interpreter statements.
 * - Simple open-handle model (`openFile`, `readBytes`, `writeBytes`, `seek`, `tell`, `eof`, `closeFile`).
 *
 * This is intentionally not backed by the host OS filesystem; it is a virtual filesystem that can be
 * saved/loaded via `DiskService`.
 */
@Injectable({
    providedIn: 'root'
})
export class FileSystemService
{
    private root: DirectoryNode;
    private openHandles: Map<number, FileHandle> = new Map();
    private nextHandleId: number = 1;

    /**
     * Create a new empty virtual filesystem.
     */
    public constructor()
    {
        this.root = new DirectoryNode('', '');
    }

    /**
     * Remove all files/directories and reset open-handle state.
     */
    public clear(): void
    {
        this.root = new DirectoryNode('', '');
        this.openHandles.clear();
        this.nextHandleId = 1;
    }

    /**
     * Get the root directory node.
     */
    public getRoot(): DirectoryNode
    {
        return this.root;
    }

    private findNode(path: string): FileSystemNode | null
    {
        if (!path)
        {
            return this.root;
        }

        const parts = path.split('/').filter(p => p.length > 0);
        let current: FileSystemNode = this.root;

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

        return current;
    }

    private findParentDirectory(path: string): DirectoryNode | null
    {
        if (!path)
        {
            return this.root;
        }

        const lastSlash = path.lastIndexOf('/');

        if (lastSlash === -1)
        {
            return this.root;
        }

        const parentPath = path.substring(0, lastSlash);
        const node = this.findNode(parentPath);

        if (node && node.type === 'directory')
        {
            return node as DirectoryNode;
        }

        return null;
    }

    /**
     * Determine whether a file exists at the provided path.
     *
     * @param path File path.
     */
    public fileExists(path: string): boolean
    {
        const node = this.findNode(path);
        return node !== null && node.type === 'file';
    }

    /**
     * Determine whether a directory exists at the provided path.
     *
     * @param path Directory path.
     */
    public directoryExists(path: string): boolean
    {
        const node = this.findNode(path);
        return node !== null && node.type === 'directory';
    }

    /**
     * Read a file from the virtual filesystem.
     *
     * @param path File path.
     * @returns File contents, or `null` if the file does not exist.
     */
    public readFile(path: string): Uint8Array | null
    {
        const node = this.findNode(path);

        if (node && node.type === 'file')
        {
            return node.data;
        }

        return null;
    }

    /**
     * Write a file into the virtual filesystem, creating it if necessary.
     *
     * @param path File path.
     * @param data File contents.
     */
    public writeFile(path: string, data: Uint8Array): void
    {
        if (!path)
        {
            return;
        }

        const existing = this.findNode(path);

        if (existing)
        {
            if (existing.type === 'file')
            {
                existing.data = data;
            }
        }
        else
        {
            const parts = path.split('/').filter(p => p.length > 0);
            const fileName = parts[parts.length - 1];
            const parentPath = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
            const parent = this.findParentDirectory(path) || this.ensureDirectory(parentPath);

            if (parent)
            {
                const fileNode = new FileNode(fileName, path, data);
                parent.addChild(fileNode);
            }
        }
    }

    /**
     * Delete a file from the virtual filesystem.
     *
     * @param path File path.
     * @returns `true` when deletion succeeds.
     */
    public deleteFile(path: string): boolean
    {
        if (!path)
        {
            return false;
        }

        const parts = path.split('/').filter(p => p.length > 0);
        const fileName = parts[parts.length - 1];
        const parentPath = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
        const parent = this.findParentDirectory(path);

        if (parent)
        {
            return parent.removeChild(fileName);
        }

        return false;
    }

    /**
     * Create a directory path (and any missing parent directories).
     *
     * @param path Directory path.
     */
    public createDirectory(path: string): void
    {
        if (!path)
        {
            return;
        }

        this.ensureDirectory(path);
    }

    private ensureDirectory(path: string): DirectoryNode | null
    {
        if (!path)
        {
            return this.root;
        }

        const existing = this.findNode(path);

        if (existing)
        {
            if (existing.type === 'directory')
            {
                return existing as DirectoryNode;
            }

            return null;
        }

        const parts = path.split('/').filter(p => p.length > 0);
        let current: DirectoryNode = this.root;

        for (const part of parts)
        {
            let child = current.getChild(part);

            if (!child)
            {
                const dirPath = current.path ? `${current.path}/${part}` : part;
                child = new DirectoryNode(part, dirPath);
                current.addChild(child);
            }

            if (child.type !== 'directory')
            {
                return null;
            }

            current = child as DirectoryNode;
        }

        return current;
    }

    /**
     * Delete an empty directory.
     *
     * @param path Directory path.
     * @returns `true` when deletion succeeds.
     */
    public deleteDirectory(path: string): boolean
    {
        if (!path)
        {
            return false;
        }

        const node = this.findNode(path);

        if (!node || node.type !== 'directory')
        {
            return false;
        }

        const dir = node as DirectoryNode;

        if (dir.hasChildren)
        {
            return false;
        }

        const parts = path.split('/').filter(p => p.length > 0);
        const dirName = parts[parts.length - 1];
        const parentPath = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
        const parent = this.findParentDirectory(path);

        if (parent)
        {
            return parent.removeChild(dirName);
        }

        return false;
    }

    /**
     * Move/rename a directory.
     *
     * @param oldPath Existing directory path.
     * @param newPath New directory path.
     * @returns `true` when rename succeeds.
     */
    public renameDirectory(oldPath: string, newPath: string): boolean
    {
        if (!oldPath || !newPath)
        {
            return false;
        }

        const node = this.findNode(oldPath);

        if (!node || node.type !== 'directory')
        {
            return false;
        }

        const dir = node as DirectoryNode;
        const oldParent = this.findParentDirectory(oldPath);
        const newParentPath = this.getParentPath(newPath);
        const newParent = newParentPath ? this.findNode(newParentPath) : this.root;

        if (!newParent || newParent.type !== 'directory')
        {
            return false;
        }

        return dir.moveTo(oldParent, newParent as DirectoryNode);
    }

    private getParentPath(path: string): string
    {
        const lastSlash = path.lastIndexOf('/');

        if (lastSlash === -1)
        {
            return '';
        }

        return path.substring(0, lastSlash);
    }

    /**
     * List all file paths in the virtual filesystem.
     */
    public listFiles(): string[]
    {
        const files: string[] = [];
        this.collectFilePaths(this.root, files);
        return files;
    }

    private collectFilePaths(node: FileSystemNode, files: string[]): void
    {
        if (node.type === 'file')
        {
            files.push(node.path);
        }
        else
        {
            const dir = node as DirectoryNode;

            for (const child of dir.children.values())
            {
                this.collectFilePaths(child, files);
            }
        }
    }

    /**
     * Collect all file contents into a map keyed by path.
     */
    public getAllFiles(): Map<string, Uint8Array>
    {
        const files = new Map<string, Uint8Array>();
        this.collectFiles(this.root, files);
        return files;
    }

    private collectFiles(node: FileSystemNode, files: Map<string, Uint8Array>): void
    {
        if (node.type === 'file')
        {
            files.set(node.path, node.data!);
        }
        else
        {
            const dir = node as DirectoryNode;

            for (const child of dir.children.values())
            {
                this.collectFiles(child, files);
            }
        }
    }

    /**
     * Replace filesystem contents with the provided file map.
     *
     * @param fileMap Map of file path to contents.
     */
    public setAllFiles(fileMap: Map<string, Uint8Array>): void
    {
        this.root = new DirectoryNode('', '');

        for (const [path, data] of fileMap.entries())
        {
            this.writeFile(path, data);
        }
    }

    /**
     * Open a file handle in the requested mode.
     *
     * @param path File path.
     * @param mode Open mode.
     * @returns New handle id.
     */
    public openFile(path: string, mode: 'read' | 'write' | 'append'): number
    {
        const handleId = this.nextHandleId++;

        let buffer: Uint8Array;

        if (mode === 'read')
        {
            const existingFile = this.readFile(path);
            
            if (!existingFile)
            {
                throw new Error(`File not found: ${path}`);
            }
            
            buffer = existingFile;
        }
        else if (mode === 'write')
        {
            buffer = new Uint8Array(0);
        }
        else
        {
            const existingFile = this.readFile(path);
            buffer = existingFile ? new Uint8Array(existingFile) : new Uint8Array(0);
        }

        const handle: FileHandle = {
            path,
            mode,
            position: mode === 'append' ? buffer.length : 0,
            buffer
        };

        this.openHandles.set(handleId, handle);
        return handleId;
    }

    /**
     * Close an open file handle.
     *
     * If the handle was opened for write/append, the current buffer is persisted to the file path.
     *
     * @param handleId Handle id returned from `openFile(...)`.
     */
    public closeFile(handleId: number): void
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        if (handle.mode === 'write' || handle.mode === 'append')
        {
            this.writeFile(handle.path, handle.buffer);
        }

        this.openHandles.delete(handleId);
    }

    /**
     * Read bytes from an open file handle.
     *
     * @param handleId Handle id.
     * @param count Maximum number of bytes to read.
     * @returns The bytes read (may be shorter than `count` at EOF).
     */
    public readBytes(handleId: number, count: number): Uint8Array
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        if (handle.mode !== 'read')
        {
            throw new Error(`File not opened for reading: ${handle.path}`);
        }

        const bytesToRead = Math.min(count, handle.buffer.length - handle.position);
        const result = handle.buffer.slice(handle.position, handle.position + bytesToRead);
        handle.position += bytesToRead;

        return result;
    }

    /**
     * Write bytes to an open file handle.
     *
     * @param handleId Handle id.
     * @param data Bytes to append at the current cursor position.
     */
    public writeBytes(handleId: number, data: Uint8Array): void
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        if (handle.mode === 'read')
        {
            throw new Error(`File not opened for writing: ${handle.path}`);
        }

        const newBuffer = new Uint8Array(handle.position + data.length);
        newBuffer.set(handle.buffer.slice(0, handle.position), 0);
        newBuffer.set(data, handle.position);
        handle.buffer = newBuffer;
        handle.position += data.length;
    }

    /**
     * Seek the cursor within an open file handle.
     *
     * @param handleId Handle id.
     * @param position Target cursor position.
     */
    public seek(handleId: number, position: number): void
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        const pos = Math.max(0, Math.floor(position));

        if (handle.mode === 'read')
        {
            handle.position = Math.min(pos, handle.buffer.length);
            return;
        }

        handle.position = pos;
    }

    /**
     * Get the current cursor position for an open file handle.
     *
     * @param handleId Handle id.
     */
    public tell(handleId: number): number
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        return handle.position;
    }

    /**
     * Determine whether the cursor is at or past EOF for an open file handle.
     *
     * @param handleId Handle id.
     */
    public eof(handleId: number): boolean
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        return handle.position >= handle.buffer.length;
    }

    /**
     * Get the current file size (in bytes) for an open file handle.
     *
     * @param handleId Handle id.
     */
    public getFileSize(handleId: number): number
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        return handle.buffer.length;
    }
}
