import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeEditorComponent } from '../src/app/code-editor/code-editor.component';
import { DiskService } from '../src/app/disk.service';
import { FileSystemService } from '../src/app/filesystem.service';

describe('CodeEditorComponent - Disk Integration', () => {
    let component: CodeEditorComponent;
    let fixture: ComponentFixture<CodeEditorComponent>;
    let diskService: DiskService;
    let fileSystemService: FileSystemService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CodeEditorComponent],
            providers: [DiskService, FileSystemService]
        }).compileComponents();

        diskService = TestBed.inject(DiskService);
        fileSystemService = TestBed.inject(FileSystemService);
        fixture = TestBed.createComponent(CodeEditorComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        diskService.newDisk('Untitled');
        fileSystemService.clear();
    });

    describe('Program Code Synchronization', () => {
        it('should load program code from disk service on init', (done) => {
            diskService.setProgramCode('10 PRINT "Hello"\n20 END');

            fixture.detectChanges();

            setTimeout(() => {
                expect(component.lines).toEqual(['10 PRINT "Hello"', '20 END']);
                done();
            }, 10);
        });

        it('should start with empty lines if disk has no program', (done) => {
            diskService.setProgramCode('');

            fixture.detectChanges();

            setTimeout(() => {
                expect(component.lines).toEqual(['']);
                done();
            }, 10);
        });

        it('should update when disk program code changes', (done) => {
            fixture.detectChanges();

            diskService.setProgramCode('NEW CODE');

            setTimeout(() => {
                expect(component.lines).toEqual(['NEW CODE']);
                done();
            }, 10);
        });

        it('should save code to disk service on text input', () => {
            fixture.detectChanges();

            const event = {
                target: {
                    value: '10 PRINT "Test"\n20 END'
                }
            } as any;

            component.onTextAreaInput(event);

            expect(diskService.programCode).toBe('10 PRINT "Test"\n20 END');
        });

        it('should update lines array on input', () => {
            fixture.detectChanges();

            const event = {
                target: {
                    value: 'Line 1\nLine 2\nLine 3'
                }
            } as any;

            component.onTextAreaInput(event);

            expect(component.lines).toEqual(['Line 1', 'Line 2', 'Line 3']);
        });
    });

    describe('New Disk Integration', () => {
        it('should clear code editor when new disk created', (done) => {
            diskService.setProgramCode('OLD CODE');
            fixture.detectChanges();

            diskService.newDisk('NewDisk');

            setTimeout(() => {
                expect(component.lines).toEqual(['']);
                done();
            }, 10);
        });

        it('should load code when disk loaded', async () => {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();

            const programCode = '10 PRINT "Loaded"\n20 END';
            zip.file('program.bas', programCode);
            zip.file('disk.json', JSON.stringify({
                name: 'LoadedDisk',
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }));

            const blob = await zip.generateAsync({ type: 'blob' });
            const file = new File([blob], 'test.zip', { type: 'application/zip' });

            fixture.detectChanges();

            await diskService.loadDisk(file);

            await new Promise(resolve => setTimeout(resolve, 10));
            
            expect(component.lines).toEqual(['10 PRINT "Loaded"', '20 END']);
        });
    });

    describe('Reactive Updates', () => {
        it('should handle multiple rapid updates', (done) => {
            fixture.detectChanges();

            diskService.setProgramCode('Update 1');
            diskService.setProgramCode('Update 2');
            diskService.setProgramCode('Update 3');

            setTimeout(() => {
                expect(component.lines).toEqual(['Update 3']);
                done();
            }, 20);
        });

        it('should handle empty program code updates', (done) => {
            diskService.setProgramCode('Some code');
            fixture.detectChanges();

            diskService.setProgramCode('');

            setTimeout(() => {
                expect(component.lines).toEqual(['']);
                done();
            }, 10);
        });

        it('should handle multiline program updates', (done) => {
            fixture.detectChanges();

            const multilineCode = '10 REM Start\n20 PRINT "A"\n30 PRINT "B"\n40 END';
            diskService.setProgramCode(multilineCode);

            setTimeout(() => {
                expect(component.lines.length).toBe(4);
                expect(component.lines[0]).toBe('10 REM Start');
                expect(component.lines[3]).toBe('40 END');
                done();
            }, 10);
        });
    });

    describe('Line Number Generation', () => {
        it('should generate correct line numbers', () => {
            component.lines = ['Line 1', 'Line 2', 'Line 3'];

            const lineNumbers = component.getLineNumbers();

            expect(lineNumbers).toEqual([1, 2, 3]);
        });

        it('should update line numbers when code changes', () => {
            fixture.detectChanges();

            const event = {
                target: {
                    value: 'A\nB\nC\nD\nE'
                }
            } as any;

            component.onTextAreaInput(event);

            const lineNumbers = component.getLineNumbers();
            expect(lineNumbers).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('Scroll Synchronization', () => {
        it('should synchronize scroll between textarea and line numbers', () => {
            fixture.detectChanges();

            const lineNumbers = document.createElement('div');
            lineNumbers.className = 'line-numbers';
            document.body.appendChild(lineNumbers);

            jest.spyOn(document, 'querySelector').mockReturnValue(lineNumbers);

            const event = {
                target: {
                    scrollTop: 150
                }
            } as any;

            component.onTextAreaScroll(event);

            expect(lineNumbers.scrollTop).toBe(150);

            document.body.removeChild(lineNumbers);
            jest.restoreAllMocks();
        });

        it('should handle missing line numbers element gracefully', () => {
            fixture.detectChanges();

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

    describe('Component Lifecycle', () => {
        it('should subscribe to program code on init', () => {
            const subscribeSpy = jest.spyOn(diskService.programCode$, 'pipe');

            fixture.detectChanges();

            expect(subscribeSpy).toHaveBeenCalled();
        });

        it('should unsubscribe on destroy', () => {
            fixture.detectChanges();

            const destroySpy = jest.spyOn(component['destroy$'], 'next');
            const completeSpy = jest.spyOn(component['destroy$'], 'complete');

            component.ngOnDestroy();

            expect(destroySpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });

        it('should not receive updates after destroy', (done) => {
            fixture.detectChanges();

            const initialLines = [...component.lines];

            component.ngOnDestroy();

            diskService.setProgramCode('Should not update');

            setTimeout(() => {
                expect(component.lines).toEqual(initialLines);
                done();
            }, 10);
        });
    });

    describe('Edge Cases', () => {
        it('should handle program code with no newlines', (done) => {
            fixture.detectChanges();

            diskService.setProgramCode('PRINT "Single line"');

            setTimeout(() => {
                expect(component.lines).toEqual(['PRINT "Single line"']);
                done();
            }, 10);
        });

        it('should handle program code with trailing newline', (done) => {
            fixture.detectChanges();

            diskService.setProgramCode('Line 1\n');

            setTimeout(() => {
                expect(component.lines).toEqual(['Line 1', '']);
                done();
            }, 10);
        });

        it('should handle program code with empty lines', (done) => {
            fixture.detectChanges();

            diskService.setProgramCode('Line 1\n\nLine 3');

            setTimeout(() => {
                expect(component.lines).toEqual(['Line 1', '', 'Line 3']);
                done();
            }, 10);
        });

        it('should handle very long programs', (done) => {
            fixture.detectChanges();

            const longProgram = Array.from({ length: 100 }, (_, i) => `${(i + 1) * 10} PRINT "${i}"`).join('\n');
            diskService.setProgramCode(longProgram);

            setTimeout(() => {
                expect(component.lines.length).toBe(100);
                expect(component.lines[0]).toBe('10 PRINT "0"');
                expect(component.lines[99]).toBe('1000 PRINT "99"');
                done();
            }, 10);
        });

        it('should handle special characters in code', (done) => {
            fixture.detectChanges();

            diskService.setProgramCode('PRINT "Hello 世界 🌍"');

            setTimeout(() => {
                expect(component.lines).toEqual(['PRINT "Hello 世界 🌍"']);
                done();
            }, 10);
        });
    });

    describe('Bidirectional Synchronization', () => {
        it('should update disk when editor changes', () => {
            fixture.detectChanges();

            const code1 = 'PRINT "A"';
            const event1 = { target: { value: code1 } } as any;
            component.onTextAreaInput(event1);

            expect(diskService.programCode).toBe(code1);

            const code2 = 'PRINT "B"';
            const event2 = { target: { value: code2 } } as any;
            component.onTextAreaInput(event2);

            expect(diskService.programCode).toBe(code2);
        });

        it('should update editor when disk changes', (done) => {
            fixture.detectChanges();

            diskService.setProgramCode('From Disk 1');

            setTimeout(() => {
                expect(component.lines).toEqual(['From Disk 1']);

                diskService.setProgramCode('From Disk 2');

                setTimeout(() => {
                    expect(component.lines).toEqual(['From Disk 2']);
                    done();
                }, 10);
            }, 10);
        });
    });
});
