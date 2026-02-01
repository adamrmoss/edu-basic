import { FileSystemService } from '@/app/disk/filesystem.service';

describe('FileSystemService', () => {
    let service: FileSystemService;

    beforeEach(() => {
        service = new FileSystemService();
    });

    afterEach(() => {
        service.clear();
    });

    describe('File Management', () => {
        it('should start with no files', () => {
            expect(service.listFiles()).toEqual([]);
        });

        it('should write and read a file', () => {
            const data = new Uint8Array([1, 2, 3, 4, 5]);
            service.writeFile('test.dat', data);

            const retrieved = service.readFile('test.dat');
            expect(retrieved).toEqual(data);
        });

        it('should return null for non-existent file', () => {
            const result = service.readFile('nonexistent.dat');
            expect(result).toBeNull();
        });

        it('should check if file exists', () => {
            const data = new Uint8Array([1, 2, 3]);
            service.writeFile('exists.dat', data);

            expect(service.fileExists('exists.dat')).toBe(true);
            expect(service.fileExists('notexists.dat')).toBe(false);
        });

        it('should delete a file', () => {
            const data = new Uint8Array([1, 2, 3]);
            service.writeFile('delete.dat', data);

            expect(service.fileExists('delete.dat')).toBe(true);
            
            const deleted = service.deleteFile('delete.dat');
            expect(deleted).toBe(true);
            expect(service.fileExists('delete.dat')).toBe(false);
        });

        it('should return false when deleting non-existent file', () => {
            const deleted = service.deleteFile('nonexistent.dat');
            expect(deleted).toBe(false);
        });

        it('should list all files', () => {
            service.writeFile('file1.dat', new Uint8Array([1]));
            service.writeFile('file2.dat', new Uint8Array([2]));
            service.writeFile('file3.dat', new Uint8Array([3]));

            const files = service.listFiles();
            expect(files).toContain('file1.dat');
            expect(files).toContain('file2.dat');
            expect(files).toContain('file3.dat');
            expect(files.length).toBe(3);
        });

        it('should clear all files', () => {
            service.writeFile('file1.dat', new Uint8Array([1]));
            service.writeFile('file2.dat', new Uint8Array([2]));

            expect(service.listFiles().length).toBe(2);

            service.clear();
            expect(service.listFiles().length).toBe(0);
        });

        it('should get all files as map', () => {
            const data1 = new Uint8Array([1, 2, 3]);
            const data2 = new Uint8Array([4, 5, 6]);

            service.writeFile('file1.dat', data1);
            service.writeFile('file2.dat', data2);

            const allFiles = service.getAllFiles();
            expect(allFiles.size).toBe(2);
            expect(allFiles.get('file1.dat')).toEqual(data1);
            expect(allFiles.get('file2.dat')).toEqual(data2);
        });

        it('should set all files from map', () => {
            const files = new Map<string, Uint8Array>();
            files.set('file1.dat', new Uint8Array([1, 2]));
            files.set('file2.dat', new Uint8Array([3, 4]));

            service.setAllFiles(files);

            expect(service.listFiles().length).toBe(2);
            expect(service.readFile('file1.dat')).toEqual(new Uint8Array([1, 2]));
            expect(service.readFile('file2.dat')).toEqual(new Uint8Array([3, 4]));
        });
    });

    describe('File Handle Operations', () => {
        it('should open file for reading', () => {
            const data = new Uint8Array([1, 2, 3, 4, 5]);
            service.writeFile('test.dat', data);

            const handle = service.openFile('test.dat', 'read');
            expect(handle).toBeGreaterThan(0);

            service.closeFile(handle);
        });

        it('should throw error when opening non-existent file for reading', () => {
            expect(() => {
                service.openFile('nonexistent.dat', 'read');
            }).toThrow('File not found: nonexistent.dat');
        });

        it('should open file for writing', () => {
            const handle = service.openFile('newfile.dat', 'write');
            expect(handle).toBeGreaterThan(0);

            service.closeFile(handle);
        });

        it('should open file for appending', () => {
            const data = new Uint8Array([1, 2, 3]);
            service.writeFile('append.dat', data);

            const handle = service.openFile('append.dat', 'append');
            expect(handle).toBeGreaterThan(0);

            service.closeFile(handle);
        });

        it('should generate unique handle IDs', () => {
            const handle1 = service.openFile('file1.dat', 'write');
            const handle2 = service.openFile('file2.dat', 'write');

            expect(handle1).not.toBe(handle2);

            service.closeFile(handle1);
            service.closeFile(handle2);
        });

        it('should throw error when closing invalid handle', () => {
            expect(() => {
                service.closeFile(999);
            }).toThrow('Invalid file handle: 999');
        });
    });

    describe('Read Operations', () => {
        it('should read bytes from file', () => {
            const data = new Uint8Array([10, 20, 30, 40, 50]);
            service.writeFile('read.dat', data);

            const handle = service.openFile('read.dat', 'read');
            const result = service.readBytes(handle, 3);

            expect(result).toEqual(new Uint8Array([10, 20, 30]));

            service.closeFile(handle);
        });

        it('should advance position after reading', () => {
            const data = new Uint8Array([10, 20, 30, 40, 50]);
            service.writeFile('read.dat', data);

            const handle = service.openFile('read.dat', 'read');
            service.readBytes(handle, 2);
            
            const result = service.readBytes(handle, 2);
            expect(result).toEqual(new Uint8Array([30, 40]));

            service.closeFile(handle);
        });

        it('should not read past end of file', () => {
            const data = new Uint8Array([10, 20, 30]);
            service.writeFile('read.dat', data);

            const handle = service.openFile('read.dat', 'read');
            const result = service.readBytes(handle, 100);

            expect(result.length).toBe(3);
            expect(result).toEqual(new Uint8Array([10, 20, 30]));

            service.closeFile(handle);
        });

        it('should throw error when reading from write-only handle', () => {
            const handle = service.openFile('write.dat', 'write');

            expect(() => {
                service.readBytes(handle, 5);
            }).toThrow('File not opened for reading: write.dat');

            service.closeFile(handle);
        });
    });

    describe('Write Operations', () => {
        it('should write bytes to file', () => {
            const handle = service.openFile('write.dat', 'write');
            const data = new Uint8Array([10, 20, 30]);

            service.writeBytes(handle, data);
            service.closeFile(handle);

            const result = service.readFile('write.dat');
            expect(result).toEqual(data);
        });

        it('should append bytes to existing file', () => {
            const handle = service.openFile('write.dat', 'write');
            service.writeBytes(handle, new Uint8Array([10, 20]));
            service.writeBytes(handle, new Uint8Array([30, 40]));
            service.closeFile(handle);

            const result = service.readFile('write.dat');
            expect(result).toEqual(new Uint8Array([10, 20, 30, 40]));
        });

        it('should throw error when writing to read-only handle', () => {
            const data = new Uint8Array([1, 2, 3]);
            service.writeFile('read.dat', data);

            const handle = service.openFile('read.dat', 'read');

            expect(() => {
                service.writeBytes(handle, new Uint8Array([5]));
            }).toThrow('File not opened for writing: read.dat');

            service.closeFile(handle);
        });

        it('should start append mode at end of file', () => {
            service.writeFile('append.dat', new Uint8Array([1, 2, 3]));

            const handle = service.openFile('append.dat', 'append');
            service.writeBytes(handle, new Uint8Array([4, 5]));
            service.closeFile(handle);

            const result = service.readFile('append.dat');
            expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
        });
    });

    describe('Position Operations', () => {
        it('should seek to position', () => {
            const data = new Uint8Array([10, 20, 30, 40, 50]);
            service.writeFile('seek.dat', data);

            const handle = service.openFile('seek.dat', 'read');
            service.seek(handle, 2);

            const result = service.readBytes(handle, 2);
            expect(result).toEqual(new Uint8Array([30, 40]));

            service.closeFile(handle);
        });

        it('should get current position with tell', () => {
            const data = new Uint8Array([10, 20, 30, 40, 50]);
            service.writeFile('tell.dat', data);

            const handle = service.openFile('tell.dat', 'read');
            
            expect(service.tell(handle)).toBe(0);
            
            service.readBytes(handle, 3);
            expect(service.tell(handle)).toBe(3);

            service.closeFile(handle);
        });

        it('should detect EOF', () => {
            const data = new Uint8Array([10, 20, 30]);
            service.writeFile('eof.dat', data);

            const handle = service.openFile('eof.dat', 'read');
            
            expect(service.eof(handle)).toBe(false);
            
            service.readBytes(handle, 3);
            expect(service.eof(handle)).toBe(true);

            service.closeFile(handle);
        });

        it('should get file size', () => {
            const data = new Uint8Array([10, 20, 30, 40, 50]);
            service.writeFile('size.dat', data);

            const handle = service.openFile('size.dat', 'read');
            expect(service.getFileSize(handle)).toBe(5);

            service.closeFile(handle);
        });

        it('should throw error for invalid handle in position operations', () => {
            expect(() => service.seek(999, 0)).toThrow('Invalid file handle: 999');
            expect(() => service.tell(999)).toThrow('Invalid file handle: 999');
            expect(() => service.eof(999)).toThrow('Invalid file handle: 999');
            expect(() => service.getFileSize(999)).toThrow('Invalid file handle: 999');
        });
    });

    describe('Handle Cleanup', () => {
        it('should close handle and persist write changes', () => {
            const handle = service.openFile('persist.dat', 'write');
            service.writeBytes(handle, new Uint8Array([1, 2, 3]));
            service.closeFile(handle);

            const result = service.readFile('persist.dat');
            expect(result).toEqual(new Uint8Array([1, 2, 3]));
        });

        it('should clear all handles on clear', () => {
            const handle1 = service.openFile('file1.dat', 'write');
            const handle2 = service.openFile('file2.dat', 'write');

            service.clear();

            expect(() => service.closeFile(handle1)).toThrow();
            expect(() => service.closeFile(handle2)).toThrow();
        });
    });
});
