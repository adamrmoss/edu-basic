import { TestBed } from '@angular/core/testing';
import { DiskService } from '@/app/disk/disk.service';
import { FileSystemService } from '@/app/disk/filesystem.service';
import JSZip from 'jszip';

describe('DiskService', () => {
    let service: DiskService;
    let fileSystemService: FileSystemService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DiskService, FileSystemService]
        });

        service = TestBed.inject(DiskService);
        fileSystemService = TestBed.inject(FileSystemService);
    });

    afterEach(() => {
        service.newDisk('Untitled');
    });

    describe('Initial State', () => {
        it('should create with default disk name', () => {
            expect(service.diskName).toBe('Untitled');
        });

        it('should create with empty program code', () => {
            expect(service.programCode).toBe('');
        });

        it('should have disk name getter', () => {
            expect(service.diskName).toBe('Untitled');
        });

        it('should have program code getter', () => {
            expect(service.programCode).toBe('');
        });
    });

    describe('Disk Name Management', () => {
        it('should set disk name', () => {
            service.diskName = 'MyProject';

            expect(service.diskName).toBe('MyProject');
        });

        it('should update disk name reactively', () => {
            const names: string[] = [];

            service.diskName$.subscribe((name: string) => {
                names.push(name);
            });

            service.diskName = 'Project1';
            service.diskName = 'Project2';

            expect(names).toContain('Untitled');
            expect(names).toContain('Project1');
            expect(names).toContain('Project2');
        });
    });

    describe('Program Code Management', () => {
        it('should set program code', () => {
            const code = '10 PRINT "Hello"\n20 END';
            service.programCode = code;

            expect(service.programCode).toBe(code);
        });

        it('should update program code reactively', () => {
            const codes: string[] = [];

            service.programCode$.subscribe((code: string) => {
                codes.push(code);
            });

            service.programCode = 'PRINT "A"';
            service.programCode = 'PRINT "B"';

            expect(codes).toContain('');
            expect(codes).toContain('PRINT "A"');
            expect(codes).toContain('PRINT "B"');
        });
    });

    describe('New Disk', () => {
        it('should create new disk with default name', () => {
            service.diskName = 'OldName';
            service.programCode = 'OLD CODE';
            fileSystemService.writeFile('old.dat', new Uint8Array([1, 2, 3]));

            service.newDisk();

            expect(service.diskName).toBe('Untitled');
            expect(service.programCode).toBe('');
            const files = fileSystemService.listFiles();
            expect(files.length).toBe(1);
            expect(files).toContain('program.bas');
        });

        it('should create new disk with custom name', () => {
            service.newDisk('NewProject');

            expect(service.diskName).toBe('NewProject');
            expect(service.programCode).toBe('');
            const files = fileSystemService.listFiles();
            expect(files.length).toBe(1);
            expect(files).toContain('program.bas');
        });

        it('should emit filesChanged on new disk', (done) => {
            let callCount = 0;

            service.filesChanged$.subscribe(() => {
                callCount++;
                if (callCount === 2) {
                    done();
                }
            });

            service.newDisk('Test');
        });
    });

    describe('File Management', () => {
        it('should get file list', () => {
            fileSystemService.writeFile('file1.dat', new Uint8Array([1]));
            fileSystemService.writeFile('file2.dat', new Uint8Array([2]));

            const files = service.getFileList();
            expect(files).toContain('file1.dat');
            expect(files).toContain('file2.dat');
        });

        it('should get file content', () => {
            const data = new Uint8Array([10, 20, 30]);
            fileSystemService.writeFile('test.dat', data);

            const result = service.getFile('test.dat');
            expect(result).toEqual(data);
        });

        it('should return null for non-existent file', () => {
            const result = service.getFile('nonexistent.dat');
            expect(result).toBeNull();
        });

        it('should save file', () => {
            const data = new Uint8Array([1, 2, 3]);
            service.saveFile('newfile.dat', data);

            expect(fileSystemService.fileExists('newfile.dat')).toBe(true);
            expect(fileSystemService.readFile('newfile.dat')).toEqual(data);
        });

        it('should emit filesChanged on save file', (done) => {
            let changeCount = 0;

            service.filesChanged$.subscribe(() => {
                changeCount++;
                
                if (changeCount === 2)
                {
                    done();
                }
            });

            service.saveFile('test.dat', new Uint8Array([1]));
        });

        it('should delete file', () => {
            fileSystemService.writeFile('delete.dat', new Uint8Array([1]));

            service.deleteFile('delete.dat');

            expect(fileSystemService.fileExists('delete.dat')).toBe(false);
        });

        it('should emit filesChanged on delete file', (done) => {
            fileSystemService.writeFile('delete.dat', new Uint8Array([1]));

            let changeCount = 0;

            service.filesChanged$.subscribe(() => {
                changeCount++;
                
                if (changeCount === 2)
                {
                    done();
                }
            });

            service.deleteFile('delete.dat');
        });

        it('should create empty file', () => {
            service.createFile('empty.dat');

            expect(fileSystemService.fileExists('empty.dat')).toBe(true);
            
            const data = fileSystemService.readFile('empty.dat');
            expect(data?.length).toBe(0);
        });

        it('should emit filesChanged on create file', (done) => {
            let changeCount = 0;

            service.filesChanged$.subscribe(() => {
                changeCount++;
                
                if (changeCount === 2)
                {
                    done();
                }
            });

            service.createFile('new.dat');
        });

        it('should not delete program.bas', () => {
            service.programCode = 'PRINT "X"';
            const before = service.getFile('program.bas');
            expect(before).not.toBeNull();

            service.deleteFile('program.bas');

            const after = service.getFile('program.bas');
            expect(after).not.toBeNull();
        });

        it('should update programCode when saving program.bas explicitly', () => {
            service.saveFile('program.bas', new TextEncoder().encode('PRINT "Z"'));
            expect(service.programCode).toBe('PRINT "Z"');
        });

        it('getProgramCodeFromFile returns empty string when file read returns null', () => {
            jest.spyOn(fileSystemService, 'readFile').mockReturnValue(null);
            expect(service.getProgramCodeFromFile()).toBe('');
        });

        it('renameFile should return false for program.bas', () => {
            service.programCode = 'PRINT "X"';
            expect(service.renameFile('program.bas', 'renamed.bas')).toBe(false);
        });

        it('renameFile should return false when source file does not exist', () => {
            expect(service.renameFile('missing.dat', 'new.dat')).toBe(false);
        });

        it('renameFile should copy bytes and remove old file', () => {
            service.saveFile('a.dat', new Uint8Array([1, 2, 3]));
            expect(service.renameFile('a.dat', 'b.dat')).toBe(true);
            expect(service.getFile('a.dat')).toBeNull();
            expect(service.getFile('b.dat')).toEqual(new Uint8Array([1, 2, 3]));
        });

        it('deleteDirectory should return false when not empty and true when empty', () => {
            service.createDirectory('dir');
            service.createFile('dir/a.dat');
            expect(service.deleteDirectory('dir')).toBe(false);

            service.deleteFile('dir/a.dat');
            expect(service.deleteDirectory('dir')).toBe(true);
        });

        it('isDirectory reflects filesystem state', () => {
            service.createDirectory('dir');
            expect(service.isDirectory('dir')).toBe(true);
            expect(service.isDirectory('missing')).toBe(false);
        });
    });

    describe('Save Disk', () => {
        beforeEach(() => {
            global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
            global.URL.revokeObjectURL = jest.fn();

            const mockLink = {
                href: '',
                download: '',
                click: jest.fn()
            };

            jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should save disk as ZIP with program code', async () => {
            service.diskName = 'TestDisk';
            service.programCode = '10 PRINT "TEST"';

            await service.saveDisk();

            expect(document.createElement).toHaveBeenCalledWith('a');
        });

        it('should include disk metadata in ZIP', async () => {
            service.diskName = 'MetadataTest';
            service.programCode = 'REM Test';

            await service.saveDisk();

            expect(document.createElement).toHaveBeenCalled();
        });

        it('should include files in ZIP', async () => {
            service.diskName = 'FilesTest';
            fileSystemService.writeFile('data.txt', new TextEncoder().encode('Hello'));

            await service.saveDisk();

            expect(document.createElement).toHaveBeenCalled();
        });

        it('should trigger download with correct filename', async () => {
            service.diskName = 'DownloadTest';

            await service.saveDisk();

            const createElement = document.createElement as jest.Mock;
            const mockLink = createElement.mock.results[0].value;

            expect(mockLink.download).toBe('DownloadTest.disk');
        });
    });

    describe('Load Disk', () => {
        async function createTestZip(diskName: string, programCode: string, files: Map<string, Uint8Array>, programPath: string = 'Program.bas'): Promise<File>
        {
            const zip = new JSZip();

            zip.file(programPath, programCode);

            for (const [path, data] of files.entries())
            {
                if (path.includes('/'))
                {
                    const parts = path.split('/');
                    let currentFolder: JSZip | null = zip;
                    
                    for (let i = 0; i < parts.length - 1; i++)
                    {
                        currentFolder = currentFolder.folder(parts[i]);
                        
                        if (!currentFolder)
                        {
                            break;
                        }
                    }
                    
                    if (currentFolder)
                    {
                        const buffer = new Uint8Array(data).buffer;
                        currentFolder.file(parts[parts.length - 1], buffer);
                    }
                }
                else
                {
                    const buffer = new Uint8Array(data).buffer;
                    zip.file(path, buffer);
                }
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            return new File([blob], `${diskName}.disk`, { type: 'application/zip' });
        }

        it('should load disk from ZIP', async () => {
            const files = new Map<string, Uint8Array>();
            files.set('data.txt', new TextEncoder().encode('Test data'));

            const zipFile = await createTestZip('LoadedDisk', 'PRINT "Loaded"', files);

            await service.loadDisk(zipFile);

            expect(service.diskName).toBe('LoadedDisk');
            expect(service.programCode).toBe('PRINT "Loaded"');
            expect(fileSystemService.listFiles()).toContain('data.txt');
        });

        it('should load program code from ZIP', async () => {
            const code = '10 PRINT "Hello"\n20 END';
            const zipFile = await createTestZip('TestProgram', code, new Map());

            await service.loadDisk(zipFile);

            expect(service.programCode).toBe(code);
        });

        it('should load files from ZIP', async () => {
            fileSystemService.clear();
            
            const files = new Map<string, Uint8Array>();
            files.set('file1.dat', new Uint8Array([1, 2, 3]));
            files.set('file2.dat', new Uint8Array([4, 5, 6]));

            const zipFile = await createTestZip('FilesTest', '', files);

            await service.loadDisk(zipFile);

            const loadedFiles = fileSystemService.listFiles();
            expect(loadedFiles.length).toBe(3);
            expect(loadedFiles).toContain('program.bas');
            expect(loadedFiles).toContain('file1.dat');
            expect(loadedFiles).toContain('file2.dat');
            expect(fileSystemService.readFile('file1.dat')).toEqual(new Uint8Array([1, 2, 3]));
            expect(fileSystemService.readFile('file2.dat')).toEqual(new Uint8Array([4, 5, 6]));
        });

        it('should use filename as disk name', async () => {
            const zip = new JSZip();
            zip.file('Program.bas', 'TEST');

            const blob = await zip.generateAsync({ type: 'blob' });
            const file = new File([blob], 'FromFilename.disk', { type: 'application/zip' });

            await service.loadDisk(file);

            expect(service.diskName).toBe('FromFilename');
        });

        it('should load legacy program.bas from ZIP for backwards compatibility', async () =>
        {
            const files = new Map<string, Uint8Array>();
            const zipFile = await createTestZip('LegacyDisk', 'PRINT "Legacy"', files, 'program.bas');

            await service.loadDisk(zipFile);

            expect(service.diskName).toBe('LegacyDisk');
            expect(service.programCode).toBe('PRINT "Legacy"');
            expect(fileSystemService.fileExists('program.bas')).toBe(true);
        });

        it('should handle ZIP without program file', async () => {
            const zip = new JSZip();
            zip.file('data.txt', 'some data');

            const blob = await zip.generateAsync({ type: 'blob' });
            const file = new File([blob], 'test.disk', { type: 'application/zip' });

            await service.loadDisk(file);

            expect(service.programCode).toBe('');
            expect(fileSystemService.fileExists('data.txt')).toBe(true);
        });

        it('should emit filesChanged on load', async () => {
            const files = new Map<string, Uint8Array>();
            files.set('test.dat', new Uint8Array([1]));

            const zipFile = await createTestZip('EmitTest', '', files);

            let emitted = false;
            
            service.filesChanged$.subscribe(() => {
                emitted = true;
            });

            await service.loadDisk(zipFile);

            expect(emitted).toBe(true);
        });

        it('should clear existing files before loading', async () => {
            fileSystemService.writeFile('old.dat', new Uint8Array([1]));

            const files = new Map<string, Uint8Array>();
            files.set('new.dat', new Uint8Array([2]));

            const zipFile = await createTestZip('ClearTest', '', files);

            await service.loadDisk(zipFile);

            expect(fileSystemService.fileExists('old.dat')).toBe(false);
            expect(fileSystemService.fileExists('new.dat')).toBe(true);
        });
    });
});
