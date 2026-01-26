# Disk Component

The Disk component provides a complete project management system for EduBASIC applications. A "disk" represents an entire project including the BASIC program code and all associated data files.

## Overview

The disk system allows students to:
- Create, load, and save complete projects as `.disk` files
- Manage data files separately from the program code
- Edit data files in text or hex mode (UTF-8 encoding)
- Access data files from BASIC programs using file I/O statements

## Architecture

### DiskService

**Location**: `src/app/disk.service.ts`

**Purpose**: Manages the current disk state including disk name, program code, and the virtual file system.

**Key Features**:
- Disk file serialization/deserialization using JSZip (ZIP format with `.disk` extension)
- Observable streams for disk name, program code, and file changes
- Integration with FileSystemService for virtual file management

**Key Methods**:
- `newDisk(name)`: Creates a new empty disk (creates `program.bas` in filesystem)
- `loadDisk(file)`: Loads a disk from a `.disk` file (loads `program.bas` into filesystem)
- `saveDisk()`: Saves the current disk as a `.disk` file (reads `program.bas` from filesystem)
- `diskName` (getter/setter): Gets or sets the disk name
- `programCode` (getter/setter): Gets or sets the program code (syncs with `program.bas` file)
- `getProgramCodeFromFile()`: Reads program code from `program.bas` file (source of truth for execution)
- `getFile(path)`, `saveFile(path, data)`, `deleteFile(path)`: File management

### FileSystemService

**Location**: `src/app/filesystem.service.ts`

**Purpose**: Provides an in-memory virtual file system for BASIC file I/O operations.

**Key Features**:
- File handle management (open, close)
- Read/write operations with byte-level access
- File position tracking (seek, tell)
- EOF detection

**Key Methods**:
- `openFile(path, mode)`: Opens a file and returns a handle ID
- `closeFile(handleId)`: Closes an open file handle
- `readBytes(handleId, count)`: Reads bytes from a file
- `writeBytes(handleId, data)`: Writes bytes to a file
- `seek(handleId, position)`: Sets file position
- `tell(handleId)`: Gets current file position
- `eof(handleId)`: Checks if at end of file

### DiskComponent

**Location**: `src/app/disk/disk.component.ts`

**Purpose**: UI component for disk and file management.

**Key Features**:
- Disk name editing
- New/Load/Save disk buttons
- File list viewer
- Text/hex file editor
- File creation and deletion

**Integration**:
- Subscribes to DiskService for disk name and file changes
- Updates CodeEditorComponent indirectly through DiskService
- Provides file editing interface for data files

## Disk File Format

Disks are saved as `.disk` files (ZIP archives) that directly represent the file system structure:

```
project-name.disk
├── program.bas          # BASIC program code
├── data.txt            # Files at root level
├── scores.bin
└── folder/             # Nested directories
    ├── file1.txt
    └── subfolder/
        └── file2.txt
```

The ZIP file structure exactly matches the in-memory file system - all files and directories are stored at their relative paths, with no additional metadata files or wrapper folders.

## BASIC File I/O Integration

The virtual file system is accessible from BASIC programs through file I/O statements:

### Implemented Statements

- `OPEN "filename" FOR READ/WRITE/APPEND AS handle%`
- `CLOSE handle%`
- `READFILE "filename" INTO content$`
- `WRITEFILE content$ TO "filename"`

### Example Usage

```basic
REM Write data to a file
WRITEFILE "Hello, World!" TO "greeting.txt"

REM Read data from a file
READFILE "greeting.txt" INTO message$
PRINT message$

REM Binary file operations
OPEN "data.bin" FOR WRITE AS file%
WRITE 42 TO file%
WRITE 3.14 TO file%
CLOSE file%
```

## Integration with CodeEditorComponent

The CodeEditorComponent integrates with DiskService:

1. Subscribes to `programCode$` observable to display code in the editor
2. Updates `program.bas` file when code is edited (via `programCode` setter)
3. Reads from `program.bas` file when running programs (via `getProgramCodeFromFile()`)

**Key Architecture Points:**
- `program.bas` is stored in the filesystem and appears in the file hierarchy
- The `programCode$` observable is kept in sync with `program.bas` for UI updates
- When running a program, the Program object is derived from `program.bas` file (source of truth)
- Changes in the code editor immediately update `program.bas` in the filesystem
- Changes to `program.bas` in the disk file editor immediately update the code editor

## User Workflow

1. **New Project**: Click "New" button, enter disk name
2. **Load Project**: Click "Load" button, select `.disk` file
3. **Edit Program**: Use Code tab to edit BASIC program
4. **Manage Files**: Use Disk tab to create/edit/delete data files
5. **Save Project**: Click "Save" button to download `.disk` file

## Technical Notes

- All text files use UTF-8 encoding
- Files are stored as binary (`Uint8Array`) internally
- Hex editor displays byte-level view of files
- File paths are relative to the disk root
- File system is cleared when loading a new disk
