import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DiskComponent } from '../src/app/disk/disk.component';
import { DiskService } from '../src/app/disk/disk.service';
import { BehaviorSubject } from 'rxjs';

describe('DiskComponent', () => {
    let component: DiskComponent;
    let fixture: ComponentFixture<DiskComponent>;
    let diskService: jest.Mocked<DiskService>;

    let diskNameSubject: BehaviorSubject<string>;
    let filesChangedSubject: BehaviorSubject<void>;

    beforeEach(async () => {
        diskNameSubject = new BehaviorSubject<string>('TestDisk');
        filesChangedSubject = new BehaviorSubject<void>(undefined);

        const diskServiceMock = {
            diskName$: diskNameSubject.asObservable(),
            filesChanged$: filesChangedSubject.asObservable(),
            diskName: 'TestDisk',
            programCode: '',
            newDisk: jest.fn(),
            loadDisk: jest.fn(),
            saveDisk: jest.fn(),
            getFileList: jest.fn().mockReturnValue([]),
            getFile: jest.fn(),
            saveFile: jest.fn(),
            deleteFile: jest.fn(),
            createFile: jest.fn(),
            createDirectory: jest.fn(),
            deleteDirectory: jest.fn(),
            renameFile: jest.fn(),
            renameDirectory: jest.fn(),
            isDirectory: jest.fn()
        } as any;

        await TestBed.configureTestingModule({
            imports: [DiskComponent, FormsModule],
            providers: [
                { provide: DiskService, useValue: diskServiceMock }
            ]
        }).compileComponents();

        diskService = TestBed.inject(DiskService) as jest.Mocked<DiskService>;
        fixture = TestBed.createComponent(DiskComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
        jest.restoreAllMocks();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with empty file tree', () => {
            fixture.detectChanges();
            expect(component.fileTree).toEqual([]);
        });

        it('should subscribe to disk name changes', () => {
            fixture.detectChanges();
            expect(component.diskName).toBe('TestDisk');
        });

        it('should update disk name when observable emits', () => {
            fixture.detectChanges();

            diskNameSubject.next('UpdatedDisk');
            expect(component.diskName).toBe('UpdatedDisk');
        });

        it('should refresh file tree on files changed', () => {
            diskService.getFileList.mockReturnValue(['file1.txt', 'file2.txt']);
            fixture.detectChanges();

            filesChangedSubject.next();

            expect(component.fileTree.length).toBe(2);
            expect(component.fileTree[0].name).toBe('file1.txt');
            expect(component.fileTree[1].name).toBe('file2.txt');
        });
    });

    describe('Disk Operations', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should change disk name', () => {
            component.diskName = 'NewName';
            component.onDiskNameChange();

            expect(diskService.diskName).toBe('NewName');
        });

        it('should create new disk with prompt', () => {
            jest.spyOn(window, 'prompt').mockReturnValue('MyDisk');

            component.onNewDisk();

            expect(diskService.newDisk).toHaveBeenCalledWith('MyDisk');
            expect(component.selectedFile).toBeNull();
            expect(component.editorLines).toEqual(['']);
        });

        it('should not create new disk if prompt cancelled', () => {
            jest.spyOn(window, 'prompt').mockReturnValue(null);

            component.onNewDisk();

            expect(diskService.newDisk).not.toHaveBeenCalled();
        });

        it('should save disk', async () => {
            diskService.saveDisk.mockReturnValue(Promise.resolve());

            await component.onSaveDisk();

            expect(diskService.saveDisk).toHaveBeenCalled();
        });

        it('should log error on save error', async () => {
            diskService.saveDisk.mockReturnValue(Promise.reject(new Error('Save failed')));
            jest.spyOn(console, 'error').mockImplementation(() => {});

            await component.onSaveDisk();

            expect(console.error).toHaveBeenCalledWith('Error saving disk:', expect.any(Error));
        });

        it('should load disk from file input', async () => {
            const mockFile = new File(['content'], 'test.disk', { type: 'application/zip' });
            diskService.loadDisk.mockReturnValue(Promise.resolve());

            const input = document.createElement('input');
            jest.spyOn(document, 'createElement').mockReturnValue(input as any);

            component.onLoadDisk();

            expect(document.createElement).toHaveBeenCalledWith('input');
        });

        it('should log error on load error', async () => {
            const mockFile = new File(['content'], 'test.disk', { type: 'application/zip' });
            diskService.loadDisk.mockReturnValue(Promise.reject(new Error('Load failed')));
            jest.spyOn(console, 'error').mockImplementation(() => {});
            
            const input = document.createElement('input');
            input.type = 'file';
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                writable: false
            });
            jest.spyOn(document, 'createElement').mockReturnValue(input as any);

            component.onLoadDisk();
            
            if (input.onchange)
            {
                await input.onchange({ target: input } as any);
            }

            expect(diskService.loadDisk).toHaveBeenCalledWith(mockFile);
            expect(console.error).toHaveBeenCalledWith('Error loading disk:', expect.any(Error));
            jest.restoreAllMocks();
        });
    });

    describe('File Operations', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should create new file with prompt', () => {
            jest.spyOn(window, 'prompt').mockReturnValue('newfile.txt');

            component.onNewFile();

            expect(diskService.createFile).toHaveBeenCalledWith('newfile.txt');
        });

        it('should not create file if prompt cancelled', () => {
            jest.spyOn(window, 'prompt').mockReturnValue(null);

            component.onNewFile();

            expect(diskService.createFile).not.toHaveBeenCalled();
        });

        it('should delete file with confirmation', () => {
            const fileNode = { name: 'delete.txt', path: 'delete.txt', type: 'file' as const, expanded: false };
            component.selectedFile = fileNode;
            jest.spyOn(window, 'confirm').mockReturnValue(true);

            component.onDeleteFile();

            expect(diskService.deleteFile).toHaveBeenCalledWith('delete.txt');
            expect(component.selectedFile).toBeNull();
            expect(component.editorLines).toEqual(['']);
        });

        it('should not delete file if not confirmed', () => {
            const fileNode = { name: 'keep.txt', path: 'keep.txt', type: 'file' as const, expanded: false };
            component.selectedFile = fileNode;
            jest.spyOn(window, 'confirm').mockReturnValue(false);

            component.onDeleteFile();

            expect(diskService.deleteFile).not.toHaveBeenCalled();
            expect(component.selectedFile).not.toBeNull();
        });

        it('should not delete if no file selected', () => {
            component.selectedFile = null;

            component.onDeleteFile();

            expect(diskService.deleteFile).not.toHaveBeenCalled();
        });

        it('should select file and load content', () => {
            const fileData = new TextEncoder().encode('File content');
            diskService.getFile.mockReturnValue(fileData);

            const fileNode = { name: 'test.txt', path: 'test.txt', type: 'file' as const, expanded: false };

            component.selectFile(fileNode);

            expect(component.selectedFile).toBe(fileNode);
            expect(component.editorLines).toEqual(['File content']);
        });

        it('should handle empty file selection', () => {
            diskService.getFile.mockReturnValue(new Uint8Array(0));

            const fileNode = { name: 'empty.txt', path: 'empty.txt', type: 'file' as const, expanded: false };

            component.selectFile(fileNode);

            expect(component.editorLines).toEqual(['']);
        });

        it('should handle null file data', () => {
            diskService.getFile.mockReturnValue(null);

            const fileNode = { name: 'null.txt', path: 'null.txt', type: 'file' as const, expanded: false };

            component.selectFile(fileNode);

            expect(component.editorLines).toEqual(['']);
        });

        it('should update file content on lines change', () => {
            const fileNode = { name: 'edit.txt', path: 'edit.txt', type: 'file' as const, expanded: false };
            component.selectedFile = fileNode;

            component.onLinesChange(['Updated content']);

            expect(component.editorLines).toEqual(['Updated content']);
            expect(diskService.saveFile).toHaveBeenCalled();
            
            const savedData = (diskService.saveFile as jest.Mock).mock.calls[0][1];
            const savedText = new TextDecoder().decode(savedData);
            expect(savedText).toBe('Updated content');
        });

        it('should split content into lines', () => {
            const fileNode = { name: 'lines.txt', path: 'lines.txt', type: 'file' as const, expanded: false };
            component.selectedFile = fileNode;

            component.onLinesChange(['Line 1', 'Line 2', 'Line 3']);

            expect(component.editorLines).toEqual(['Line 1', 'Line 2', 'Line 3']);
        });

        it('should select directory without toggling expansion', () => {
            const dirNode = { name: 'dir', path: 'dir', type: 'directory' as const, expanded: false, children: [] };

            component.selectFile(dirNode);

            expect(component.selectedFile).toBe(dirNode);
            expect(dirNode.expanded).toBe(false);
        });

        it('should toggle directory expansion', () => {
            const dirNode = { name: 'dir', path: 'dir', type: 'directory' as const, expanded: false, children: [] };

            component.toggleDirectory(dirNode);

            expect(dirNode.expanded).toBe(true);

            component.toggleDirectory(dirNode);

            expect(dirNode.expanded).toBe(false);
        });
    });

    describe('View Mode', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should toggle view mode from text to hex', () => {
            component.viewMode = 'text';

            component.toggleViewMode();

            expect(component.viewMode).toBe('hex');
        });

        it('should toggle view mode from hex to text', () => {
            component.viewMode = 'hex';

            component.toggleViewMode();

            expect(component.viewMode).toBe('text');
        });

        it('should generate hex content', () => {
            const fileData = new TextEncoder().encode('ABC');
            const fileNode = { name: 'test.txt', path: 'test.txt', type: 'file' as const, expanded: false };
            component.selectedFile = fileNode;
            diskService.getFile.mockReturnValue(fileData);

            const hex = component.getHexContent();

            expect(hex).toContain('41 42 43');
            expect(hex).toContain('ABC');
        });

        it('should format hex with offset', () => {
            const fileData = new TextEncoder().encode('Test');
            const fileNode = { name: 'test.txt', path: 'test.txt', type: 'file' as const, expanded: false };
            component.selectedFile = fileNode;
            diskService.getFile.mockReturnValue(fileData);

            const hex = component.getHexContent();

            expect(hex).toContain('00000000');
        });

        it('should return empty string for empty content', () => {
            const fileNode = { name: 'empty.txt', path: 'empty.txt', type: 'file' as const, expanded: false };
            component.selectedFile = fileNode;
            diskService.getFile.mockReturnValue(new Uint8Array(0));

            const hex = component.getHexContent();

            expect(hex).toBe('');
        });

        it('should handle multi-line hex dump', () => {
            const fileData = new TextEncoder().encode('A'.repeat(20));
            const fileNode = { name: 'test.txt', path: 'test.txt', type: 'file' as const, expanded: false };
            component.selectedFile = fileNode;
            diskService.getFile.mockReturnValue(fileData);

            const hex = component.getHexContent();

            const lines = hex.split('\n').filter(l => l.length > 0);
            expect(lines.length).toBeGreaterThan(1);
        });

        it('should display non-printable chars as dots', () => {
            const fileData = new Uint8Array([1, 2, 3]);
            const fileNode = { name: 'test.txt', path: 'test.txt', type: 'file' as const, expanded: false };
            component.selectedFile = fileNode;
            diskService.getFile.mockReturnValue(fileData);

            const hex = component.getHexContent();

            expect(hex).toContain('...');
        });
    });

    describe('File Tree Management', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should build tree from flat file list', () => {
            diskService.getFileList.mockReturnValue(['file1.dat', 'file2.dat', 'file3.dat']);

            filesChangedSubject.next();

            expect(component.fileTree.length).toBe(3);
            expect(component.fileTree[0].path).toBe('file1.dat');
            expect(component.fileTree[1].path).toBe('file2.dat');
            expect(component.fileTree[2].path).toBe('file3.dat');
        });

        it('should build hierarchical tree', () => {
            diskService.getFileList.mockReturnValue(['dir1/file1.txt', 'dir1/file2.txt', 'file3.txt']);

            filesChangedSubject.next();

            expect(component.fileTree.length).toBe(2);
            const dirNode = component.fileTree.find(n => n.name === 'dir1');
            expect(dirNode).toBeDefined();
            expect(dirNode?.type).toBe('directory');
            expect(dirNode?.children?.length).toBe(2);
        });

        it('should handle empty file list', () => {
            diskService.getFileList.mockReturnValue([]);

            filesChangedSubject.next();

            expect(component.fileTree).toEqual([]);
        });
    });

    describe('Directory Operations', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should create new directory with prompt', () => {
            jest.spyOn(window, 'prompt').mockReturnValue('newdir');

            component.onNewDirectory();

            expect(diskService.createDirectory).toHaveBeenCalledWith('newdir');
        });

        it('should create directory in parent path', () => {
            jest.spyOn(window, 'prompt').mockReturnValue('subdir');

            component.onNewDirectory('parent');

            expect(diskService.createDirectory).toHaveBeenCalledWith('parent/subdir');
        });

        it('should delete directory with confirmation', () => {
            const dirNode = { name: 'dir', path: 'dir', type: 'directory' as const, expanded: false, children: [] };
            component.selectedFile = dirNode;
            jest.spyOn(window, 'confirm').mockReturnValue(true);

            component.onDeleteFile();

            expect(diskService.deleteDirectory).toHaveBeenCalledWith('dir');
        });
    });

    describe('Component Cleanup', () => {
        it('should unsubscribe on destroy', () => {
            fixture.detectChanges();

            const destroySpy = jest.spyOn(component['destroy$'], 'next');
            const completeSpy = jest.spyOn(component['destroy$'], 'complete');

            component.ngOnDestroy();

            expect(destroySpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });
    });
});
