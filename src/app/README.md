# Application Components

This document describes all Angular UI components in the EduBASIC application.

## Component Architecture

All components are **standalone** (no NgModules) and follow Angular 19 best practices:
- Separate template (`.html`) and stylesheet (`.scss`) files
- SCSS for styling
- Reactive programming with RxJS where needed

## Root Component

### AppComponent

**Location**: `src/app/app.component.ts`

**Purpose**: Root component that manages the overall application layout and tab navigation.

**Key Features**:
- Manages tab switching via `TabSwitchService`
- Contains the main window with tabs for Console, Code, and Disk
- Renders the graphics output as a side panel (hidden while the Disk tab is active)
- Subscribes to tab switch requests and programmatically switches tabs

**Dependencies**:
- `TabSwitchService` - For receiving tab switch requests
- `TabsComponent` (ng-luna) - Tab container component

**Key Methods**:
- `ngOnInit()`: Subscribes to tab switch events
- `switchToTab(tabId: string)`: Programmatically switches to a specific tab

**Template Structure**:
```html
<luna-window>
  <luna-tabs>
    <luna-tab id="console">...</luna-tab>
    <luna-tab id="code">...</luna-tab>
    <luna-tab id="disk">...</luna-tab>
  </luna-tabs>
</luna-window>
```

## Console Component

### ConsoleComponent

**Location**: `src/app/console/console.component.ts`

**Purpose**: Interactive console for executing BASIC commands directly.

**Key Features**:
- Command input with Enter key execution
- Command history navigation (Arrow Up/Down)
- Displays command history with input/output/error types
- Integrates with `ConsoleService` for command execution

**Dependencies**:
- `ConsoleService` - For command execution and history management

**Key Properties**:
- `consoleHistory: ConsoleEntry[]` - Display history entries
- `currentInput: string` - Current input text

**Key Methods**:
- `onKeyDown(event: KeyboardEvent)`: Handles keyboard input
  - Enter: Executes command
  - Arrow Up: Previous command in history
  - Arrow Down: Next command in history

**Data Flow**:
```
User Input → ConsoleComponent.onKeyDown()
    ↓
ConsoleService.executeCommand()
    ↓
ExpressionParserService.parseExpression() OR ParserService.parseLine()
    ↓
Statement.execute()
    ↓
Results displayed in console/output
```

## Code Editor Component

### CodeEditorComponent

**Location**: `src/app/code-editor/code-editor.component.ts`

**Purpose**: Multi-line code editor for writing BASIC programs.

**Key Features**:
- Line numbers display
- Textarea for code input
- Synchronized scrolling between line numbers and editor
- Integration with DiskService for program persistence

**Key Properties**:
- `lines: string[]` - Array of code lines
- `currentLine: number` - Currently focused line

**Key Methods**:
- `ngOnInit()`: Subscribes to DiskService.programCode$ to load program
- `getLineNumbers()`: Returns array of line numbers for display
- `onTextAreaInput(event)`: Updates lines and saves to DiskService
- `onTextAreaScroll(event)`: Synchronizes line number scroll with editor scroll

**Dependencies**:
- `DiskService` - For loading and saving program code

**Integration**:
- Subscribes to `programCode$` observable to load program when disk changes
- Updates DiskService when code is edited
- Program code is automatically saved with disk

**UI Structure**:
- Left: Line numbers column
- Right: Textarea for code editing

## Output Component

### OutputComponent

**Location**: `src/app/output/output.component.ts`

**Purpose**: Displays graphics output from BASIC programs.

**Key Features**:
- Canvas-based rendering (640×480 pixels)
- Subscribes to `GraphicsService.buffer$` for updates
- Displays in a persistent output panel (not a separate tab)

**Dependencies**:
- `GraphicsService` - For graphics buffer updates

**Key Properties**:
- `isRunning: boolean` - Execution state indicator
- `canvasRef: ElementRef<HTMLCanvasElement>` - Canvas element reference

**Key Methods**:
- `ngAfterViewInit()`: 
  - Gets canvas 2D context
  - Sets context in GraphicsService
  - Subscribes to buffer updates
- `ngOnDestroy()`: Unsubscribes from buffer updates

**Rendering Flow**:
```
Graphics.flush() → GraphicsService.buffer$.next()
    ↓
OutputComponent subscription receives buffer
    ↓
context.putImageData(buffer, 0, 0)
    ↓
Canvas displays updated graphics
```

## Disk Component

### DiskComponent

**Location**: `src/app/disk/disk.component.ts`

**Purpose**: Project and data file management system. Manages complete projects (disks) containing BASIC program code and data files.

**Key Features**:
- Disk name editing
- New/Load/Save disk operations (ZIP format)
- Data file browser and editor
- Text and hex view modes for files
- File creation and deletion
- UTF-8 text encoding

**Key Properties**:
- `diskName: string` - Current disk name
- `fileList: FileNode[]` - List of data files on disk
- `selectedFile: FileNode | null` - Currently selected file
- `fileContent: string` - Content of selected file
- `viewMode: 'text' | 'hex'` - Current view mode

**Key Methods**:
- `onNewDisk()`: Creates a new empty disk
- `onLoadDisk()`: Loads a disk from ZIP file
- `onSaveDisk()`: Saves disk as ZIP file
- `onDiskNameChange()`: Updates disk name
- `onNewFile()`: Creates a new data file
- `onDeleteFile()`: Deletes selected file
- `selectFile(file)`: Loads file for editing
- `toggleViewMode()`: Switches between text and hex views
- `getHexContent()`: Converts file to hex dump format

**Dependencies**:
- `DiskService` - Disk and file management
- `FileSystemService` (via DiskService) - Virtual file system

**FileNode Interface**:
```typescript
interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
}
```

**UI Structure**:
- Left sidebar:
  - Disk controls (name, New/Load/Save buttons)
  - Data file list with + button
- Right pane:
  - File editor toolbar (name, Text/Hex toggle, Delete)
  - Text editor (with line numbers) or hex viewer

**Integration**:
- Data files are accessible from BASIC programs via file I/O statements
- Program code is stored in the virtual filesystem as `program.bas` (protected from deletion/rename)
- All files are persisted in ZIP format when disk is saved

See [Disk Component](disk/README.md) for detailed documentation.

## Related Documentation

For detailed documentation on specific components and services:

- **[Console Service](console/README.md)** - Console command execution and history management
- **[Disk Component](disk/README.md)** - Project and file management system
- **[Interpreter Services](interpreter/README.md)** - Interpreter, parser, tokenizer, and expression parser services

## Component Communication

### Service-Based Communication

Components communicate through Angular services:

1. **ConsoleService**: Console input/output
2. **GraphicsService**: Graphics buffer updates
3. **TabSwitchService**: Tab navigation requests
4. **InterpreterService**: Program execution state
5. **DiskService**: Disk and project management
6. **FileSystemService**: Virtual file system for BASIC file I/O

### Reactive Data Flow

- Services use RxJS `BehaviorSubject` and `Observable`
- Components subscribe in `ngOnInit()` and unsubscribe in `ngOnDestroy()`
- Use `takeUntil(destroy$)` pattern for cleanup

### Example: Tab Switching

```
PrintStatement.execute()
    ↓
runtime.requestTabSwitch('output')
    ↓
TabSwitchService.requestTabSwitch()
    ↓
TabSwitchService.switchTab$.next('output')
    ↓
AppComponent.subscribe() receives event
    ↓
AppComponent.switchToTab('output')
    ↓
TabsComponent.selectTab()
```

## Styling

All components use SCSS:
- Component-specific styles in `.component.scss` files
- Global styles in `src/index.scss`
- Theme variables in SCSS partials (`_theme.scss`, `_palette.scss`)

## Component Lifecycle

Standard Angular lifecycle hooks are used:
- `ngOnInit()`: Initialization and subscriptions
- `ngAfterViewInit()`: View initialization (for ViewChild access)
- `ngOnDestroy()`: Cleanup and unsubscriptions

## Future Enhancements

Potential additions:
- Syntax highlighting in code editor
- Code completion/suggestions
- File save/load functionality
- Multiple file tabs
- Split pane editing
