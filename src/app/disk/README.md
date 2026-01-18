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
- `newDisk(name)`: Creates a new empty disk
- `loadDisk(file)`: Loads a disk from a `.disk` file
- `saveDisk()`: Saves the current disk as a `.disk` file
- `diskName` (getter/setter): Gets or sets the disk name
- `programCode` (getter/setter): Gets or sets the program code
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

Disks are saved as `.disk` files (ZIP archives) with the following structure:

```
project-name.disk
├── program.bas          # BASIC program code
├── disk.json           # Metadata (disk name, timestamps)
└── files/              # Virtual file system
    ├── data.txt
    ├── scores.bin
    └── ...
```

### disk.json Format

```json
{
  "name": "ProjectName",
  "created": "2026-01-12T10:30:00.000Z",
  "modified": "2026-01-12T15:45:00.000Z"
}
```

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

The CodeEditorComponent now integrates with DiskService:

1. Subscribes to `programCode$` observable
2. Updates editor when disk is loaded
3. Saves changes back to DiskService in real-time

This ensures that the program code is always synchronized with the current disk and will be saved when the disk is saved.

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
