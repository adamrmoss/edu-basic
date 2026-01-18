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
            createFile: jest.fn()
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

        it('should initialize with empty file list', () => {
            fixture.detectChanges();
            expect(component.fileList).toEqual([]);
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

        it('should refresh file list on files changed', () => {
            diskService.getFileList.mockReturnValue(['file1.txt', 'file2.txt']);
            fixture.detectChanges();

            filesChangedSubject.next();

            expect(component.fileList.length).toBe(2);
            expect(component.fileList[0].name).toBe('file1.txt');
            expect(component.fileList[1].name).toBe('file2.txt');
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
            expect(component.fileContent).toBe('');
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
            component.selectedFile = { name: 'delete.txt', path: 'delete.txt', type: 'file' };
            jest.spyOn(window, 'confirm').mockReturnValue(true);

            component.onDeleteFile();

            expect(diskService.deleteFile).toHaveBeenCalledWith('delete.txt');
            expect(component.selectedFile).toBeNull();
            expect(component.fileContent).toBe('');
        });

        it('should not delete file if not confirmed', () => {
            component.selectedFile = { name: 'keep.txt', path: 'keep.txt', type: 'file' };
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

            const fileNode = { name: 'test.txt', path: 'test.txt', type: 'file' as const };

            component.selectFile(fileNode);

            expect(component.selectedFile).toBe(fileNode);
            expect(component.fileContent).toBe('File content');
            expect(component.editorLines).toEqual(['File content']);
        });

        it('should handle empty file selection', () => {
            diskService.getFile.mockReturnValue(new Uint8Array(0));

            const fileNode = { name: 'empty.txt', path: 'empty.txt', type: 'file' as const };

            component.selectFile(fileNode);

            expect(component.fileContent).toBe('');
            expect(component.editorLines).toEqual(['']);
        });

        it('should handle null file data', () => {
            diskService.getFile.mockReturnValue(null);

            const fileNode = { name: 'null.txt', path: 'null.txt', type: 'file' as const };

            component.selectFile(fileNode);

            expect(component.fileContent).toBe('');
            expect(component.editorLines).toEqual(['']);
        });

        it('should update file content on text area input', () => {
            component.selectedFile = { name: 'edit.txt', path: 'edit.txt', type: 'file' };

            const event = {
                target: {
                    value: 'Updated content'
                }
            } as any;

            component.onTextAreaInput(event);

            expect(component.fileContent).toBe('Updated content');
            expect(diskService.saveFile).toHaveBeenCalled();
            
            const savedData = (diskService.saveFile as jest.Mock).mock.calls[0][1];
            const savedText = new TextDecoder().decode(savedData);
            expect(savedText).toBe('Updated content');
        });

        it('should split content into lines', () => {
            component.selectedFile = { name: 'lines.txt', path: 'lines.txt', type: 'file' };

            const event = {
                target: {
                    value: 'Line 1\nLine 2\nLine 3'
                }
            } as any;

            component.onTextAreaInput(event);

            expect(component.editorLines).toEqual(['Line 1', 'Line 2', 'Line 3']);
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
            component.fileContent = 'ABC';

            const hex = component.getHexContent();

            expect(hex).toContain('41 42 43');
            expect(hex).toContain('ABC');
        });

        it('should format hex with offset', () => {
            component.fileContent = 'Test';

            const hex = component.getHexContent();

            expect(hex).toContain('00000000');
        });

        it('should return empty string for empty content', () => {
            component.fileContent = '';

            const hex = component.getHexContent();

            expect(hex).toBe('');
        });

        it('should handle multi-line hex dump', () => {
            component.fileContent = 'A'.repeat(20);

            const hex = component.getHexContent();

            const lines = hex.split('\n').filter(l => l.length > 0);
            expect(lines.length).toBeGreaterThan(1);
        });

        it('should display non-printable chars as dots', () => {
            component.fileContent = String.fromCharCode(1, 2, 3);

            const hex = component.getHexContent();

            expect(hex).toContain('...');
        });
    });

    describe('Line Numbers', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should generate line numbers', () => {
            component.editorLines = ['Line 1', 'Line 2', 'Line 3'];

            const lineNumbers = component.getLineNumbers();

            expect(lineNumbers).toEqual([1, 2, 3]);
        });

        it('should generate line number for single line', () => {
            component.editorLines = ['Single line'];

            const lineNumbers = component.getLineNumbers();

            expect(lineNumbers).toEqual([1]);
        });

        it('should generate line numbers for empty lines', () => {
            component.editorLines = ['', '', ''];

            const lineNumbers = component.getLineNumbers();

            expect(lineNumbers).toEqual([1, 2, 3]);
        });
    });

    describe('Scroll Synchronization', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should synchronize scroll position', () => {
            const lineNumbers = document.createElement('div');
            lineNumbers.className = 'file-line-numbers';
            document.body.appendChild(lineNumbers);

            jest.spyOn(document, 'querySelector').mockReturnValue(lineNumbers);

            const event = {
                target: {
                    scrollTop: 100
                }
            } as any;

            component.onTextAreaScroll(event);

            expect(lineNumbers.scrollTop).toBe(100);

            document.body.removeChild(lineNumbers);
            jest.restoreAllMocks();
        });

        it('should handle missing line numbers element', () => {
            const event = {
                target: {
                    scrollTop: 100
                }
            } as any;

            expect(() => {
                component.onTextAreaScroll(event);
            }).not.toThrow();
        });
    });

    describe('File List Management', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should refresh file list from service', () => {
            diskService.getFileList.mockReturnValue(['file1.dat', 'file2.dat', 'file3.dat']);

            filesChangedSubject.next();

            expect(component.fileList.length).toBe(3);
            expect(component.fileList[0].path).toBe('file1.dat');
            expect(component.fileList[1].path).toBe('file2.dat');
            expect(component.fileList[2].path).toBe('file3.dat');
        });

        it('should create FileNode with correct properties', () => {
            diskService.getFileList.mockReturnValue(['test.txt']);

            filesChangedSubject.next();

            const fileNode = component.fileList[0];
            expect(fileNode.name).toBe('test.txt');
            expect(fileNode.path).toBe('test.txt');
            expect(fileNode.type).toBe('file');
        });

        it('should handle empty file list', () => {
            diskService.getFileList.mockReturnValue([]);

            filesChangedSubject.next();

            expect(component.fileList).toEqual([]);
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
