import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import JSZip from 'jszip';
import { FileSystemService } from './filesystem.service';
import { DirectoryNode } from './filesystem-node';

/**
 * Manages the in-browser “disk” abstraction (a zip-backed virtual file system).
 *
 * Responsibilities:
 * - Tracks disk name and the current program text.
 * - Persists program text into the in-memory `FileSystemService`.
 * - Saves/loads `.disk` files as a zip archive via `JSZip`.
 * - Emits change notifications used by UI components (program editor, file tree).
 */
@Injectable({
    providedIn: 'root'
})
export class DiskService
{
    private static readonly INTERNAL_PROGRAM_PATH = 'program.bas';
    private static readonly DISK_PROGRAM_PATH = 'Program.bas';

    private readonly diskNameSubject = new BehaviorSubject<string>('Untitled');
    private readonly programCodeSubject = new BehaviorSubject<string>('');
    private readonly filesChangedSubject = new BehaviorSubject<void>(undefined);

    /**
     * Observable stream of disk name changes.
     */
    public readonly diskName$: Observable<string> = this.diskNameSubject.asObservable();

    /**
     * Observable stream of program code changes.
     */
    public readonly programCode$: Observable<string> = this.programCodeSubject.asObservable();

    /**
     * Observable stream emitting when files change.
     */
    public readonly filesChanged$: Observable<void> = this.filesChangedSubject.asObservable();

    /**
     * Create a new disk service.
     *
     * @param fileSystemService In-memory filesystem used for file operations.
     */
    constructor(private readonly fileSystemService: FileSystemService)
    {
    }

    /**
     * Current disk name.
     */
    public get diskName(): string
    {
        return this.diskNameSubject.value;
    }

    /**
     * Update the disk name.
     */
    public set diskName(name: string)
    {
        this.diskNameSubject.next(name);
    }

    /**
     * Current program code text.
     */
    public get programCode(): string
    {
        return this.programCodeSubject.value;
    }

    /**
     * Update the program code and persist it to the internal program file.
     */
    public set programCode(code: string)
    {
        this.programCodeSubject.next(code);
        const encoder = new TextEncoder();
        const data = encoder.encode(code);
        this.fileSystemService.writeFile(DiskService.INTERNAL_PROGRAM_PATH, data);
        this.filesChangedSubject.next();
    }

    /**
     * Create a new empty disk and reset the virtual file system.
     *
     * @param name New disk name.
     */
    public newDisk(name: string = 'Untitled'): void
    {
        this.diskNameSubject.next(name);
        this.programCodeSubject.next('');
        this.fileSystemService.clear();
        const encoder = new TextEncoder();
        const data = encoder.encode('');
        this.fileSystemService.writeFile(DiskService.INTERNAL_PROGRAM_PATH, data);
        this.filesChangedSubject.next();
    }

    /**
     * Save the current disk as a `.disk` zip archive.
     */
    public async saveDisk(): Promise<void>
    {
        const zip = new JSZip();
        const files = this.fileSystemService.getAllFiles();
        
        for (const [path, data] of files.entries())
        {
            const buffer = new Uint8Array(data).buffer;
            zip.file(this.toDiskPath(path), buffer);
        }

        const blob = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.diskNameSubject.value}.disk`;
        link.click();

        URL.revokeObjectURL(link.href);
    }

    /**
     * Load a `.disk` zip archive into the virtual file system.
     *
     * @param file Disk file selected by the user.
     */
    public async loadDisk(file: File): Promise<void>
    {
        const zip = await JSZip.loadAsync(file);
        const fileName = file.name.replace(/\.disk$/i, '');
        this.diskNameSubject.next(fileName);

        this.fileSystemService.clear();
        
        const fileEntries: Array<[string, any]> = [];
        
        zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir)
            {
                fileEntries.push([relativePath, zipEntry]);
            }
        });

        const programCandidates = fileEntries.filter(([p]) => p.toLowerCase() === DiskService.INTERNAL_PROGRAM_PATH);
        const otherEntries = fileEntries.filter(([p]) => p.toLowerCase() !== DiskService.INTERNAL_PROGRAM_PATH);

        // Write non-program files first; then resolve program file (prefer Program.bas, else first candidate).
        for (const [relativePath, zipEntry] of otherEntries)
        {
            const data = await zipEntry.async('uint8array');
            this.fileSystemService.writeFile(relativePath, data);
        }

        const canonicalProgram = programCandidates.find(([p]) => p === DiskService.DISK_PROGRAM_PATH);
        const fallbackProgram = canonicalProgram ?? programCandidates[0] ?? null;
        if (fallbackProgram)
        {
            const data = await fallbackProgram[1].async('uint8array');
            this.fileSystemService.writeFile(DiskService.INTERNAL_PROGRAM_PATH, data);
        }

        const programFileData = this.fileSystemService.readFile(DiskService.INTERNAL_PROGRAM_PATH);
        let programText = '';
        
        if (programFileData)
        {
            const decoder = new TextDecoder('utf-8');
            programText = decoder.decode(programFileData);
        }
        
        this.programCodeSubject.next(programText);
        this.filesChangedSubject.next();
    }

    /**
     * Get a flat list of all file paths in the virtual disk.
     */
    public getFileList(): string[]
    {
        this.ensureProgramBasExists();
        return this.fileSystemService.listFiles();
    }

    /**
     * Get the root directory node for the virtual disk.
     */
    public getFileSystemRoot(): DirectoryNode
    {
        this.ensureProgramBasExists();
        return this.fileSystemService.getRoot();
    }

    private ensureProgramBasExists(): void
    {
        if (!this.fileSystemService.fileExists(DiskService.INTERNAL_PROGRAM_PATH))
        {
            const encoder = new TextEncoder();
            const code = this.programCodeSubject.value;
            const data = encoder.encode(code);
            this.fileSystemService.writeFile(DiskService.INTERNAL_PROGRAM_PATH, data);
        }
    }

    /**
     * Read a file from the virtual disk.
     *
     * @param path File path.
     * @returns File data, or `null` if the file does not exist.
     */
    public getFile(path: string): Uint8Array | null
    {
        return this.fileSystemService.readFile(path);
    }

    /**
     * Read the current program source text from `program.bas`.
     */
    public getProgramCodeFromFile(): string
    {
        this.ensureProgramBasExists();
        const fileData = this.fileSystemService.readFile(DiskService.INTERNAL_PROGRAM_PATH);
        
        if (fileData)
        {
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(fileData);
        }
        
        return '';
    }

    /**
     * Write a file to the virtual disk and emit change notifications.
     *
     * @param path File path.
     * @param data File contents.
     */
    public saveFile(path: string, data: Uint8Array): void
    {
        this.fileSystemService.writeFile(path, data);
        
        if (path === DiskService.INTERNAL_PROGRAM_PATH)
        {
            const decoder = new TextDecoder('utf-8');
            const code = decoder.decode(data);
            this.programCodeSubject.next(code);
        }
        
        this.filesChangedSubject.next();
    }

    /**
     * Delete a file from the virtual disk.
     *
     * The internal `program.bas` file cannot be deleted.
     *
     * @param path File path.
     */
    public deleteFile(path: string): void
    {
        if (path === DiskService.INTERNAL_PROGRAM_PATH)
        {
            return;
        }
        
        this.fileSystemService.deleteFile(path);
        this.filesChangedSubject.next();
    }

    /**
     * Create a new empty file in the virtual disk.
     *
     * @param path File path.
     */
    public createFile(path: string): void
    {
        this.fileSystemService.writeFile(path, new Uint8Array(0));
        this.filesChangedSubject.next();
    }

    /**
     * Create a new directory in the virtual disk.
     *
     * @param path Directory path.
     */
    public createDirectory(path: string): void
    {
        this.fileSystemService.createDirectory(path);
        this.filesChangedSubject.next();
    }

    /**
     * Delete a directory from the virtual disk.
     *
     * @param path Directory path.
     * @returns `true` when deletion succeeds.
     */
    public deleteDirectory(path: string): boolean
    {
        const deleted = this.fileSystemService.deleteDirectory(path);
        
        if (deleted)
        {
            this.filesChangedSubject.next();
        }
        
        return deleted;
    }

    /**
     * Rename a file in the virtual disk.
     *
     * The internal `program.bas` file cannot be renamed.
     *
     * @param oldPath Existing file path.
     * @param newPath New file path.
     * @returns `true` when rename succeeds.
     */
    public renameFile(oldPath: string, newPath: string): boolean
    {
        if (oldPath === DiskService.INTERNAL_PROGRAM_PATH)
        {
            return false;
        }
        
        const data = this.fileSystemService.readFile(oldPath);
        
        if (!data)
        {
            return false;
        }
        
        this.fileSystemService.writeFile(newPath, data);
        this.fileSystemService.deleteFile(oldPath);
        this.filesChangedSubject.next();
        return true;
    }

    /**
     * Rename a directory in the virtual disk.
     *
     * @param oldPath Existing directory path.
     * @param newPath New directory path.
     * @returns `true` when rename succeeds.
     */
    public renameDirectory(oldPath: string, newPath: string): boolean
    {
        const result = this.fileSystemService.renameDirectory(oldPath, newPath);
        
        if (result)
        {
            this.filesChangedSubject.next();
        }
        
        return result;
    }

    /**
     * Determine whether a path exists and is a directory.
     *
     * @param path Path to check.
     * @returns `true` when the path exists as a directory.
     */
    public isDirectory(path: string): boolean
    {
        return this.fileSystemService.directoryExists(path);
    }

    private toDiskPath(path: string): string
    {
        if (path === DiskService.INTERNAL_PROGRAM_PATH)
        {
            return DiskService.DISK_PROGRAM_PATH;
        }

        return path;
    }
}
