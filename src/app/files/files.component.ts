import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, Folder, File } from 'ng-luna';
import { TextEditorComponent } from '../text-editor/text-editor.component';

interface FileNode
{
    name: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    content?: string;
}

@Component({
    selector: 'app-files',
    standalone: true,
    imports: [ CommonModule, IconComponent, TextEditorComponent ],
    templateUrl: './files.component.html',
    styleUrl: './files.component.scss'
})
export class FilesComponent
{
    public readonly folderIcon = Folder;
    public readonly fileIcon = File;

    public fileTree: FileNode[] = [
        {
            name: 'project',
            type: 'directory',
            children: [
                { name: 'main.bas', type: 'file', content: '' },
                { name: 'utils.bas', type: 'file', content: '' }
            ]
        }
    ];

    public selectedFile: FileNode | null = null;
    public editorLines: string[] = [''];
    public viewMode: 'text' | 'hex' = 'text';

    public selectFile(file: FileNode): void
    {
        if (file.type === 'file')
        {
            this.selectedFile = file;
            this.editorLines = (file.content || '').split('\n');
            
            if (this.editorLines.length === 0)
            {
                this.editorLines = [''];
            }
        }
    }

    public onLinesChange(lines: string[]): void
    {
        this.editorLines = lines;
        
        if (this.selectedFile)
        {
            this.selectedFile.content = lines.join('\n');
        }
    }

    public toggleViewMode(): void
    {
        this.viewMode = this.viewMode === 'text' ? 'hex' : 'text';
    }

    public getHexContent(): string
    {
        if (!this.selectedFile?.content)
        {
            return '';
        }

        const bytes = new TextEncoder().encode(this.selectedFile.content);
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
}
