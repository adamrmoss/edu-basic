# Runtime Execution Engine

This document describes the runtime execution engine that manages program execution flow.

## RuntimeExecution Class

**Location**: `src/lang/runtime-execution.ts`

Manages step-by-step program execution with control flow handling.

## Key Responsibilities

- Step-by-step statement execution
- Control structure management (IF, WHILE, FOR, DO)
- Control stack management
- Tab switching coordination
- Program counter management

## Control Structure Frames

**ControlStructureFrame Interface**:
```typescript
interface ControlStructureFrame {
    type: 'if' | 'while' | 'do' | 'for';
    startLine: number;
    endLine: number;
    nestedStatements?: Statement[];
    nestedIndex?: number;
    loopVariable?: string;
    loopStartValue?: number;
    loopEndValue?: number;
    loopStepValue?: number;
    condition?: any;
}
```

**Frame Types**:
- `if` - IF statement blocks
- `while` - WHILE loops
- `do` - DO loops
- `for` - FOR loops

## Execution Flow

### executeStep() Method

Main execution method called for each step:

1. **Check Control Frame**:
   - If active control frame with nested statements, execute next nested statement
   - Otherwise, get statement at program counter

2. **Execute Statement**:
   - Call `statement.execute()`
   - Pass context, graphics, audio, program, runtime

3. **Handle Execution Result**:
   - `Goto`: Set program counter to target, pop frame
   - `End`: Return End
   - `Return`: Pop stack frame, set program counter to return address
   - `Continue`: Continue to next statement

4. **Update Program Counter**:
   - Increment if no control frame active
   - Control frames manage their own flow

### Control Stack Management

**pushControlFrame(frame)**:
- Pushes control structure frame onto stack
- Used when entering IF, WHILE, FOR, DO blocks

**popControlFrame()**:
- Pops frame from stack
- Used when exiting control structures

**getCurrentControlFrame()**:
- Returns top frame from stack
- Used to check active control structure

**findControlFrame(type)**:
- Finds frame of specific type in stack
- Used for CONTINUE/EXIT statements

## Control Structure Handling

### IF Statements

1. Evaluate condition
2. If true, push frame with nested statements
3. Execute nested statements
4. Pop frame when complete

### WHILE Loops

1. Evaluate condition
2. If true, push frame with nested statements
3. Execute nested statements
4. Re-evaluate condition after each iteration
5. Pop frame when condition false

### FOR Loops

1. Initialize loop variable
2. Push frame with loop parameters
3. Execute nested statements
4. Increment loop variable
5. Check if loop complete
6. Pop frame when done

### DO Loops

1. Push frame with nested statements
2. Execute nested statements
3. Evaluate condition (WHILE/UNTIL)
4. Continue or exit based on condition

## Tab Switching

**setTabSwitchCallback(callback)**:
- Sets callback for tab switching
- Called by statements to switch tabs

**requestTabSwitch(tabId)**:
- Requests tab switch
- Used by statements (e.g., PRINT)

**Integration**:
- `InterpreterService` sets callback
- Callback triggers `TabSwitchService`
- `AppComponent` subscribes and switches tabs

## Program Counter Management

Program counter is managed by `ExecutionContext`:
- `getProgramCounter()` - Get current line
- `setProgramCounter(value)` - Jump to line
- `incrementProgramCounter()` - Next line

`RuntimeExecution` uses program counter to:
- Get current statement
- Handle GOTO jumps
- Manage subroutine returns

## Nested Execution

### Nested Statements

Control structures contain nested statements:
- IF blocks contain THEN statements
- Loops contain loop body statements
- Executed sequentially via `nestedIndex`

### Execution Flow

```
executeStep()
    ↓
Check for active control frame
    ↓
If frame exists:
    Execute next nested statement
    Increment nestedIndex
    Check if frame complete
    ↓
Else:
    Get statement at program counter
    Execute statement
    Handle result
    Increment program counter
```

## Error Handling

Errors during execution:
- Caught in `ConsoleService.executeCommand()`
- Displayed to user
- Don't crash execution engine

## Integration Points

### With ExecutionContext
- Reads/writes program counter
- Manages variable access
- Handles stack frames for subroutines

### With Program
- Gets statements by index
- Finds label indices for GOTO
- Accesses program structure

### With Graphics/Audio
- Passed to statement execution
- Statements perform I/O operations

### With Statements
- Receives execution status
- Handles control flow results
- Manages nested execution

## Execution Modes

### Console Mode
- Single statement execution
- Shared execution context
- Immediate execution

### Program Mode
- Full program execution
- Step-by-step via `executeStep()`
- Control flow fully managed

## Future Enhancements

Potential additions:
- **Breakpoints**: Pause at specific lines
- **Step over/into**: Debugging support
- **Execution profiling**: Performance metrics
- **Async execution**: Non-blocking operations
