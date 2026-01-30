import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent, Folder, File, Plus, Save, FolderOpen, Edit, Trash } from 'ng-luna';
import { Subject, takeUntil } from 'rxjs';
import { DiskService } from './disk.service';
import { TextEditorComponent } from '../text-editor/text-editor.component';
import { DirectoryNode, FileSystemNode } from './filesystem-node';

export interface FileNode
{
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    expanded?: boolean;
}

@Component({
    selector: 'app-disk',
    standalone: true,
    imports: [ CommonModule, FormsModule, IconComponent, TextEditorComponent ],
    templateUrl: './disk.component.html',
    styleUrl: './disk.component.scss'
})
export class DiskComponent implements OnInit, OnDestroy
{
    public readonly folderIcon = Folder;
    public readonly fileIcon = File;
    public readonly plusIcon = Plus;
    public readonly saveIcon = Save;
    public readonly folderOpenIcon = FolderOpen;
    public readonly editIcon = Edit;
    public readonly trashIcon = Trash;

    public diskName: string = 'Untitled';
    public fileTree: FileNode[] = [];
    public selectedFile: FileNode | null = null;
    public editorLines: string[] = [''];
    public viewMode: 'text' | 'hex' = 'text';
    public contextMenuPath: string | null = null;
    public contextMenuClickedPath: string | null = null;
    public contextMenuX: number = 0;
    public contextMenuY: number = 0;
    public showContextMenu: boolean = false;
    public readonly emptyErrorLines: Set<number> = new Set();
    public readonly emptyErrorMessages: Map<number, string> = new Map();
    private expandedPaths: Set<string> = new Set();
    public draggedNode: FileNode | null = null;

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
                this.refreshFileTree();
            });

        this.refreshFileTree();
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

    public onNewFile(parentPath: string = ''): void
    {
        const fileName = prompt('Enter file name:');
        
        if (fileName)
        {
            if (parentPath)
            {
                this.expandPathAndParents(parentPath);
            }
            
            const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
            this.diskService.createFile(fullPath);
        }
    }

    public onNewDirectory(parentPath: string = ''): void
    {
        const dirName = prompt('Enter directory name:');
        
        if (dirName)
        {
            if (parentPath)
            {
                this.expandPathAndParents(parentPath);
            }
            
            const fullPath = parentPath ? `${parentPath}/${dirName}` : dirName;
            this.diskService.createDirectory(fullPath);
        }
    }

    public onNewFileInSelectedOrRoot(): void
    {
        const parentPath = this.selectedFile && this.selectedFile.type === 'directory' ? this.selectedFile.path : '';
        this.onNewFile(parentPath);
    }

    public onNewDirectoryInSelectedOrRoot(): void
    {
        const parentPath = this.selectedFile && this.selectedFile.type === 'directory' ? this.selectedFile.path : '';
        this.onNewDirectory(parentPath);
    }

    public getNewFileTitle(): string
    {
        if (this.selectedFile && this.selectedFile.type === 'directory')
        {
            return `New File in ${this.selectedFile.name}`;
        }
        
        return 'New File at Root';
    }

    public getNewDirectoryTitle(): string
    {
        if (this.selectedFile && this.selectedFile.type === 'directory')
        {
            return `New Directory in ${this.selectedFile.name}`;
        }
        
        return 'New Directory at Root';
    }

    public onDeleteFile(): void
    {
        if (this.selectedFile && !this.isProgramBas(this.selectedFile))
        {
            const confirmed = confirm(`Delete ${this.selectedFile.name}?`);
            
            if (confirmed)
            {
                if (this.selectedFile.type === 'directory')
                {
                    this.diskService.deleteDirectory(this.selectedFile.path);
                }
                else
                {
                    this.diskService.deleteFile(this.selectedFile.path);
                }
                
                this.selectedFile = null;
                this.editorLines = [''];
            }
        }
    }

    public onRenameFile(): void
    {
        if (this.selectedFile && !this.isProgramBas(this.selectedFile))
        {
            const newName = prompt('Enter new name:', this.selectedFile.name);
            
            if (newName && newName !== this.selectedFile.name)
            {
                const parentPath = this.getParentPath(this.selectedFile.path);
                const newPath = parentPath ? `${parentPath}/${newName}` : newName;
                
                if (this.selectedFile.type === 'directory')
                {
                    this.diskService.renameDirectory(this.selectedFile.path, newPath);
                }
                else
                {
                    this.diskService.renameFile(this.selectedFile.path, newPath);
                }
                
                this.selectedFile = null;
                this.editorLines = [''];
            }
        }
    }

    public selectFile(file: FileNode): void
    {
        this.selectedFile = file;
        
        if (file.type === 'file')
        {
            const data = this.diskService.getFile(file.path);
            
            if (data)
            {
                const decoder = new TextDecoder('utf-8');
                const content = decoder.decode(data);
                this.editorLines = content.split('\n');
                
                if (this.editorLines.length === 0)
                {
                    this.editorLines = [''];
                }
            }
            else
            {
                this.editorLines = [''];
            }
        }
    }

    public toggleDirectory(file: FileNode): void
    {
        if (file.type === 'directory')
        {
            file.expanded = !file.expanded;
            
            if (file.expanded)
            {
                this.expandedPaths.add(file.path);
            }
            else
            {
                this.expandedPaths.delete(file.path);
            }
        }
    }

    private expandPath(path: string): void
    {
        this.expandedPaths.add(path);
    }

    private expandPathAndParents(path: string): void
    {
        const parts = path.split('/').filter(p => p.length > 0);
        let currentPath = '';
        
        for (const part of parts)
        {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            this.expandedPaths.add(currentPath);
        }
        
        this.refreshFileTree();
    }

    public onLinesChange(lines: string[]): void
    {
        this.editorLines = lines;
        
        if (this.selectedFile && this.selectedFile.type === 'file')
        {
            const content = lines.join('\n');
            const encoder = new TextEncoder();
            const data = encoder.encode(content);
            this.diskService.saveFile(this.selectedFile.path, data);
        }
    }

    public toggleViewMode(): void
    {
        this.viewMode = this.viewMode === 'text' ? 'hex' : 'text';
    }

    public getHexContent(): string
    {
        if (!this.selectedFile || this.selectedFile.type !== 'file')
        {
            return '';
        }

        const data = this.diskService.getFile(this.selectedFile.path);
        
        if (!data)
        {
            return '';
        }

        let hex = '';
        
        for (let i = 0; i < data.length; i += 16)
        {
            const offset = i.toString(16).padStart(8, '0').toUpperCase();
            const chunk = data.slice(i, i + 16);
            const hexBytes = Array.from(chunk).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
            const ascii = Array.from(chunk).map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
            
            hex += `${offset}  ${hexBytes.padEnd(48, ' ')}  ${ascii}\n`;
        }
        
        return hex;
    }

    public onContextMenu(event: MouseEvent, path: string): void
    {
        event.preventDefault();
        event.stopPropagation();
        
        const node = this.findNodeByPath(this.fileTree, path);
        
        this.contextMenuClickedPath = path;
        
        if (node)
        {
            if (node.type === 'directory')
            {
                this.contextMenuPath = node.path;
            }
            else
            {
                this.contextMenuPath = this.getParentPath(node.path);
            }
        }
        else
        {
            this.contextMenuPath = '';
        }
        
        this.contextMenuX = event.clientX;
        this.contextMenuY = event.clientY;
        this.showContextMenu = true;
    }

    public closeContextMenu(): void
    {
        this.showContextMenu = false;
        this.contextMenuPath = null;
        this.contextMenuClickedPath = null;
    }

    public onContextMenuNewFile(): void
    {
        const parentPath = this.contextMenuPath !== null ? this.contextMenuPath : '';
        this.onNewFile(parentPath);
        this.closeContextMenu();
    }

    public onContextMenuNewDirectory(): void
    {
        const parentPath = this.contextMenuPath !== null ? this.contextMenuPath : '';
        this.onNewDirectory(parentPath);
        this.closeContextMenu();
    }

    public onContextMenuDelete(): void
    {
        if (this.contextMenuClickedPath !== null)
        {
            const node = this.findNodeByPath(this.fileTree, this.contextMenuClickedPath);
            
            if (node && !this.isProgramBas(node))
            {
                this.selectedFile = node;
                this.onDeleteFile();
            }
        }
        
        this.closeContextMenu();
    }

    public onContextMenuRename(): void
    {
        if (this.contextMenuClickedPath !== null)
        {
            const node = this.findNodeByPath(this.fileTree, this.contextMenuClickedPath);
            
            if (node && !this.isProgramBas(node))
            {
                this.selectedFile = node;
                this.onRenameFile();
            }
        }
        
        this.closeContextMenu();
    }

    private refreshFileTree(): void
    {
        const root = this.diskService.getFileSystemRoot();
        this.fileTree = this.convertToFileNodes(root);
    }

    private convertToFileNodes(directory: DirectoryNode): FileNode[]
    {
        const result: FileNode[] = [];
        const children = directory.children;

        for (const child of children.values())
        {
            const fileNode: FileNode = {
                name: child.name,
                path: child.path,
                type: child.type,
                children: undefined,
                expanded: this.expandedPaths.has(child.path)
            };

            if (child.type === 'directory')
            {
                fileNode.children = this.convertToFileNodes(child as DirectoryNode);
            }

            result.push(fileNode);
        }

        return result.sort((a, b) => {
            if (a.type !== b.type)
            {
                return a.type === 'directory' ? -1 : 1;
            }

            return a.name.localeCompare(b.name);
        });
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

    private findNodeByPath(nodes: FileNode[], path: string): FileNode | null
    {
        for (const node of nodes)
        {
            if (node.path === path)
            {
                return node;
            }
            
            if (node.children)
            {
                const found = this.findNodeByPath(node.children, path);
                
                if (found)
                {
                    return found;
                }
            }
        }
        
        return null;
    }

    public isProgramBas(file: FileNode): boolean
    {
        return file.path === 'program.bas' || file.name === 'program.bas';
    }

    public onDragStart(event: DragEvent, node: FileNode): void
    {
        if (this.isProgramBas(node))
        {
            event.preventDefault();
            return;
        }

        this.draggedNode = node;
        event.dataTransfer!.effectAllowed = 'move';
        event.dataTransfer!.setData('text/plain', node.path);
    }

    public onDragOver(event: DragEvent, node: FileNode): void
    {
        if (!this.draggedNode || this.draggedNode === node)
        {
            return;
        }

        let targetPath: string;

        if (node.type === 'directory')
        {
            targetPath = node.path;
        }
        else
        {
            targetPath = this.getParentPath(node.path);
        }

        if (targetPath === this.draggedNode.path || this.isDescendantOf(targetPath, this.draggedNode.path))
        {
            return;
        }

        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';
    }

    public onDrop(event: DragEvent, targetNode: FileNode): void
    {
        event.preventDefault();

        if (!this.draggedNode)
        {
            return;
        }

        let targetPath: string;

        if (targetNode.type === 'directory')
        {
            targetPath = targetNode.path;
        }
        else
        {
            targetPath = this.getParentPath(targetNode.path);
        }

        if (targetPath === this.draggedNode.path || this.isDescendantOf(targetPath, this.draggedNode.path))
        {
            return;
        }

        const newPath = targetPath ? `${targetPath}/${this.draggedNode.name}` : this.draggedNode.name;

        if (this.draggedNode.type === 'directory')
        {
            this.diskService.renameDirectory(this.draggedNode.path, newPath);
        }
        else
        {
            this.diskService.renameFile(this.draggedNode.path, newPath);
        }

        if (targetPath)
        {
            this.expandPathAndParents(targetPath);
        }

        this.draggedNode = null;
    }

    public onDragEnd(): void
    {
        this.draggedNode = null;
    }

    public isNodeBeingDragged(node: FileNode): boolean
    {
        return this.draggedNode === node;
    }

    public isNodeInDraggedSubtree(node: FileNode): boolean
    {
        if (!this.draggedNode || this.draggedNode.type !== 'directory')
        {
            return false;
        }

        return this.isDescendantOf(node.path, this.draggedNode.path);
    }

    private isDescendantOf(descendantPath: string, ancestorPath: string): boolean
    {
        if (!ancestorPath)
        {
            return false;
        }

        return descendantPath.startsWith(ancestorPath + '/');
    }

}
