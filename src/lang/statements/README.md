# Statements System

This document describes all statement types and their execution.

## Statement Architecture

All statements extend the abstract `Statement` class:

```typescript
abstract class Statement extends RuntimeNode
{
    indentLevel: number = 0;
    lineNumber?: number;
    
    abstract execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus;
    
    getIndentAdjustment(): number
    {
        return 0;
    }
}
```

## Statement Categories

### I/O Statements

**Location**: `src/lang/statements/io/`

**PrintStatement**:
- `PRINT expr1, expr2, ...` - Print values
- `PRINT expr1; expr2; ...` - Print without spacing
- `PRINT` - Print blank line
- Writes to the graphics output surface

**InputStatement**:
- `INPUT var$` - Read string input
- `INPUT var%` - Read integer input
- Prompts user for input

**ColorStatement**:
- `COLOR foreground` - Set text color
- `COLOR foreground, background` - Set both colors
- Colors are 32-bit RGBA integers

**LocateStatement**:
- `LOCATE row, column` - Set cursor position
- Text output position control

**ClsStatement**:
- `CLS` - Clear screen
- Resets graphics buffer

### Control Flow Statements

**Location**: `src/lang/statements/control-flow/`

**IfStatement**:
- `IF condition THEN ... END IF`
- Conditional execution
- Supports ELSE and ELSEIF

**ForStatement**:
- `FOR var% = start TO end STEP step`
- Loop with counter
- Paired with `NextStatement`

**WhileStatement**:
- `WHILE condition ... WEND`
- Pre-condition loop
- Paired with `WendStatement`

**DoLoopStatement**:
- `DO ... LOOP`
- `DO WHILE condition ... LOOP`
- `DO ... LOOP UNTIL condition`
- Flexible loop structure

**GotoStatement**:
- `GOTO label` - Jump to label
- Unconditional jump

**GosubStatement**:
- `GOSUB label` - Call subroutine
- Paired with `ReturnStatement`

**SelectCaseStatement**:
- `SELECT CASE expr ... END SELECT`
- Multi-way branching
- Uses `CaseStatement` for cases

**TryStatement**:
- `TRY ... CATCH ... FINALLY ... END TRY`
- Exception handling
- Uses `CatchStatement` and `FinallyStatement`

**LabelStatement**:
- `label:` - Defines label
- Target for GOTO/GOSUB

**SubStatement**:
- `SUB name param1, param2 ... END SUB`
- Subroutine definition
- Parameters passed by value

**CallStatement**:
- `CALL name arg1, arg2` - Call subroutine
- Executes subroutine with arguments

**ReturnStatement**:
- `RETURN` - Return from subroutine
- Pops stack frame

**ContinueStatement**:
- `CONTINUE` - Continue loop iteration
- Skips to next iteration

**ExitStatement**:
- `EXIT FOR`, `EXIT WHILE`, `EXIT DO` - Exit loop
- Breaks out of loop

**EndStatement**:
- `END` - End program
- `END IF`, `END WHILE`, etc. - End block

### Variable Statements

**Location**: `src/lang/statements/variables/`

**LetStatement**:
- `LET var% = value` - Assign value
- `LET` keyword optional

**DimStatement**:
- `DIM arr%[10]` - Declare array
- Pre-allocates array size

**LocalStatement**:
- `LOCAL var%` - Declare local variable
- Scoped to subroutine

### Array Statements

**Location**: `src/lang/statements/array/`

**PushStatement**:
- `PUSH arr%[], value` - Add to end

**PopStatement**:
- `POP arr%[] INTO result%` - Remove from end

**ShiftStatement**:
- `SHIFT arr%[] INTO result%` - Remove from beginning

**UnshiftStatement**:
- `UNSHIFT arr%[], value` - Add to beginning

### Graphics Statements

**Location**: `src/lang/statements/graphics/`

**PsetStatement**:
- `PSET (x%, y%) WITH color%` - Set pixel

**LineStatement**:
- `LINE (x1%, y1%) TO (x2%, y2%) WITH color%` - Draw line

**CircleStatement**:
- `CIRCLE (x%, y%), radius% WITH color%` - Draw circle

**RectangleStatement**:
- `RECTANGLE (x%, y%), width%, height% WITH color%` - Draw rectangle

**OvalStatement**:
- `OVAL (x%, y%), width%, height% WITH color%` - Draw oval

**TriangleStatement**:
- `TRIANGLE (x1%, y1%), (x2%, y2%), (x3%, y3%) WITH color%` - Draw triangle

**ArcStatement**:
- `ARC (x%, y%), radius%, startAngle#, endAngle# WITH color%` - Draw arc

**PaintStatement**:
- `PAINT (x%, y%) WITH color%` - Flood fill

**GetStatement**:
- `GET (x%, y%), width%, height% INTO arr%[]` - Capture sprite

**PutStatement**:
- `PUT arr%[] AT (x%, y%)` - Draw sprite

**TurtleStatement**:
- `TURTLE command, ...` - Turtle graphics

### Audio Statements

**Location**: `src/lang/statements/audio/`

**PlayStatement**:
- `PLAY voice%, mml$` - Play an MML-style sequence on the specified voice
- Uses webaudio-tinysynth (General MIDI)

**TempoStatement**:
- `TEMPO bpm%` - Set tempo

**VoiceStatement**:
- `VOICE voice% INSTRUMENT instrument` - Set instrument for a voice
  - `instrument` can be a number (General MIDI program number) or a string (instrument name)

**VolumeStatement**:
- `VOLUME volume%` - Set volume (0-100)

### File I/O Statements

**Location**: `src/lang/statements/file-io/`

**OpenStatement**:
- `OPEN filename$ FOR READ|APPEND|OVERWRITE AS handle%` - Open file (handle-based)

**CloseStatement**:
- `CLOSE handle%` - Close file

**ReadFileStatement**:
- `READ var% FROM handle%` - Read a typed value from an open file handle
- `READ var$ FROM handle%` - Read a string (length-prefixed) from an open file handle
- `READ array[] FROM handle%` - Bulk read into an already-dimensioned array

**WritefileStatement**:
- `WRITE expr TO handle%` - Write a typed value to an open file handle

**ReadfileStatement**:
- `READFILE var$ FROM filename$` - Read an entire file into a string variable

**WritefileStatement**:
- `WRITEFILE text$ TO filename$` - Write a string into a file (overwrites)

**LineInputStatement**:
- `LINE INPUT var$ FROM handle%` - Read a line of UTF-8 text from an open file handle

**SeekStatement**:
- `SEEK position% IN handle%` - Set file position (bytes)

**ListdirStatement**:
- `LISTDIR "path" INTO arr$[]` - List directory

**MkdirStatement**:
- `MKDIR "path"` - Create directory

**RmdirStatement**:
- `RMDIR "path"` - Remove directory

**CopyStatement**:
- `COPY "src" TO "dest"` - Copy file/directory

**MoveStatement**:
- `MOVE "src" TO "dest"` - Move file/directory

**DeleteStatement**:
- `DELETE "path"` - Delete file/directory

### Miscellaneous Statements

**Location**: `src/lang/statements/misc/`

**ConsoleStatement**:
- `CONSOLE expression` - Print expression result to console
- Useful for debugging
- Can be used in programs or console

**HelpStatement**:
- `HELP statementKeyword` - Display help for a statement
- Prints all valid syntax forms to console

**SleepStatement**:
- `SLEEP milliseconds%` - Pause execution

**RandomizeStatement**:
- `RANDOMIZE seed%` - Seed random number generator

**SetStatement**:
- `SET option, value` - Set system option

## Statement Execution

### Execution Flow

```
Statement.execute(context, graphics, audio, program, runtime)
    ↓
Evaluate expressions
    ↓
Perform operation
    ↓
Update context/graphics/audio
    ↓
Return ExecutionStatus
```

### ExecutionStatus

```typescript
interface ExecutionStatus {
    result: ExecutionResult;
    gotoTarget?: number;  // For GOTO statements
}
```

**ExecutionResult**:
- `Continue` - Continue to next statement
- `End` - End program execution
- `Goto` - Jump to line (gotoTarget specified)
- `Return` - Return from subroutine

### Indentation

Statements track `indentLevel` for editor formatting:
- `ParserService` assigns `indentLevel` based on `getIndentAdjustment()` so the editor can indent blocks while typing.
- Indentation does **not** define execution semantics.

### Static Control-Flow Linking

Structured control flow is linked by static program syntax analysis:
- After a `Program` is built (or changed), a linker assigns `statement.lineNumber` and populates line-index references such as:
  - IF / ELSEIF / ELSE / END IF
  - UNLESS / ELSE / END UNLESS
  - FOR / NEXT
  - WHILE / WEND
  - DO / LOOP
  - UNTIL / UEND
  - SELECT CASE / CASE / END SELECT
  - SUB / END SUB and CALL -> SUB mapping

At execution-time, the runtime uses these precomputed links (no scanning) plus control frames to track dynamic state (e.g., `branchTaken`, loop counters, select matching).

## Statement Parsing

### ParserService Integration

Statements are parsed by `ParserService`:
1. Tokenize source
2. Identify statement keyword
3. Call appropriate parse method
4. Return Statement object

### Parse Methods

Each statement type has a parse method:
- `parsePrint()` - Parse PRINT statement
- `parseIf()` - Parse IF statement
- `parseFor()` - Parse FOR statement
- etc.

## Statement Examples

### I/O
```
PRINT "Hello, World"
INPUT name$
COLOR &HFF0000FF
LOCATE 10, 20
CLS
```

### Control Flow
```
IF x% > 10 THEN
    PRINT "Large"
END IF

FOR i% = 1 TO 10
    PRINT i%
NEXT i%

WHILE condition
    PRINT "Looping"
WEND
```

### Variables
```
LET x% = 10
DIM arr%[100]
LOCAL temp%
```

### Graphics
```
PSET (100, 200) WITH &HFFFFFFFF
LINE (0, 0) TO (639, 479) WITH &HFF0000FF
CIRCLE (320, 240), 50 WITH &HFF00FF00
```

### Audio
```
PLAY 0, "C D E F G A B"
TEMPO 120
VOICE 0 INSTRUMENT "sawtooth"
VOLUME 80
```

## Error Handling

### Runtime Errors

Statements may throw errors:
- Type mismatches
- Invalid operations
- Out of bounds access

### Error Propagation

- Errors caught in `ConsoleService.executeCommand()`
- Displayed to user
- Don't crash application

## Statement Testing

Statements are tested via:
- Unit tests in `specs/units/statements/`
- Integration tests
- Manual testing in console

## Future Enhancements

Potential additions:
- **Async statements**: Await operations
- **Event statements**: Event handlers
- **Module statements**: Import/export
- **Class statements**: Object-oriented features
