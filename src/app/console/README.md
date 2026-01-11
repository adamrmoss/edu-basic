# Console Service

This document describes the ConsoleService that manages console input/output and command execution.

## ConsoleService

**Location**: `src/app/console/console.service.ts`

**Purpose**: Manages console input/output and command execution.

**Key Responsibilities**:
- Executes console commands
- Maintains command history
- Displays input/output/error messages
- Coordinates with parser and interpreter

**Key Properties**:
- `displayHistory$: Observable<ConsoleEntry[]>` - Console display entries
- `inputHistory$: Observable<string[]>` - Command history
- `historyIndex$: Observable<number>` - Current history position

**Key Methods**:
- `executeCommand(command: string)`: Parses and executes command
- `printOutput(message: string)`: Adds output to display
- `printError(message: string)`: Adds error to display
- `navigateHistoryUp()`: Previous command in history
- `navigateHistoryDown()`: Next command in history

**Command Execution Flow**:
```
executeCommand(command)
    ↓
ParserService.parseLine()
    ↓
Get shared context from InterpreterService
    ↓
Statement.execute()
    ↓
Results displayed
```

**Dependencies**:
- `ParserService` - Command parsing
- `InterpreterService` - Execution context
- `GraphicsService` - Graphics instance
- `AudioService` - Audio instance

**ConsoleEntry Interface**:
```typescript
interface ConsoleEntry {
    type: 'input' | 'output' | 'error';
    text: string;
    timestamp: Date;
}
```

## History Management

**Input History**:
- Commands stored in `inputHistory$`
- Navigated with Arrow Up/Down keys
- History index tracked separately

**Display History**:
- All console output (input, output, error)
- Timestamped entries
- Displayed in console component

## Error Handling

Errors during command execution:
- Caught in `executeCommand()`
- Displayed via `printError()`
- Don't crash the application
- Error messages shown in console

## Integration

### With ConsoleComponent
- Component calls `executeCommand()` on Enter
- Component subscribes to `displayHistory$`
- Component uses history navigation methods

### With InterpreterService
- Uses shared execution context
- Executes statements in shared context
- Variables persist between commands
