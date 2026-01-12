import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import JSZip from 'jszip';
import { FileSystemService } from './filesystem.service';

export interface DiskMetadata
{
    name: string;
    created: string;
    modified: string;
}

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

    public get programCode(): string
    {
        return this.programCodeSubject.value;
    }

    public setDiskName(name: string): void
    {
        this.diskNameSubject.next(name);
    }

    public setProgramCode(code: string): void
    {
        this.programCodeSubject.next(code);
    }

    public newDisk(name: string = 'Untitled'): void
    {
        this.diskNameSubject.next(name);
        this.programCodeSubject.next('');
        this.fileSystemService.clear();
        this.filesChangedSubject.next();
    }

    public async saveDisk(): Promise<void>
    {
        const zip = new JSZip();

        const programCode = this.programCodeSubject.value;
        zip.file('program.bas', programCode);

        const metadata: DiskMetadata = {
            name: this.diskNameSubject.value,
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
        zip.file('disk.json', JSON.stringify(metadata, null, 2));

        const files = this.fileSystemService.getAllFiles();
        const filesFolder = zip.folder('files');
        
        if (filesFolder)
        {
            for (const [path, data] of files.entries())
            {
                const buffer = new Uint8Array(data).buffer;
                filesFolder.file(path, buffer);
            }
        }

        const blob = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.diskNameSubject.value}.zip`;
        link.click();

        URL.revokeObjectURL(link.href);
    }

    public async loadDisk(file: File): Promise<void>
    {
        const zip = await JSZip.loadAsync(file);

        const diskJsonFile = zip.file('disk.json');
        
        if (diskJsonFile)
        {
            const diskJsonText = await diskJsonFile.async('text');
            const metadata: DiskMetadata = JSON.parse(diskJsonText);
            this.diskNameSubject.next(metadata.name);
        }
        else
        {
            const fileName = file.name.replace(/\.zip$/i, '');
            this.diskNameSubject.next(fileName);
        }

        const programFile = zip.file('program.bas');
        
        if (programFile)
        {
            const programText = await programFile.async('text');
            this.programCodeSubject.next(programText);
        }
        else
        {
            this.programCodeSubject.next('');
        }

        this.fileSystemService.clear();

        const filesFolder = zip.folder('files');
        
        if (filesFolder)
        {
            const fileEntries: Array<[string, any]> = [];
            filesFolder.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir)
                {
                    fileEntries.push([relativePath, zipEntry]);
                }
            });
            
            for (const [relativePath, zipEntry] of fileEntries)
            {
                const path = relativePath.replace(/^files\//, '');
                const data = await zipEntry.async('uint8array');
                this.fileSystemService.writeFile(path, data);
            }
        }

        this.filesChangedSubject.next();
    }

    public getFileList(): string[]
    {
        return this.fileSystemService.listFiles();
    }

    public getFile(path: string): Uint8Array | null
    {
        return this.fileSystemService.readFile(path);
    }

    public saveFile(path: string, data: Uint8Array): void
    {
        this.fileSystemService.writeFile(path, data);
        this.filesChangedSubject.next();
    }

    public deleteFile(path: string): void
    {
        this.fileSystemService.deleteFile(path);
        this.filesChangedSubject.next();
    }

    public createFile(path: string): void
    {
        this.fileSystemService.writeFile(path, new Uint8Array(0));
        this.filesChangedSubject.next();
    }
}
