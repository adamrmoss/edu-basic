import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent, Folder, File } from 'ng-luna';
import { Subject, takeUntil } from 'rxjs';
import { DiskService } from './disk.service';
import { TextEditorComponent } from '../text-editor/text-editor.component';

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

    public diskName: string = 'Untitled';
    public fileTree: FileNode[] = [];
    public selectedFile: FileNode | null = null;
    public editorLines: string[] = [''];
    public viewMode: 'text' | 'hex' = 'text';
    public contextMenuPath: string | null = null;
    public contextMenuX: number = 0;
    public contextMenuY: number = 0;
    public showContextMenu: boolean = false;
    public readonly emptyErrorLines: Set<number> = new Set();
    public readonly emptyErrorMessages: Map<number, string> = new Map();

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
            const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
            this.diskService.createFile(fullPath);
        }
    }

    public onNewDirectory(parentPath: string = ''): void
    {
        const dirName = prompt('Enter directory name:');
        
        if (dirName)
        {
            const fullPath = parentPath ? `${parentPath}/${dirName}` : dirName;
            this.diskService.createDirectory(fullPath);
        }
    }

    public onDeleteFile(): void
    {
        if (this.selectedFile)
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
        if (this.selectedFile)
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
        if (file.type === 'directory')
        {
            file.expanded = !file.expanded;
        }
        else
        {
            this.selectedFile = file;
            
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
        
        this.contextMenuPath = path;
        this.contextMenuX = event.clientX;
        this.contextMenuY = event.clientY;
        this.showContextMenu = true;
    }

    public closeContextMenu(): void
    {
        this.showContextMenu = false;
        this.contextMenuPath = null;
    }

    public onContextMenuNewFile(): void
    {
        if (this.contextMenuPath)
        {
            this.onNewFile(this.contextMenuPath);
        }
        else
        {
            this.onNewFile();
        }
        
        this.closeContextMenu();
    }

    public onContextMenuNewDirectory(): void
    {
        if (this.contextMenuPath)
        {
            this.onNewDirectory(this.contextMenuPath);
        }
        else
        {
            this.onNewDirectory();
        }
        
        this.closeContextMenu();
    }

    public onContextMenuDelete(): void
    {
        if (this.contextMenuPath)
        {
            const node = this.findNodeByPath(this.fileTree, this.contextMenuPath);
            
            if (node)
            {
                this.selectedFile = node;
                this.onDeleteFile();
            }
        }
        
        this.closeContextMenu();
    }

    public onContextMenuRename(): void
    {
        if (this.contextMenuPath)
        {
            const node = this.findNodeByPath(this.fileTree, this.contextMenuPath);
            
            if (node)
            {
                this.selectedFile = node;
                this.onRenameFile();
            }
        }
        
        this.closeContextMenu();
    }

    private refreshFileTree(): void
    {
        const paths = this.diskService.getFileList();
        const tree = this.buildTree(paths);
        this.fileTree = tree;
    }

    private buildTree(paths: string[]): FileNode[]
    {
        interface TreeNode
        {
            node: FileNode;
            children: Map<string, TreeNode>;
        }
        
        const root: Map<string, TreeNode> = new Map();
        
        for (const path of paths)
        {
            if (path.endsWith('.dir'))
            {
                continue;
            }
            
            const parts = path.split('/');
            let currentMap = root;
            let currentPath = '';
            
            for (let i = 0; i < parts.length; i++)
            {
                const part = parts[i];
                const isLast = i === parts.length - 1;
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                
                if (!currentMap.has(part))
                {
                    const node: FileNode = {
                        name: part,
                        path: currentPath,
                        type: isLast ? 'file' : 'directory',
                        children: undefined,
                        expanded: false
                    };
                    
                    const treeNode: TreeNode = {
                        node,
                        children: isLast ? new Map() : new Map<string, TreeNode>()
                    };
                    
                    currentMap.set(part, treeNode);
                }
                
                const treeNode = currentMap.get(part)!;
                
                if (!isLast)
                {
                    currentMap = treeNode.children;
                }
            }
        }
        
        const convertToFileNodes = (map: Map<string, TreeNode>): FileNode[] =>
        {
            const result: FileNode[] = [];
            
            for (const treeNode of map.values())
            {
                const node = treeNode.node;
                
                if (treeNode.children.size > 0)
                {
                    node.children = convertToFileNodes(treeNode.children);
                }
                else if (node.type === 'directory')
                {
                    node.children = [];
                }
                
                result.push(node);
            }
            
            return result.sort((a, b) => {
                if (a.type !== b.type)
                {
                    return a.type === 'directory' ? -1 : 1;
                }
                
                return a.name.localeCompare(b.name);
            });
        };
        
        return convertToFileNodes(root);
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
}
