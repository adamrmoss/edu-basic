import { Injectable } from '@angular/core';

export interface FileHandle
{
    path: string;
    mode: 'read' | 'write' | 'append';
    position: number;
    buffer: Uint8Array;
}

@Injectable({
    providedIn: 'root'
})
export class FileSystemService
{
    private files: Map<string, Uint8Array> = new Map();
    private openHandles: Map<number, FileHandle> = new Map();
    private nextHandleId: number = 1;

    public constructor()
    {
    }

    public clear(): void
    {
        this.files.clear();
        this.openHandles.clear();
        this.nextHandleId = 1;
    }

    public fileExists(path: string): boolean
    {
        return this.files.has(path);
    }

    public readFile(path: string): Uint8Array | null
    {
        return this.files.get(path) ?? null;
    }

    public writeFile(path: string, data: Uint8Array): void
    {
        this.files.set(path, data);
    }

    public deleteFile(path: string): boolean
    {
        return this.files.delete(path);
    }

    public listFiles(): string[]
    {
        return Array.from(this.files.keys());
    }

    public getAllFiles(): Map<string, Uint8Array>
    {
        return new Map(this.files);
    }

    public setAllFiles(files: Map<string, Uint8Array>): void
    {
        this.files.clear();
        
        for (const [path, data] of files.entries())
        {
            this.files.set(path, data);
        }
    }

    public openFile(path: string, mode: 'read' | 'write' | 'append'): number
    {
        const handleId = this.nextHandleId++;

        let buffer: Uint8Array;

        if (mode === 'read')
        {
            const existingFile = this.files.get(path);
            
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
            const existingFile = this.files.get(path);
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

    public closeFile(handleId: number): void
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        if (handle.mode === 'write' || handle.mode === 'append')
        {
            this.files.set(handle.path, handle.buffer);
        }

        this.openHandles.delete(handleId);
    }

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

    public seek(handleId: number, position: number): void
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        handle.position = Math.max(0, Math.min(position, handle.buffer.length));
    }

    public tell(handleId: number): number
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        return handle.position;
    }

    public eof(handleId: number): boolean
    {
        const handle = this.openHandles.get(handleId);
        
        if (!handle)
        {
            throw new Error(`Invalid file handle: ${handleId}`);
        }

        return handle.position >= handle.buffer.length;
    }

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
