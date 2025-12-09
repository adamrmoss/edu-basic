# EduBASIC Language Reference

## Data Types, Variables, Arithmetic, and Boolean Operations

### Data Types

EduBASIC provides four built-in scalar data types:

- **Integer** (32-bit signed integer)
- **Real** (64-bit floating-point number)
- **Complex** (128-bit complex number with real and imaginary parts)
- **String** (text data)

Additionally, user-defined **structures** can be created to group related data together.

### Type Sigils

EduBASIC uses type sigils (special characters) at the end of variable names to indicate the variable's type. Sigils are **required** for all variables and apply **only** to variable identifiers—they are never used in literals.

| Data Type  | Sigil      | Example Variable | Size     |
|------------|------------|------------------|----------|
| Integer    | `%`        | `count%`         | 32-bit   |
| Real       | `#`        | `value#`         | 64-bit   |
| String     | `$`        | `name$`          | Variable |
| Complex    | `&`        | `z&`             | 128-bit  |
| Structure  | *(none)*   | `player`         | Variable |

**Rules:**
- Sigils are suffixes (appear at the end of the variable name)
- All variables must have a sigil (except structures)
- Literals never use sigils
- Variable names are case-insensitive

### Variable Names

Variable names must:
- Be alphanumeric (letters and numbers)
- End with the appropriate type sigil (except structures)
- Have a maximum length of 64 characters
- Start with a letter

Examples:
```
LET studentCount% = 10
LET roomTemperature# = 98.6
LET playerName$ = "Alice"
LET impedance& = 3+4i
```

### Variable Declaration

Variables in EduBASIC are **implicitly declared**—you simply assign a value to create a variable. The `DIM` keyword is used **only** for:
- Declaring arrays
- Declaring structures

You do not need to declare simple scalar variables before using them.

### Literals

#### Integer Literals

Integer literals can be written in three forms:

**Decimal:**
```
123
0
9001
```

**Hexadecimal** (prefix with `&H`):
```
&HFF
&H7F2A
&H00FF
```

**Binary** (prefix with `&B`):
```
&B101101
&B1101_0011
&B11111111
```

Underscores can be used in binary literals for readability.

#### Real Literals

Real (floating-point) numbers can be written as:

**Decimal notation:**
```
3.14
10.
.25
42
```

**Scientific notation:**
```
1E6
3.2E-4
6.022E23
1.5e+10
```

The exponent uses `E` or `e` followed by an optional sign (`+` or `-`).

#### Complex Literals

Complex numbers consist of a real part and an imaginary part.

**Imaginary-only** (real part is zero):
```
4i
3.14i
.25i
1E-3i
```

**Full complex numbers:**
```
3+4i
3-4i
10.5+2.5E-3i
1E3-2i
.5+.25i
```

Notes:
- The imaginary unit can be lowercase `i` or uppercase `I`
- No spaces are required between the real and imaginary parts
- The `+` or `-` immediately before the imaginary term distinguishes it from subtraction in expressions

#### String Literals

String literals are enclosed in double quotes:
```
"Hello, world!"
"EduBASIC"
"Line 1\nLine 2"
```

### Type Coercion

EduBASIC automatically promotes numeric types when they are mixed in expressions:
- Integer → Real → Complex (promotes naturally)
- Complex arithmetic always yields Complex results
- Literal types are inferred from their syntax

### Arrays

Arrays are declared using the `DIM` keyword with square brackets. Arrays are **one-based by default** (index 1 is the first element).

**Default one-based array:**
```
DIM numbers%[10]
```

This creates an array with indices 1 through 10.

**Custom range:**
```
DIM studentNames$[0 TO 11]
```

This creates an array with indices 0 through 11.

**Multi-dimensional arrays:**
```
DIM matrix#[5, 10]
DIM grid%[1 TO 10, 1 TO 20]
```

### Arithmetic Operations

#### Arithmetic Operators

| Operator    | Description    | Example                            |
|-------------|----------------|------------------------------------|
| `+`         | Addition       | `LET totalSum% = 5 + 3`            |
| `-`         | Subtraction    | `LET difference% = 10 - 4`         |
| `*`         | Multiplication | `LET product% = 6 * 7`             |
| `/`         | Division       | `LET quotient# = 15 / 4`           |
| `MOD`       | Modulo         | `LET remainder% = 17 MOD 5`        |
| `^` or `**` | Exponentiation | `LET powerResult# = 2 ^ 8`         |
| `!`         | Factorial      | `LET factorialNum% = 5!`           |

#### Assignment Operators

The `LET` keyword is **required** for all assignments. EduBASIC also supports C-style compound assignment operators:

```
LET totalCount% = 10
LET totalCount% += 5
LET totalCount% -= 3
LET totalCount% *= 2
LET totalCount% /= 4
LET totalCount% ^= 2
```

#### Unit Conversion Operators

EduBASIC provides postfix operators to convert between degrees and radians:

| Operator | Description             | Example                                   |
|----------|-------------------------|-------------------------------------------|
| `DEG`    | Convert radians to degrees | `LET degrees# = (3.14159 / 2) DEG`      |
| `RAD`    | Convert degrees to radians | `LET radians# = 90 RAD`                 |

Example usage with trigonometric functions:
```
LET angle# = 45 RAD
LET result# = SIN angle#
LET angleDegrees# = ASIN result# DEG
```

#### Absolute Value / Norm

Use vertical bars for absolute value (for reals) or norm (for complex numbers):
```
LET absoluteValue# = | -5 |
LET complexNorm# = | 3+4i |
```

#### Arithmetic Functions

EduBASIC provides a comprehensive set of arithmetic functions for mathematical computations:

**Trigonometric Functions:**

| Function    | Description                       | Example                      |
|-------------|-----------------------------------|------------------------------|
| `SIN x#`    | Sine of x (radians)               | `LET result# = SIN angle#`   |
| `COS x#`    | Cosine of x (radians)             | `LET result# = COS angle#`   |
| `TAN x#`    | Tangent of x (radians)            | `LET result# = TAN angle#`   |
| `ASIN x#`   | Arcsine of x (returns radians)    | `LET angle# = ASIN ratio#`   |
| `ACOS x#`   | Arccosine of x (returns radians)  | `LET angle# = ACOS ratio#`   |
| `ATAN x#`   | Arctangent of x (returns radians) | `LET angle# = ATAN slope#`   |

**Hyperbolic Functions:**

| Function     | Description                      | Example                       |
|--------------|----------------------------------|-------------------------------|
| `SINH x#`    | Hyperbolic sine of x             | `LET result# = SINH value#`   |
| `COSH x#`    | Hyperbolic cosine of x           | `LET result# = COSH value#`   |
| `TANH x#`    | Hyperbolic tangent of x          | `LET result# = TANH value#`   |
| `ASINH x#`   | Inverse hyperbolic sine of x     | `LET result# = ASINH value#`  |
| `ACOSH x#`   | Inverse hyperbolic cosine of x   | `LET result# = ACOSH value#`  |
| `ATANH x#`   | Inverse hyperbolic tangent of x  | `LET result# = ATANH value#`  |

**Exponential and Logarithmic Functions:**

| Function     | Description                    | Example                      |
|--------------|--------------------------------|------------------------------|
| `EXP x#`     | e raised to the power x        | `LET result# = EXP power#`   |
| `LOG x#`     | Natural logarithm (base e)     | `LET result# = LOG value#`   |
| `LOG10 x#`   | Common logarithm (base 10)     | `LET result# = LOG10 value#` |
| `LOG2 x#`    | Binary logarithm (base 2)      | `LET result# = LOG2 value#`  |

**Root Functions:**

| Function     | Description      | Example                       |
|--------------|------------------|-------------------------------|
| `SQRT x#`    | Square root of x | `LET result# = SQRT number#`  |
| `CBRT x#`    | Cube root of x   | `LET result# = CBRT number#`  |

**Rounding and Truncation Functions:**

| Function     | Description                                | Example                                                         |
|--------------|--------------------------------------------|-----------------------------------------------------------------|
| `ROUND x#`   | Round to nearest integer (ties round up)   | `LET result# = ROUND 3.5` returns 4                             |
| `FLOOR x#`   | Round toward negative infinity (−∞)        | `LET result# = FLOOR 3.7` returns 3, `FLOOR -3.2` returns -4    |
| `CEIL x#`    | Round toward positive infinity (+∞)        | `LET result# = CEIL 3.2` returns 4, `CEIL -3.7` returns -3      |
| `TRUNC x#`   | Round toward zero                          | `LET result# = TRUNC 3.9` returns 3, `TRUNC -3.9` returns -3    |
| `EXPAND x#`  | Round away from zero                       | `LET result# = EXPAND 3.1` returns 4, `EXPAND -3.1` returns -4  |

**Sign Function:**

| Function  | Description            | Example                     |
|-----------|------------------------|-----------------------------|
| `SGN x#`  | Sign of x: -1, 0, or 1 | `LET result% = SGN value#`  |

**Complex Number Functions:**

| Function      | Description                            | Example                         |
|---------------|----------------------------------------|---------------------------------|
| `REAL z&`     | Real part of complex number            | `LET realPart# = REAL z&`       |
| `IMAG z&`     | Imaginary part of complex number       | `LET imagPart# = IMAG z&`       |
| `CONJ z&`     | Complex conjugate                      | `LET conjugate& = CONJ z&`      |
| `CABS z&`     | Absolute value (magnitude)             | `LET magnitude# = CABS z&`      |
| `CARG z&`     | Argument (phase angle) in radians      | `LET phase# = CARG z&`          |
| `CSQRT z&`    | Complex square root                    | `LET result& = CSQRT z&`        |

**Random Number Generation:**

| Function  | Description                  | Example                    |
|-----------|------------------------------|----------------------------|
| `RND`     | Random real in range [0, 1)  | `LET random# = RND`        |

### Boolean Operations

EduBASIC uses integers to represent boolean values:
- `0` represents **false**
- Any non-zero value (typically `1`) represents **true**

There is no separate boolean data type.

#### Boolean Operators

| Operator | Description                                            |
|----------|--------------------------------------------------------|
| `AND`    | Output bit is 1 when both input bits are 1             |
| `OR`     | Output bit is 1 when at least one input bit is 1       |
| `NOT`    | Output bit is 1 when the input bit is 0                |
| `XOR`    | Output bit is 1 when the input bits are different      |
| `NAND`   | Output bit is 1 when at least one input bit is 0       |
| `NOR`    | Output bit is 1 when both input bits are 0             |
| `XNOR`   | Output bit is 1 when both input bits are the same      |
| `IMP`    | Output bit is 1 when first bit is 0 or second bit is 1 |

Since there is no separate boolean data type, all boolean operators are **bitwise operators** that work on integers.

**Boolean Constants:**
- `FALSE` = `0`
- `TRUE` = `-1`

Any non-zero value is treated as true in conditional expressions, but the canonical `TRUE` value is `-1`. This is because `-1` in binary representation has all bits set to 1 (two's complement), which makes bitwise operations behave correctly. For example, `TRUE AND TRUE` yields `TRUE` (`-1 AND -1 = -1`), while if `TRUE` were `1`, then `1 AND 1 = 1` would only preserve the least significant bit.

### Comparison Operations

Standard comparison operators are available for all data types:

| Operator | Description            | Returns TRUE (-1) when...                    |
|----------|------------------------|----------------------------------------------|
| `=`      | Equal to               | Both operands have the same value            |
| `<>`     | Not equal to           | Operands have different values               |
| `<`      | Less than              | Left operand is smaller than right operand   |
| `>`      | Greater than           | Left operand is larger than right operand    |
| `<=`     | Less than or equal     | Left operand is smaller or equal to right    |
| `>=`     | Greater than or equal  | Left operand is larger or equal to right     |

Comparison operations return integer values: `FALSE` (0) or `TRUE` (-1).

### Operator Precedence

EduBASIC follows standard mathematical operator precedence:

1. Parentheses `()` (highest precedence)
2. Prefix unary operators (all functions): `SIN`, `COS`, `TAN`, `ASIN`, `ACOS`, `ATAN`, `SINH`, `COSH`, `TANH`, `ASINH`, `ACOSH`, `ATANH`, `EXP`, `LOG`, `LOG10`, `LOG2`, `SQRT`, `CBRT`, `FLOOR`, `CEIL`, `ROUND`, `TRUNC`, `EXPAND`, `SGN`, `REAL`, `IMAG`, `CONJ`, `CABS`, `CARG`, `CSQRT`, `RND`
3. Postfix unary operators: `!` (factorial), `DEG`, `RAD`
4. Absolute value / norm `| |`
5. Unary `+` and `-`
6. Exponentiation `^` or `**`
7. Multiplication `*`, Division `/`, and Modulo `MOD`
8. Addition `+` and Subtraction `-`
9. Comparison operators (`=`, `<>`, `<`, `>`, `<=`, `>=`)
10. `NOT`
11. `AND`, `NAND`
12. `OR`, `NOR`
13. `XOR`, `XNOR`
14. `IMP` (lowest precedence)

When operators have the same precedence, evaluation proceeds left to right, except for exponentiation which is right-associative.

### Random Number Generation

EduBASIC provides the `RND` function to generate random numbers and the `RANDOMIZE` command to seed the random number generator.

**Random Number Function:**
- `RND` - Returns a random real number in the range [0, 1)

**Random Number Generator Seed:**

The `RANDOMIZE` command initializes the random number generator with a seed value:

```
RANDOMIZE
```

Seeds the generator with the current system timer value (`TIMER%`). This produces different random sequences each time the program runs.

```
RANDOMIZE seedValue%
```

Seeds the generator with a specific integer value. Using the same seed value produces the same sequence of random numbers, which is useful for testing and reproducible results.

**Examples:**

```
RANDOMIZE
LET randomNumber# = RND

RANDOMIZE 12345
LET dice% = INT(RND * 6) + 1

LET randomInRange# = RND * 100
```

## Control Flow

EduBASIC supports both structured programming constructs and traditional BASIC flow control. While GOTO and GOSUB are available for backwards compatibility and educational purposes, modern structured programming approaches are encouraged for maintainable code.

### Labels

Labels mark specific locations in code that can be targeted by GOTO and GOSUB statements. Unlike traditional BASIC which uses line numbers, EduBASIC uses descriptive labels.

**Syntax:**
```
LABEL labelName
```

**Rules:**
- Label names follow the same rules as variable names (alphanumeric, starting with a letter)
- Label names are case-insensitive
- Labels do **not** use type sigils
- Each label must be unique within its scope
- Labels can only appear at the beginning of a statement

**Example:**
```
LABEL StartProgram
PRINT "Beginning program..."

LABEL MainLoop
LET counter% = counter% + 1
IF counter% < 10 THEN GOTO MainLoop

LABEL EndProgram
PRINT "Program complete!"
```

### GOTO Statement

The GOTO statement transfers control unconditionally to a labeled location.

**Syntax:**
```
GOTO labelName
```

**Note:** While GOTO is supported, excessive use creates "spaghetti code" that is difficult to read and maintain. Prefer structured alternatives like loops and procedures when possible.

**Example:**
```
LET count% = 0

LABEL LoopStart
PRINT count%
LET count% = count% + 1
IF count% < 5 THEN GOTO LoopStart

PRINT "Done!"
```

### GOSUB and RETURN Statements

GOSUB calls a subroutine at a labeled location. RETURN returns control to the statement following the GOSUB call.

**Syntax:**
```
GOSUB labelName
...
LABEL labelName
    ' subroutine code
RETURN
```

**Example:**
```
PRINT "Starting..."
GOSUB PrintHeader
PRINT "Main program"
GOSUB PrintFooter
END

LABEL PrintHeader
    PRINT "===================="
    PRINT "  PROGRAM HEADER"
    PRINT "===================="
RETURN

LABEL PrintFooter
    PRINT "===================="
    PRINT "  PROGRAM FOOTER"
    PRINT "===================="
RETURN
```

**Note:** For modern code, prefer SUB and FUNCTION procedures (described later) over GOSUB.

### IF Statement

The IF statement executes code conditionally based on a boolean expression.

**Single-line IF:**
```
IF condition THEN statement
```

**Block IF:**
```
IF condition THEN
    statements
END IF
```

**IF-ELSE:**
```
IF condition THEN
    statements
ELSE
    statements
END IF
```

**IF-ELSEIF-ELSE:**
```
IF condition1 THEN
    statements
ELSEIF condition2 THEN
    statements
ELSEIF condition3 THEN
    statements
ELSE
    statements
END IF
```

**Examples:**
```
IF score% >= 90 THEN PRINT "Grade: A"

IF temperature# > 100 THEN
    PRINT "Water is boiling!"
    LET state$ = "gas"
END IF

IF age% < 13 THEN
    PRINT "Child"
ELSEIF age% < 20 THEN
    PRINT "Teenager"
ELSEIF age% < 65 THEN
    PRINT "Adult"
ELSE
    PRINT "Senior"
END IF
```

### UNLESS Statement

The UNLESS statement is syntactic sugar for IF NOT, making negative conditions more readable.

**Syntax:**
```
UNLESS condition THEN statement

UNLESS condition THEN
    statements
END UNLESS

UNLESS condition THEN
    statements
ELSE
    statements
END UNLESS
```

**Examples:**
```
UNLESS gameOver% THEN GOSUB UpdateGame

UNLESS password$ = "secret" THEN
    PRINT "Access denied!"
    END
END UNLESS

UNLESS balance# >= price# THEN
    PRINT "Insufficient funds"
ELSE
    LET balance# -= price#
    PRINT "Purchase complete"
END UNLESS
```

**Note:** `UNLESS condition` is exactly equivalent to `IF NOT condition`.

### SELECT CASE Statement

The SELECT CASE statement provides multi-way branching based on the value of an expression. This is EduBASIC's implementation of QuickBASIC's SELECT CASE.

**Syntax:**
```
SELECT CASE expression
    CASE value1
        statements
    CASE value2
        statements
    CASE value3, value4, value5
        statements
    CASE IS > value6
        statements
    CASE value7 TO value8
        statements
    CASE ELSE
        statements
END SELECT
```

**CASE Clauses:**
- **Single value:** `CASE 5` matches when expression equals 5
- **Multiple values:** `CASE 1, 2, 3` matches when expression equals 1, 2, or 3
- **Relational:** `CASE IS > 10` matches when expression is greater than 10
  - Available operators: `=`, `<>`, `<`, `>`, `<=`, `>=`
- **Range:** `CASE 10 TO 20` matches when expression is between 10 and 20 (inclusive)
- **Default:** `CASE ELSE` matches when no other case matches (optional)

**Examples:**

```
SELECT CASE grade%
    CASE 90 TO 100
        PRINT "A"
    CASE 80 TO 89
        PRINT "B"
    CASE 70 TO 79
        PRINT "C"
    CASE 60 TO 69
        PRINT "D"
    CASE ELSE
        PRINT "F"
END SELECT
```

```
SELECT CASE command$
    CASE "QUIT", "EXIT", "Q"
        PRINT "Goodbye!"
        END
    CASE "HELP", "?"
        GOSUB ShowHelp
    CASE "SAVE"
        GOSUB SaveGame
    CASE ELSE
        PRINT "Unknown command"
END SELECT
```

```
SELECT CASE age%
    CASE IS < 0
        PRINT "Invalid age"
    CASE 0 TO 2
        PRINT "Infant"
    CASE 3 TO 12
        PRINT "Child"
    CASE 13 TO 19
        PRINT "Teenager"
    CASE IS >= 20
        PRINT "Adult"
END SELECT
```

### FOR Loop

The FOR loop iterates a counter variable through a range of values.

**Syntax:**
```
FOR variable = startValue TO endValue
    statements
NEXT variable

FOR variable = startValue TO endValue STEP stepValue
    statements
NEXT variable
```

**Rules:**
- The loop variable must be numeric (integer or real)
- STEP is optional (defaults to 1)
- STEP can be positive or negative
- The loop variable can be used inside the loop
- The NEXT statement can optionally specify the variable name for clarity

**Examples:**

```
FOR i% = 1 TO 10
    PRINT i%
NEXT i%
```

```
FOR count% = 0 TO 100 STEP 10
    PRINT count%
NEXT count%
```

```
FOR x# = 1.0 TO 0.0 STEP -0.1
    PRINT x#
NEXT x#
```

```
FOR row% = 1 TO 5
    FOR col% = 1 TO 5
        PRINT "*";
    NEXT col%
    PRINT
NEXT row%
```

### WHILE Loop

The WHILE loop repeats while a condition is true, testing the condition before each iteration.

**Syntax:**
```
WHILE condition
    statements
WEND
```

**Examples:**

```
LET count% = 0
WHILE count% < 10
    PRINT count%
    LET count% += 1
WEND
```

```
LET input$ = ""
WHILE input$ <> "quit"
    INPUT "Enter command: ", input$
    PRINT "You entered: "; input$
WEND
```

```
WHILE NOT EOF(fileHandle%)
    LINE INPUT #fileHandle%, line$
    PRINT line$
WEND
```

### UNTIL Loop

The UNTIL loop is syntactic sugar for WHILE NOT, repeating until a condition becomes true.

**Syntax:**
```
UNTIL condition
    statements
WEND
```

**Examples:**

```
LET count% = 0
UNTIL count% >= 10
    PRINT count%
    LET count% += 1
WEND
```

```
LET input$ = ""
UNTIL input$ = "quit"
    INPUT "Enter command (or 'quit'): ", input$
    PRINT "You entered: "; input$
WEND
```

**Note:** `UNTIL condition` is exactly equivalent to `WHILE NOT condition`.

### DO Loop

The DO loop provides flexible looping with conditions that can be tested at the beginning or end of the loop.

**DO WHILE (condition tested at top):**
```
DO WHILE condition
    statements
LOOP
```

**DO UNTIL (condition tested at top):**
```
DO UNTIL condition
    statements
LOOP
```

**DO-LOOP WHILE (condition tested at bottom):**
```
DO
    statements
LOOP WHILE condition
```

**DO-LOOP UNTIL (condition tested at bottom):**
```
DO
    statements
LOOP UNTIL condition
```

**Unconditional DO:**
```
DO
    statements
LOOP
```

**Key Difference:**
- Top-tested loops (`DO WHILE`/`DO UNTIL`) may never execute if the condition is initially false/true
- Bottom-tested loops (`DO...LOOP WHILE`/`DO...LOOP UNTIL`) always execute at least once

**Examples:**

```
LET password$ = ""
DO WHILE password$ <> "secret"
    INPUT "Enter password: ", password$
LOOP
```

```
DO
    INPUT "Enter a number (0 to quit): ", num%
    PRINT "You entered: "; num%
LOOP UNTIL num% = 0
```

```
DO
    PRINT "Press ESC to exit..."
    LET key$ = INKEY$
    IF key$ = CHR$(27) THEN EXIT DO
LOOP
```

### EXIT Statement

The EXIT statement immediately exits from a loop or procedure.

**Syntax:**
```
EXIT FOR
EXIT WHILE
EXIT DO
EXIT SUB
EXIT FUNCTION
```

**Examples:**

```
FOR i% = 1 TO 100
    IF numbers%[i%] = target% THEN
        PRINT "Found at position: "; i%
        EXIT FOR
    END IF
NEXT i%
```

```
DO
    INPUT "Enter value (negative to quit): ", value#
    IF value# < 0 THEN EXIT DO
    LET sum# += value#
LOOP
```

### SUB Procedures

SUB defines a subroutine (procedure) that performs an action but does not return a value.

**Syntax:**
```
SUB procedureName (parameter1, parameter2, ...)
    statements
END SUB
```

**Calling a SUB:**
```
CALL procedureName(argument1, argument2, ...)
```

or simply:

```
procedureName argument1, argument2, ...
```

**Rules:**
- Parameters must include type sigils
- Parameters are passed by value by default
- SUBs do not return values
- Use EXIT SUB to return early
- SUBs can call other SUBs and FUNCTIONs

**Examples:**

```
SUB DrawBox (width%, height%, char$)
    FOR row% = 1 TO height%
        FOR col% = 1 TO width%
            PRINT char$;
        NEXT col%
        PRINT
    NEXT row%
END SUB

CALL DrawBox(10, 5, "*")
DrawBox 20, 3, "#"
```

```
SUB InitializeGame ()
    LET score% = 0
    LET level% = 1
    LET lives% = 3
    PRINT "Game initialized!"
END SUB

CALL InitializeGame()
```

### FUNCTION Procedures

FUNCTION defines a function that performs a calculation and returns a value.

**Syntax:**
```
FUNCTION functionName (parameter1, parameter2, ...) AS type
    statements
    RETURN value
END FUNCTION
```

**Calling a FUNCTION:**
```
LET result = functionName(argument1, argument2, ...)
```

**Rules:**
- The return type must be specified with AS keyword (INTEGER, REAL, STRING, COMPLEX)
- Functions must return a value using RETURN
- Parameters must include type sigils
- Parameters are passed by value by default
- Use EXIT FUNCTION to return early
- Functions can call other SUBs and FUNCTIONs

**Examples:**

```
FUNCTION Factorial (n%) AS INTEGER
    IF n% <= 1 THEN
        RETURN 1
    ELSE
        RETURN n% * Factorial(n% - 1)
    END IF
END FUNCTION

LET result% = Factorial(5)
PRINT result%
```

```
FUNCTION Distance (x1#, y1#, x2#, y2#) AS REAL
    LET dx# = x2# - x1#
    LET dy# = y2# - y1#
    RETURN SQRT(dx# * dx# + dy# * dy#)
END FUNCTION

LET dist# = Distance(0, 0, 3, 4)
PRINT "Distance: "; dist#
```

```
FUNCTION FormatName (firstName$, lastName$) AS STRING
    RETURN lastName$ + ", " + firstName$
END FUNCTION

PRINT FormatName("John", "Smith")
```

### Parameter Passing

By default, parameters are passed **by value**, meaning the function/subroutine receives a copy of the argument.

To pass by reference (allowing the function/subroutine to modify the original variable), use the `BYREF` keyword:

**Example:**
```
SUB Swap (BYREF a%, BYREF b%)
    LET temp% = a%
    LET a% = b%
    LET b% = temp%
END SUB

LET x% = 5
LET y% = 10
CALL Swap(x%, y%)
PRINT x%, y%
```

### END Statement

The END statement terminates program execution immediately.

**Syntax:**
```
END
```

**Example:**
```
IF criticalError% THEN
    PRINT "Fatal error occurred"
    END
END IF
```

**Note:** END is different from RETURN, which returns from a subroutine. END terminates the entire program.

### Summary: Structured vs. Unstructured Flow Control

EduBASIC provides both structured and unstructured control flow:

**Structured (Recommended):**
- IF/THEN/ELSE and UNLESS
- SELECT CASE
- FOR loops
- WHILE and UNTIL loops
- DO loops
- SUB and FUNCTION procedures

**Unstructured (Use Sparingly):**
- GOTO
- GOSUB/RETURN

While GOTO and GOSUB are available for educational purposes and backwards compatibility, structured programming constructs produce more readable, maintainable code. Use labels and GOTO only when necessary or when demonstrating the evolution of programming techniques.

## Console I/O

## File I/O

## Graphics

## Audio

## Command and Function Reference

