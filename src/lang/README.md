# Language Core

This document describes the core language types, execution model, and runtime structures.

## Value System

### EduBasicType

**Location**: `src/lang/edu-basic-value.ts`

Enumeration of all value types in EduBASIC:

```typescript
enum EduBasicType {
    Integer = 'INTEGER',    // Integer numbers (suffix: %)
    Real = 'REAL',          // Floating-point numbers (suffix: #)
    Complex = 'COMPLEX',    // Complex numbers (suffix: &)
    String = 'STRING',      // Text strings (suffix: $)
    Structure = 'STRUCTURE', // Key-value structures (no suffix)
    Array = 'ARRAY'         // Arrays of values (suffix: [])
}
```

### EduBasicValue

**Location**: `src/lang/edu-basic-value.ts`

Discriminated union type representing all possible values:

```typescript
type EduBasicValue = 
    | { type: EduBasicType.Integer; value: number }
    | { type: EduBasicType.Real; value: number }
    | { type: EduBasicType.Complex; value: ComplexValue }
    | { type: EduBasicType.String; value: string }
    | { type: EduBasicType.Structure; value: Map<string, EduBasicValue> }
    | { type: EduBasicType.Array; value: EduBasicValue[]; elementType: EduBasicType };
```

**Type Discrimination**:
- All values have a `type` field for type checking
- Type guards can check `value.type === EduBasicType.Integer`, etc.
- Arrays include `elementType` to track array element types

**ComplexValue Interface**:
```typescript
interface ComplexValue {
    real: number;
    imaginary: number;
}
```

**Type Suffixes**:
- `%` - Integer (e.g., `x%`)
- `#` - Real (e.g., `y#`)
- `&` - Complex (e.g., `z&`)
- `$` - String (e.g., `name$`)
- `[]` - Array (e.g., `arr%[]`)

## Execution Context

### ExecutionContext

**Location**: `src/lang/execution-context.ts`

Manages variable storage and program execution state.

**Key Responsibilities**:
- Global and local variable storage
- Variable name canonicalization (case-insensitive)
- Call stack management for subroutines
- Program counter tracking

**Key Properties**:
- `globalVariables: Map<string, EduBasicValue>` - Global variables
- `canonicalGlobalNames: Map<string, string>` - Original case of variable names
- `stackFrames: StackFrame[]` - Call stack for subroutines
- `programCounter: number` - Current execution line

**Key Methods**:
- `getVariable(name: string): EduBasicValue` - Get variable (creates default if missing)
- `setVariable(name: string, value: EduBasicValue, isLocal?: boolean)` - Set variable
- `hasVariable(name: string): boolean` - Check if variable exists
- `getCanonicalName(name: string): string` - Get original case of variable name
- `pushStackFrame(returnAddress: number)` - Push subroutine call frame
- `popStackFrame(): number | undefined` - Pop frame and return address
- `getProgramCounter()`, `setProgramCounter()`, `incrementProgramCounter()` - PC management

**Variable Lookup**:
1. Check local variables in current stack frame
2. Check global variables
3. Return default value based on type suffix if not found

**Default Values**:
- Integer (`%`): `0`
- Real (`#`): `0.0`
- Complex (`&`): `{ real: 0, imaginary: 0 }`
- String (`$`): `''`
- Array (`[]`): `[]` with appropriate element type
- Structure: `new Map()`

**StackFrame Interface**:
```typescript
interface StackFrame {
    localVariables: Map<string, EduBasicValue>;
    canonicalLocalNames: Map<string, string>;
    returnAddress: number;
}
```

**Name Canonicalization**:
- Variable names are case-insensitive for lookup
- Original case is preserved for display
- `getCanonicalName()` returns the original case

## Program Structure

### Program

**Location**: `src/lang/program.ts`

Represents a BASIC program as a collection of statements.

**Key Responsibilities**:
- Statement storage and retrieval
- Label mapping for GOTO/GOSUB
- Line insertion/deletion/replacement
- Label index maintenance

**Key Properties**:
- `statements: Statement[]` - Array of statements
- `labelMap: Map<string, number>` - Label name to line index mapping

**Key Methods**:
- `getStatement(lineIndex: number): Statement | undefined` - Get statement at line
- `getStatements(): readonly Statement[]` - Get all statements
- `getLineCount(): number` - Get number of lines
- `insertLine(lineIndex: number, statement: Statement)` - Insert statement
- `deleteLine(lineIndex: number)` - Delete statement
- `replaceLine(lineIndex: number, statement: Statement)` - Replace statement
- `appendLine(statement: Statement)` - Append statement
- `getLabelIndex(labelName: string): number | undefined` - Get line index for label
- `hasLabel(labelName: string): boolean` - Check if label exists
- `clear()` - Clear all statements
- `rebuildLabelMap()` - Rebuild label mapping

**Label Management**:
- Labels are automatically tracked when `LabelStatement` is added
- Label map is updated when lines are inserted/deleted
- Labels are case-insensitive (stored uppercase)

**Line Indexing**:
- Lines are 0-indexed internally
- Line numbers in source code are separate from indices
- Indices are used for program counter

## Runtime Node

### RuntimeNode

**Location**: `src/lang/runtime-node.ts`

Base class for all runtime objects (expressions and statements).

**Purpose**: Provides common interface for string representation.

**Key Methods**:
- `toString(): string` - Abstract method for string representation

**Inheritance**:
- `Expression` extends `RuntimeNode`
- `Statement` extends `RuntimeNode`

## Runtime Execution

### RuntimeExecution

**Location**: `src/lang/runtime-execution.ts`

Manages step-by-step program execution with control flow handling.

**Key Responsibilities**:
- Step-by-step statement execution
- Control structure management (IF, WHILE, FOR, DO)
- Control stack management
- Tab switching coordination
- Program counter management

**Control Structure Frames**:
- **Location**: `src/lang/control-flow-frames.ts`
- Frames are stored in a dedicated stack structure: `src/lang/control-flow-frame-stack.ts`

**Key Methods**:
- `executeStep(): ExecutionResult` - Execute one step
- `pushControlFrame(frame)` - Push control frame
- `popControlFrame()` - Pop control frame
- `getCurrentControlFrame()` - Get current frame
- `findControlFrame(type)` - Find frame by type
- `setTabSwitchCallback(callback)` - Set tab switch callback
- `requestTabSwitch(tabId)` - Request tab switch

**Execution Flow**:
- The runtime executes a **flat program**: each `executeStep()` runs the statement at the current program counter.
- Control flow statements (`IF`/`ELSEIF`/`ELSE`/`END IF`, loops, `CALL`/`SUB`) manipulate the program counter and maintain control frames on the stack to enable correct matching behavior.

## Graphics System

### Graphics

**Location**: `src/lang/graphics.ts`

Manages all graphics operations including text output and pixel graphics.

**Display Specifications**:
- Resolution: 640×480 pixels
- Text Grid: 80 columns × 30 rows
- Character Size: 8×16 pixels
- Coordinate System: Bottom-left origin (0,0)
- Color Format: 32-bit RGBA (8 bits per channel)

**Key Methods**:
- `setContext(context: CanvasRenderingContext2D)` - Set canvas context
- `setForegroundColor(color: Color)` - Set text/graphics color
- `setBackgroundColor(color: Color)` - Set background color
- `printText(text: string)` - Print text
- `printChar(char: string)` - Print character
- `newLine()` - Move to next line
- `setCursorPosition(row, column)` - Set cursor position
- `drawPixel(x, y, color?)` - Draw pixel
- `drawLine(x1, y1, x2, y2, color?)` - Draw line
- `drawRectangle(x, y, width, height, filled, color?)` - Draw rectangle
- `drawCircle(x, y, radius, filled, color?)` - Draw circle
- `drawOval(x, y, width, height, filled, color?)` - Draw oval
- `drawTriangle(x1, y1, x2, y2, x3, y3, filled, color?)` - Draw triangle
- `drawArc(x, y, radius, startAngle, endAngle, color?)` - Draw arc
- `clear()` - Clear screen
- `flush()` - Render buffer to canvas

**Buffer Management**:
- Uses `ImageData` buffer (640×480×4 bytes)
- Buffer updated in memory
- `flush()` writes to canvas and triggers callback

## Audio System

### Audio

**Location**: `src/lang/audio.ts`

Manages audio synthesis using Web Audio API and webaudio-tinysynth (General MIDI).

**Key Methods**:
- `setTempo(bpm: number)` - Set tempo in BPM
- `setVolume(volume: number)` - Set master volume (0-100)
- `setVoice(voiceIndex: number)` - Set active voice (0-7)
- `setVoiceInstrument(voiceIndex: number, programNum: number)` - Set General MIDI program number for a voice
- `setVoiceInstrumentByName(voiceIndex: number, name: string)` - Resolve and set instrument by name
- `playSequence(voiceIndex: number, mml: string)` - Play a note/rest sequence for a voice

**Integration**:
- Uses webaudio-tinysynth for General MIDI instrument playback
- Multiple voices for polyphony

## Execution Model

### Statement Execution

Statements receive execution context and return execution status:

```typescript
execute(
    context: ExecutionContext,
    graphics: Graphics,
    audio: Audio,
    program: Program,
    runtime: RuntimeExecution
): ExecutionStatus
```

**ExecutionStatus Interface**:
```typescript
interface ExecutionStatus {
    result: ExecutionResult;
    gotoTarget?: number;  // For GOTO statements
}
```

**ExecutionResult Enum**:
- `Continue` - Continue to next statement
- `End` - End program execution
- `Goto` - Jump to line (gotoTarget specified)
- `Return` - Return from subroutine

### Expression Evaluation

Expressions evaluate to values:

```typescript
evaluate(context: ExecutionContext): EduBasicValue
```

**Evaluation Flow**:
1. Expression receives execution context
2. Accesses variables via context
3. Performs operations
4. Returns `EduBasicValue`

### Shared Execution Context

**Key Design Decision**: A single `ExecutionContext` instance is shared across all console commands.

**Benefits**:
- Variables persist between commands
- Interactive programming possible
- State accumulates naturally

**Implementation**:
- `InterpreterService` maintains single instance
- `ConsoleService` uses shared context for all commands
- Variables set in one command available in next

**Example**:
```
> LET x% = 10
> PRINT x%
10
> LET x% = x% + 5
> PRINT x%
15
```

## Type System

### Type Coercion

EduBASIC performs automatic type coercion:

**Numeric Coercion**:
- Integer → Real: Automatic
- Real → Integer: Truncation
- Numeric → Complex: Real part set, imaginary = 0

**String Coercion**:
- Any value → String: `toString()` conversion
- String → Numeric: Parse if possible, else error

**Array Coercion**:
- Arrays maintain element type
- Type errors on mismatched element types

### Type Checking

**Runtime Type Checking**:
- Type errors detected during execution
- Operations validate operand types
- Array operations check element types

**Type Inference**:
- Variable types inferred from suffix
- Array element types tracked
- Structure types are dynamic

## Memory Management

### Variable Storage

**Global Variables**:
- Stored in `ExecutionContext.globalVariables`
- Persist for program lifetime
- Accessible from anywhere

**Local Variables**:
- Stored in stack frame `localVariables`
- Scoped to subroutine
- Automatically cleaned on return

**Default Values**:
- Variables created on first access
- Default value based on type suffix
- No explicit declaration required (but DIM recommended for arrays)

### Garbage Collection

- JavaScript handles memory management
- No explicit memory management needed
- Variables cleaned when out of scope

## Error Handling

### Runtime Errors

**Type Errors**:
- Invalid type operations
- Array index out of bounds
- Division by zero

**Undefined Behavior**:
- Accessing undefined variables returns defaults
- Array access beyond bounds returns default
- Invalid operations may throw exceptions

### Error Propagation

- Errors caught in `ConsoleService.executeCommand()`
- Displayed to user via console
- Don't crash application

## Related Documentation

For detailed documentation on specific language subsystems:

- **[Parsing Engine](parsing/README.md)** - Tokenizer, keywords, statement parsers, and the expression parser
- **[Expressions System](expressions/README.md)** - Expression parsing, evaluation, and operator precedence
- **[Statements System](statements/README.md)** - All statement types and their execution

## Future Enhancements

Potential additions:
- **Type annotations**: Explicit type declarations
- **Constants**: Immutable named values
- **Namespaces**: Variable scoping beyond subroutines
- **Modules**: Code organization and imports
