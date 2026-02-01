# Interpreter Services

This document describes all Angular services in the interpreter layer.

## Service Architecture

All services are:
- **Injectable** with `providedIn: 'root'` (singleton)
- Use **RxJS** for reactive data flow
- Follow Angular dependency injection patterns

## Core Interpreter Services

### InterpreterService

**Location**: `src/app/interpreter/interpreter.service.ts`

**Purpose**: Central service managing program execution state and shared execution context.

**Key Responsibilities**:
- Manages shared `ExecutionContext`, `Program`, and `RuntimeExecution` instances
- Tracks interpreter state (Idle, Parsing, Running, Paused, Error)
- Provides access to execution context for console commands
- Coordinates between parser, graphics, and audio services

**Key Properties**:
- `program$: Observable<Program | null>` - Current program
- `state$: Observable<InterpreterState>` - Execution state
- `parseResult$: Observable<ParseResult | null>` - Parse results
- `isRunning$: Observable<boolean>` - Running state

**Key Methods**:
- `getExecutionContext()`: Returns shared execution context
- `getSharedProgram()`: Returns shared program instance
- `getRuntimeExecution()`: Returns or creates RuntimeExecution instance
- `parse(sourceCode: string)`: Parses source code
- `run()`, `pause()`, `resume()`, `stop()`, `reset()`: Execution control

**Shared Context Management**:
The service maintains a single `ExecutionContext` instance that persists across all console commands, allowing variables and state to be maintained between statements.

**Dependencies**:
- `ConsoleService` - Error reporting
- `GraphicsService` - Graphics instance
- `AudioService` - Audio instance
- `TabSwitchService` - Tab switching coordination

### ParserService

**Location**: `src/app/interpreter/parser/parser.service.ts`

**Purpose**: Parses BASIC source code into statement objects.

**Key Responsibilities**:
- Tokenizes source code
- Parses statements from tokens
- Tracks parsed lines and indent levels
- Handles all statement types (control flow, I/O, graphics, etc.)

**Key Properties**:
- `parsedLines$: Observable<Map<number, ParsedLine>>` - Parsed statements
- `currentIndentLevel$: Observable<number>` - Current indentation

**Key Methods**:
- `parseLine(lineNumber: number, sourceText: string): ParseResult<ParsedLine>` - Parse single line

**Parsing Flow**:
```
Source Text
    ↓
Tokenizer.tokenize()
    ↓
Token Stream
    ↓
ParserService.parseLine()
    ↓
Statement Object
```

**Parser structure**:
- **keywords.ts** – Single source of truth for all language keywords. Keywords are grouped into small arrays (variable, controlFlow, io, graphics, fileIo, audio, array, etc.); `Keywords.all` is built from those via set union. Also provides `statementStart`, `expressionTerminator`, and helpers `isKeyword()`, `isStatementStartKeyword()`, `isExpressionTerminatorKeyword()`.
- **parser/statement-dispatch.ts** – Map from statement-start keyword to parser parse method. Adding a new statement type requires adding the keyword to `Keywords` (if new) and one entry in the dispatch table.

**Statement Types Parsed**:
- Control flow: IF, FOR, WHILE, DO, GOTO, etc.
- I/O: PRINT, INPUT, COLOR, LOCATE, CLS
- Graphics: PSET, LINE, CIRCLE, RECTANGLE, etc.
- Audio: PLAY, TEMPO, VOICE, VOLUME
- Variables: LET, DIM, LOCAL
- Arrays: PUSH, POP, SHIFT, UNSHIFT
- File I/O: OPEN, READFILE, WRITEFILE, etc.

**Dependencies**:
- `ExpressionParserService` - For parsing expressions within statements

### Tokenizer

**Location**: `src/app/interpreter/tokenizer.service.ts`

**Purpose**: Converts source code into tokens.

**Key Responsibilities**:
- Tokenizes BASIC source code
- Identifies keywords, identifiers, literals, operators
- Tracks line and column positions for error reporting

**Token Types**:
- `EOF` - End of file
- `Integer`, `Real`, `Complex`, `String` - Literals
- `Identifier` - Variable names
- `Keyword` - Language keywords
- Operators: `Plus`, `Minus`, `Star`, `Slash`, `Caret`, etc.
- Comparison: `Equal`, `NotEqual`, `Less`, `Greater`, etc.
- Punctuation: `LeftParen`, `RightParen`, `Comma`, `Semicolon`, etc.

**Key Methods**:
- `tokenize(source: string): Token[]` - Convert source to tokens

**Token Interface**:
```typescript
interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}
```

### ExpressionParserService

**Location**: `src/app/interpreter/expression-parser.service.ts`

**Purpose**: Parses expressions with proper operator precedence.

**Key Responsibilities**:
- Parses expressions from tokens
- Handles operator precedence (logical, comparison, arithmetic)
- Supports unary operators
- Handles parenthesized expressions

**Operator Precedence** (lowest to highest):
1. IMP (implication)
2. XOR, XNOR
3. OR, NOR
4. AND, NAND
5. NOT
6. Comparison operators (==, !=, <, >, <=, >=)
7. Arithmetic operators (+, -, *, /, ^, **)
8. Unary operators (-, +)

**Key Methods**:
- `parseExpression(source: string): ParseResult<Expression>` - Parse expression string

**Notes**:
- The expression parser supports postfix operators (e.g. factorial `!`, angle conversion `DEG`/`RAD`) via a dedicated postfix parse phase.
- Expression operator exports are consumed via the top-level barrel `src/lang/expressions/operators.ts` (import path `@/lang/expressions/operators`).

**Parsing Methods**:
- `expression()` - Entry point
- `imp()`, `xorXnor()`, `orNor()`, `andNand()`, `not()` - Logical operators
- `comparison()` - Comparison operators
- `stringOperators()` / `arraySearchOperators()` - Non-arithmetic operators
- `addSub()` / `mulDiv()` / `unaryPlusMinus()` / `exponentiation()` - Arithmetic precedence ladder
- `primary()` - Literals, variables, parentheses, array/structure access, unary operator application
- `parsePostfix()` - Postfix operators and accessors (`!`, `.member`, `[index]`, `DEG`, `RAD`, etc.)

**Dependencies**:
- `Tokenizer` - For tokenization

## Runtime Services

### GraphicsService

**Location**: `src/app/interpreter/graphics.service.ts`

**Purpose**: Manages graphics instance and buffer updates.

**Key Responsibilities**:
- Maintains single `Graphics` instance
- Provides graphics instance to execution context
- Emits buffer updates via RxJS observable
- Connects graphics flush callbacks to UI updates

**Key Properties**:
- `buffer$: Observable<ImageData | null>` - Graphics buffer updates

**Key Methods**:
- `getGraphics()`: Returns Graphics instance
- `setContext(context: CanvasRenderingContext2D)`: Sets canvas context and flush callback

**Buffer Update Flow**:
```
Graphics.flush()
    ↓
Flush callback triggered
    ↓
GraphicsService.buffer$.next(buffer)
    ↓
OutputComponent subscribes
    ↓
Canvas rendering
```

**Dependencies**: None (root service)

### AudioService

**Location**: `src/app/interpreter/audio.service.ts`

**Purpose**: Manages audio synthesis instance.

**Key Responsibilities**:
- Maintains single `Audio` instance
- Provides audio instance to execution context
- Uses webaudio-tinysynth (General MIDI) via `Audio` class

**Key Methods**:
- `getAudio()`: Returns Audio instance

**Dependencies**: None (root service)

## Service Communication Patterns

### Reactive Data Flow

Services use RxJS observables for reactive communication:

```typescript
// Service emits updates
private subject = new BehaviorSubject<Data>(initialValue);
public readonly data$ = this.subject.asObservable();

// Component subscribes
this.service.data$.pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* handle update */ });
```

### Dependency Injection

Services are injected via constructor:

```typescript
constructor(
    private readonly serviceA: ServiceA,
    private readonly serviceB: ServiceB
) { }
```

### Singleton Pattern

All services use `providedIn: 'root'`, making them application-wide singletons.

## Service Lifecycle

### Initialization
- Services are created on first injection
- Constructor dependencies are resolved automatically
- No explicit initialization hooks needed

### State Management
- Services maintain state via BehaviorSubject
- State persists for application lifetime
- State can be reset via service methods (e.g., `reset()`)

### Cleanup
- Services don't require explicit cleanup
- RxJS subscriptions should be unsubscribed in components
- Use `takeUntil(destroy$)` pattern

## Error Handling

### Parser Errors
- `ParserService` returns `ParsedLine` with `hasError: true`
- Error messages included in `errorMessage` field
- `ConsoleService` displays errors to user

### Execution Errors
- Caught in `ConsoleService.executeCommand()`
- Displayed via `printError()`
- Don't crash the application

### Service Errors
- Services handle errors internally
- Errors reported via console or observables
- Graceful degradation where possible

## Testing Services

Services can be tested independently:
- Mock dependencies
- Test observable emissions
- Verify state changes
- Test error handling

## Future Enhancements

Potential service additions:
- **FileService**: File system operations
- **ThemeService**: UI theme management
- **SettingsService**: User preferences
- **HistoryService**: Program execution history
