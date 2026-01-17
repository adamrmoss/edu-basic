# Architecture Overview

## System Architecture

EduBASIC is a browser-based BASIC interpreter built with Angular 19. The system is divided into several major layers:

```
┌─────────────────────────────────────────────────────────┐
│                    Angular UI Layer                     │
│  (Components: Console, Code Editor, Output, Files)      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Service Layer                          │
│  (InterpreterService, ParserService, GraphicsService,   │
│   AudioService, ConsoleService, TabSwitchService)       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                Language Core Layer                      │
│  (Program, ExecutionContext, RuntimeExecution)          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            Expression & Statement Layer                 │
│  (Expressions: arithmetic, logical, etc.)               │
│  (Statements: PRINT, IF, FOR, etc.)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Runtime Systems Layer                      │
│  (Graphics, Audio, Grit Synthesis)                      │
└─────────────────────────────────────────────────────────┘
```

## Core Principles

### 1. Shared Execution Context
- A single `ExecutionContext` instance persists across all console commands
- Variables and program state are maintained between statements
- This allows interactive programming where each command builds on previous state

### 2. Statement-Based Execution
- All code is parsed into `Statement` objects
- Statements are executed one at a time in console mode
- Full programs can be executed step-by-step via `RuntimeExecution`

### 3. Expression Evaluation
- Expressions are evaluated lazily when needed
- All expressions return `EduBasicValue` (discriminated union type)
- Type coercion happens automatically based on context

### 4. Reactive Graphics
- Graphics operations update an internal buffer
- Buffer changes are emitted via RxJS observables
- UI components subscribe to buffer updates for rendering

### 5. Service-Based Communication
- Angular services manage cross-component communication
- Services use RxJS for reactive data flow
- Tab switching, console output, and graphics updates use observables

## Data Flow

### Console Command Execution Flow

```
User Input (Console)
    ↓
ConsoleService.executeCommand()
    ↓
ParserService.parseLine()
    ↓
Statement.execute()
    ↓
RuntimeExecution (if needed)
    ↓
Graphics/Audio operations
    ↓
GraphicsService.buffer$ / AudioService
    ↓
UI Components (Output, etc.)
```

### Graphics Rendering Flow

```
Statement (e.g., PRINT)
    ↓
Graphics.printText()
    ↓
Graphics.drawChar() → buffer updates
    ↓
Graphics.flush() → callback triggered
    ↓
GraphicsService.buffer$.next()
    ↓
OutputComponent subscribes
    ↓
Canvas rendering
```

## Key Components

### Application Layer (`src/app/`)
- **Components**: UI components for console, editor, output, files
- **Services**: Angular services for interpreter, parser, graphics, audio
- **Root**: AppComponent manages tab switching and overall layout

### Language Core (`src/lang/`)
- **Types**: `EduBasicValue`, `EduBasicType` - value system
- **Execution**: `ExecutionContext`, `RuntimeExecution`, `Program`
- **Expressions**: Abstract expression classes and implementations
- **Statements**: Abstract statement class and all statement types
- **Graphics**: `Graphics` class for rendering operations
- **Audio**: `Audio` class for sound synthesis

### Grit Synthesis (`src/grit/`)
- Audio synthesis system using Web Audio API
- ADSR envelopes, noise generation, voice management
- AudioWorklet for real-time processing

## State Management

### Shared State
- **ExecutionContext**: Global and local variables
- **Program**: Statement collection and label mapping
- **Graphics**: Canvas buffer and rendering state
- **Audio**: Voice configurations and scheduled notes

### Component State
- **ConsoleService**: Command history and display
- **InterpreterService**: Program state and execution state
- **GraphicsService**: Graphics instance and buffer observable
- **AudioService**: Audio instance

## Extension Points

### Adding New Statements
1. Create statement class extending `Statement`
2. Implement `execute()` method
3. Add parsing logic to `ParserService.parseStatement()`
4. Register in parser's statement dispatch

### Adding New Expressions
1. Create expression class extending `Expression`
2. Implement `evaluate()` method
3. Add parsing logic to `ExpressionParserService`
4. Handle operator precedence if needed

### Adding New Graphics Operations
1. Add method to `Graphics` class
2. Update buffer as needed
3. Call `flush()` to trigger UI update
4. Optionally trigger tab switch via `RuntimeExecution`

## Dependencies

### External
- **Angular 19**: Framework
- **ng-luna**: UI components
- **RxJS**: Reactive programming

### Internal
- All language features are self-contained
- No external BASIC interpreter libraries
- Custom parser and runtime implementation
