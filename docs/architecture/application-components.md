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
- Contains the main window with tabs for Console, Code, Files, and Output
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
    <luna-tab id="files">...</luna-tab>
    <luna-tab id="output">...</luna-tab>
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
ParserService.parseLine()
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

**Key Properties**:
- `lines: string[]` - Array of code lines
- `currentLine: number` - Currently focused line

**Key Methods**:
- `getLineNumbers()`: Returns array of line numbers for display
- `onTextAreaInput(event)`: Updates lines array when text changes
- `onTextAreaScroll(event)`: Synchronizes line number scroll with editor scroll

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
- Automatically switches to this tab when graphics operations occur

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

## Files Component

### FilesComponent

**Location**: `src/app/files/files.component.ts`

**Purpose**: File browser and editor for managing BASIC source files.

**Key Features**:
- File tree navigation
- File selection and editing
- Text and hex view modes
- Line numbers in text mode
- Synchronized scrolling

**Key Properties**:
- `fileTree: FileNode[]` - File system tree structure
- `selectedFile: FileNode | null` - Currently selected file
- `editorLines: string[]` - Lines of selected file
- `viewMode: 'text' | 'hex'` - Current view mode

**Key Methods**:
- `selectFile(file: FileNode)`: Selects a file for editing
- `getLineNumbers()`: Returns line numbers for display
- `onTextAreaInput(event)`: Updates file content when edited
- `onTextAreaScroll(event)`: Synchronizes line number scroll
- `toggleViewMode()`: Switches between text and hex views
- `getHexContent()`: Converts file content to hex dump format

**FileNode Interface**:
```typescript
interface FileNode {
    name: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    content?: string;
}
```

**UI Structure**:
- Left: File tree pane with folder/file icons
- Right: Editor pane with:
  - Toolbar (file name, view mode toggle)
  - Text editor (with line numbers) or hex viewer

## Component Communication

### Service-Based Communication

Components communicate through Angular services:

1. **ConsoleService**: Console input/output
2. **GraphicsService**: Graphics buffer updates
3. **TabSwitchService**: Tab navigation requests
4. **InterpreterService**: Program execution state

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
