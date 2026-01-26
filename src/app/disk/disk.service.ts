import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import JSZip from 'jszip';
import { FileSystemService } from './filesystem.service';
import { DirectoryNode } from './filesystem-node';

@Injectable({
    providedIn: 'root'
})
export class DiskService
{
    private readonly diskNameSubject = new BehaviorSubject<string>('Untitled');
    private readonly programCodeSubject = new BehaviorSubject<string>('');
    private readonly filesChangedSubject = new BehaviorSubject<void>(undefined);

    public readonly diskName$: Observable<string> = this.diskNameSubject.asObservable();
    public readonly programCode$: Observable<string> = this.programCodeSubject.asObservable();
    public readonly filesChanged$: Observable<void> = this.filesChangedSubject.asObservable();

    constructor(private readonly fileSystemService: FileSystemService)
    {
    }

    public get diskName(): string
    {
        return this.diskNameSubject.value;
    }

    public set diskName(name: string)
    {
        this.diskNameSubject.next(name);
    }

    public get programCode(): string
    {
        return this.programCodeSubject.value;
    }

    public set programCode(code: string)
    {
        this.programCodeSubject.next(code);
        const encoder = new TextEncoder();
        const data = encoder.encode(code);
        this.fileSystemService.writeFile('program.bas', data);
        this.filesChangedSubject.next();
    }

    public newDisk(name: string = 'Untitled'): void
    {
        this.diskNameSubject.next(name);
        this.programCodeSubject.next('');
        this.fileSystemService.clear();
        const encoder = new TextEncoder();
        const data = encoder.encode('');
        this.fileSystemService.writeFile('program.bas', data);
        this.filesChangedSubject.next();
    }

    public async saveDisk(): Promise<void>
    {
        const zip = new JSZip();
        const files = this.fileSystemService.getAllFiles();
        
        for (const [path, data] of files.entries())
        {
            const buffer = new Uint8Array(data).buffer;
            zip.file(path, buffer);
        }

        const blob = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.diskNameSubject.value}.disk`;
        link.click();

        URL.revokeObjectURL(link.href);
    }

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
        
        for (const [relativePath, zipEntry] of fileEntries)
        {
            const data = await zipEntry.async('uint8array');
            this.fileSystemService.writeFile(relativePath, data);
        }

        const programFileData = this.fileSystemService.readFile('program.bas');
        let programText = '';
        
        if (programFileData)
        {
            const decoder = new TextDecoder('utf-8');
            programText = decoder.decode(programFileData);
        }
        
        this.programCodeSubject.next(programText);
        this.filesChangedSubject.next();
    }

    public getFileList(): string[]
    {
        this.ensureProgramBasExists();
        return this.fileSystemService.listFiles();
    }

    public getFileSystemRoot(): DirectoryNode
    {
        this.ensureProgramBasExists();
        return this.fileSystemService.getRoot();
    }

    private ensureProgramBasExists(): void
    {
        if (!this.fileSystemService.fileExists('program.bas'))
        {
            const encoder = new TextEncoder();
            const code = this.programCodeSubject.value;
            const data = encoder.encode(code);
            this.fileSystemService.writeFile('program.bas', data);
        }
    }

    public getFile(path: string): Uint8Array | null
    {
        return this.fileSystemService.readFile(path);
    }

    public getProgramCodeFromFile(): string
    {
        this.ensureProgramBasExists();
        const fileData = this.fileSystemService.readFile('program.bas');
        
        if (fileData)
        {
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(fileData);
        }
        
        return '';
    }

    public saveFile(path: string, data: Uint8Array): void
    {
        this.fileSystemService.writeFile(path, data);
        
        if (path === 'program.bas')
        {
            const decoder = new TextDecoder('utf-8');
            const code = decoder.decode(data);
            this.programCodeSubject.next(code);
        }
        
        this.filesChangedSubject.next();
    }

    public deleteFile(path: string): void
    {
        if (path === 'program.bas')
        {
            return;
        }
        
        this.fileSystemService.deleteFile(path);
        this.filesChangedSubject.next();
    }

    public createFile(path: string): void
    {
        this.fileSystemService.writeFile(path, new Uint8Array(0));
        this.filesChangedSubject.next();
    }

    public createDirectory(path: string): void
    {
        this.fileSystemService.createDirectory(path);
        this.filesChangedSubject.next();
    }

    public deleteDirectory(path: string): boolean
    {
        const deleted = this.fileSystemService.deleteDirectory(path);
        
        if (deleted)
        {
            this.filesChangedSubject.next();
        }
        
        return deleted;
    }

    public renameFile(oldPath: string, newPath: string): boolean
    {
        if (oldPath === 'program.bas')
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

    public renameDirectory(oldPath: string, newPath: string): boolean
    {
        const result = this.fileSystemService.renameDirectory(oldPath, newPath);
        
        if (result)
        {
            this.filesChangedSubject.next();
        }
        
        return result;
    }

    public isDirectory(path: string): boolean
    {
        return this.fileSystemService.directoryExists(path);
    }
}
