import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent, Folder, File, Plus, Save, FolderOpen, Edit, Trash } from 'ng-luna';
import { Subject, takeUntil } from 'rxjs';
import { DiskService } from './disk.service';
import { TextEditorComponent } from '../text-editor/text-editor.component';
import { DirectoryNode, FileSystemNode } from './filesystem-node';

/**
 * UI view-model node for the disk file tree.
 */
export interface FileNode
{
    /**
     * Display name (path segment).
     */
    name: string;

    /**
     * Full path to the node (relative to virtual disk root).
     */
    path: string;

    /**
     * Discriminator for node kind.
     */
    type: 'file' | 'directory';

    /**
     * Child nodes when `type` is `directory`.
     */
    children?: FileNode[];

    /**
     * Whether the directory node is expanded in the UI.
     */
    expanded?: boolean;
}

/**
 * Disk UI component for browsing and editing the virtual disk contents.
 */
@Component({
    selector: 'app-disk',
    standalone: true,
    imports: [ CommonModule, FormsModule, IconComponent, TextEditorComponent ],
    templateUrl: './disk.component.html',
    styleUrl: './disk.component.scss'
})
export class DiskComponent implements OnInit, OnDestroy
{
    /**
     * Folder icon used by the file tree.
     */
    public readonly folderIcon = Folder;

    /**
     * File icon used by the file tree.
     */
    public readonly fileIcon = File;

    /**
     * Icon used for creating new items.
     */
    public readonly plusIcon = Plus;

    /**
     * Icon used for saving.
     */
    public readonly saveIcon = Save;

    /**
     * Icon used for opening a folder.
     */
    public readonly folderOpenIcon = FolderOpen;

    /**
     * Icon used for rename/edit actions.
     */
    public readonly editIcon = Edit;

    /**
     * Icon used for delete actions.
     */
    public readonly trashIcon = Trash;

    /**
     * Current disk name.
     */
    public diskName: string = 'Untitled';

    /**
     * Root nodes for the file tree display.
     */
    public fileTree: FileNode[] = [];

    /**
     * Currently selected file tree node.
     */
    public selectedFile: FileNode | null = null;

    /**
     * Current editor contents for the selected file.
     */
    public editorLines: string[] = [''];

    /**
     * Current file view mode.
     */
    public viewMode: 'text' | 'hex' = 'text';

    /**
     * Directory path where the context menu is anchored (folder context).
     */
    public contextMenuPath: string | null = null;

    /**
     * Path that was right-clicked to open the context menu.
     */
    public contextMenuClickedPath: string | null = null;

    /**
     * Context menu screen X coordinate.
     */
    public contextMenuX: number = 0;

    /**
     * Context menu screen Y coordinate.
     */
    public contextMenuY: number = 0;

    /**
     * Whether the context menu is currently shown.
     */
    public showContextMenu: boolean = false;

    /**
     * Empty error line set passed to `TextEditorComponent` (disk editor does not validate).
     */
    public readonly emptyErrorLines: Set<number> = new Set();

    /**
     * Empty error message map passed to `TextEditorComponent` (disk editor does not validate).
     */
    public readonly emptyErrorMessages: Map<number, string> = new Map();

    /**
     * Remembered expanded directory paths for the file tree.
     */
    private expandedPaths: Set<string> = new Set();

    /**
     * Node currently being dragged in the file tree.
     */
    public draggedNode: FileNode | null = null;

    private readonly destroy$ = new Subject<void>();

    /**
     * Create a new disk component.
     *
     * @param diskService Disk service backing this UI.
     */
    constructor(private readonly diskService: DiskService)
    {
    }

    /**
     * Subscribe to disk state changes and initialize the file tree.
     */
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

    /**
     * Clean up subscriptions created by this component.
     */
    public ngOnDestroy(): void
    {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Persist the current disk name to `DiskService`.
     */
    public onDiskNameChange(): void
    {
        this.diskService.diskName = this.diskName;
    }

    /**
     * Create a new disk after prompting for a name.
     */
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

    /**
     * Load a `.disk` file selected by the user.
     */
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

    /**
     * Save the current disk as a `.disk` file.
     */
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

    /**
     * Create a new empty file at the given parent path.
     *
     * @param parentPath Directory path to create the file under.
     */
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

    /**
     * Create a new directory at the given parent path.
     *
     * @param parentPath Directory path to create the directory under.
     */
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

    /**
     * Create a new file in the selected directory, or at the root if none selected.
     */
    public onNewFileInSelectedOrRoot(): void
    {
        const parentPath = this.selectedFile && this.selectedFile.type === 'directory' ? this.selectedFile.path : '';
        this.onNewFile(parentPath);
    }

    /**
     * Create a new directory in the selected directory, or at the root if none selected.
     */
    public onNewDirectoryInSelectedOrRoot(): void
    {
        const parentPath = this.selectedFile && this.selectedFile.type === 'directory' ? this.selectedFile.path : '';
        this.onNewDirectory(parentPath);
    }

    /**
     * Get the UI label for the "new file" action.
     */
    public getNewFileTitle(): string
    {
        if (this.selectedFile && this.selectedFile.type === 'directory')
        {
            return `New File in ${this.selectedFile.name}`;
        }
        
        return 'New File at Root';
    }

    /**
     * Get the UI label for the "new directory" action.
     */
    public getNewDirectoryTitle(): string
    {
        if (this.selectedFile && this.selectedFile.type === 'directory')
        {
            return `New Directory in ${this.selectedFile.name}`;
        }
        
        return 'New Directory at Root';
    }

    /**
     * Delete the currently selected file/directory (except `program.bas`).
     */
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

    /**
     * Rename the currently selected file/directory (except `program.bas`).
     */
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

    /**
     * Select a file tree node and load its content for editing.
     *
     * @param file File node to select.
     */
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

    /**
     * Toggle directory expansion state in the file tree.
     *
     * @param file Directory node to toggle.
     */
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

    /**
     * Persist editor text changes into the selected file.
     *
     * @param lines Updated file contents split into lines.
     */
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

    /**
     * Toggle between text and hex view.
     */
    public toggleViewMode(): void
    {
        this.viewMode = this.viewMode === 'text' ? 'hex' : 'text';
    }

    /**
     * Render the selected file bytes as a hex + ASCII dump.
     */
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

    /**
     * Open the context menu for a file tree node.
     *
     * @param event Mouse event.
     * @param path Node path that was right-clicked.
     */
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

    /**
     * Close the context menu.
     */
    public closeContextMenu(): void
    {
        this.showContextMenu = false;
        this.contextMenuPath = null;
        this.contextMenuClickedPath = null;
    }

    /**
     * Create a new file using the current context menu path.
     */
    public onContextMenuNewFile(): void
    {
        const parentPath = this.contextMenuPath !== null ? this.contextMenuPath : '';
        this.onNewFile(parentPath);
        this.closeContextMenu();
    }

    /**
     * Create a new directory using the current context menu path.
     */
    public onContextMenuNewDirectory(): void
    {
        const parentPath = this.contextMenuPath !== null ? this.contextMenuPath : '';
        this.onNewDirectory(parentPath);
        this.closeContextMenu();
    }

    /**
     * Delete the node that was right-clicked (except `program.bas`).
     */
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

    /**
     * Rename the node that was right-clicked (except `program.bas`).
     */
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

    /**
     * Determine whether a node refers to the internal `program.bas` file.
     *
     * @param file File node to check.
     */
    public isProgramBas(file: FileNode): boolean
    {
        return file.path === 'program.bas' || file.name === 'program.bas';
    }

    /**
     * Begin dragging a node in the file tree.
     *
     * @param event Drag event.
     * @param node Node being dragged.
     */
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

    /**
     * Handle drag-over events for the file tree.
     *
     * @param event Drag event.
     * @param node Current hover target node.
     */
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

    /**
     * Handle dropping a dragged node onto another node in the file tree.
     *
     * @param event Drag event.
     * @param targetNode Node being dropped onto.
     */
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

    /**
     * End a drag operation.
     */
    public onDragEnd(): void
    {
        this.draggedNode = null;
    }

    /**
     * Determine whether a given node is the current drag source.
     *
     * @param node Node to check.
     */
    public isNodeBeingDragged(node: FileNode): boolean
    {
        return this.draggedNode === node;
    }

    /**
     * Determine whether a node is inside the subtree of the currently dragged directory.
     *
     * @param node Node to check.
     */
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
