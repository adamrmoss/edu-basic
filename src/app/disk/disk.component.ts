import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent, Folder, File } from 'ng-luna';
import { Subject, takeUntil } from 'rxjs';
import { DiskService } from './disk.service';

interface FileNode
{
    name: string;
    path: string;
    type: 'file';
}

@Component({
    selector: 'app-disk',
    imports: [ CommonModule, FormsModule, IconComponent ],
    templateUrl: './disk.component.html',
    styleUrl: './disk.component.scss'
})
export class DiskComponent implements OnInit, OnDestroy
{
    public readonly folderIcon = Folder;
    public readonly fileIcon = File;

    public diskName: string = 'Untitled';
    public fileList: FileNode[] = [];
    public selectedFile: FileNode | null = null;
    public fileContent: string = '';
    public viewMode: 'text' | 'hex' = 'text';
    public editorLines: string[] = [''];

    private readonly destroy$ = new Subject<void>();

    constructor(private readonly diskService: DiskService)
    {
    }

    public ngOnInit(): void
    {
        this.diskService.diskName$
            .pipe(takeUntil(this.destroy$))
            .subscribe((name: string) => {
                this.diskName = name;
            });

        this.diskService.filesChanged$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.refreshFileList();
            });

        this.refreshFileList();
    }

    public ngOnDestroy(): void
    {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public onDiskNameChange(): void
    {
        this.diskService.diskName = this.diskName;
    }

    public onNewDisk(): void
    {
        const name = prompt('Enter disk name:', 'Untitled');
        
        if (name !== null)
        {
            this.diskService.newDisk(name);
            this.selectedFile = null;
            this.fileContent = '';
            this.editorLines = [''];
        }
    }

    public async onLoadDisk(): Promise<void>
    {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.disk';
        
        input.onchange = async (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            
            if (file)
            {
                try
                {
                    await this.diskService.loadDisk(file);
                    this.selectedFile = null;
                    this.fileContent = '';
                    this.editorLines = [''];
                }
                catch (error)
                {
                    console.error('Error loading disk:', error);
                }
            }
        };
        
        input.click();
    }

    public async onSaveDisk(): Promise<void>
    {
        try
        {
            await this.diskService.saveDisk();
        }
        catch (error)
        {
            console.error('Error saving disk:', error);
        }
    }

    public onNewFile(): void
    {
        const fileName = prompt('Enter file name:');
        
        if (fileName)
        {
            this.diskService.createFile(fileName);
        }
    }

    public onDeleteFile(): void
    {
        if (this.selectedFile)
        {
            const confirmed = confirm(`Delete ${this.selectedFile.name}?`);
            
            if (confirmed)
            {
                this.diskService.deleteFile(this.selectedFile.path);
                this.selectedFile = null;
                this.fileContent = '';
                this.editorLines = [''];
            }
        }
    }

    public selectFile(file: FileNode): void
    {
        this.selectedFile = file;
        
        const data = this.diskService.getFile(file.path);
        
        if (data)
        {
            const decoder = new TextDecoder('utf-8');
            this.fileContent = decoder.decode(data);
            this.editorLines = this.fileContent.split('\n');
            
            if (this.editorLines.length === 0)
            {
                this.editorLines = [''];
            }
        }
        else
        {
            this.fileContent = '';
            this.editorLines = [''];
        }
    }

    public getLineNumbers(): number[]
    {
        return Array.from({ length: this.editorLines.length }, (_, i) => i + 1);
    }

    public onTextAreaInput(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        this.fileContent = textarea.value;
        this.editorLines = this.fileContent.split('\n');
        
        if (this.selectedFile)
        {
            const encoder = new TextEncoder();
            const data = encoder.encode(this.fileContent);
            this.diskService.saveFile(this.selectedFile.path, data);
        }
    }

    public onTextAreaScroll(event: Event): void
    {
        const textarea = event.target as HTMLTextAreaElement;
        const lineNumbers = document.querySelector('.file-line-numbers') as HTMLElement;
        
        if (lineNumbers)
        {
            lineNumbers.scrollTop = textarea.scrollTop;
        }
    }

    public toggleViewMode(): void
    {
        this.viewMode = this.viewMode === 'text' ? 'hex' : 'text';
    }

    public getHexContent(): string
    {
        if (!this.fileContent)
        {
            return '';
        }

        const bytes = new TextEncoder().encode(this.fileContent);
        let hex = '';
        
        for (let i = 0; i < bytes.length; i += 16)
        {
            const offset = i.toString(16).padStart(8, '0').toUpperCase();
            const chunk = bytes.slice(i, i + 16);
            const hexBytes = Array.from(chunk).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
            const ascii = Array.from(chunk).map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
            
            hex += `${offset}  ${hexBytes.padEnd(48, ' ')}  ${ascii}\n`;
        }
        
        return hex;
    }

    private refreshFileList(): void
    {
        const paths = this.diskService.getFileList();
        this.fileList = paths.map((path: string) => ({
            name: path,
            path: path,
            type: 'file' as const
        }));
    }
}
