# EduBASIC Language Reference

*Copyright © 2025 Adam R Moss / Fuzzy Logic Publishing. Licensed under the MIT License.*

## Table of Contents

- [Data Types, Variables, Arithmetic, and Boolean Operations](#data-types-variables-arithmetic-and-boolean-operations)
  - [Data Types](#data-types)
  - [Type Sigils](#type-sigils)
  - [Variable Names](#variable-names)
  - [Variable Declaration](#variable-declaration)
  - [Literals](#literals)
  - [Type Coercion](#type-coercion)
  - [Arrays](#arrays)
  - [Arithmetic Operations](#arithmetic-operations)
  - [Boolean Operations](#boolean-operations)
  - [Comparison Operations](#comparison-operations)
  - [Operator Precedence](#operator-precedence)
  - [Random Number Generation](#random-number-generation)
- [Control Flow](#control-flow)
  - [Labels](#labels)
  - [GOTO Statement](#goto-statement)
  - [GOSUB and RETURN Statements](#gosub-and-return-statements)
  - [IF Statement](#if-statement)
  - [UNLESS Statement](#unless-statement)
  - [SELECT CASE Statement](#select-case-statement)
  - [FOR Loop](#for-loop)
  - [WHILE Loop](#while-loop)
  - [UNTIL Loop](#until-loop)
  - [DO Loop](#do-loop)
  - [EXIT Statement](#exit-statement)
  - [SUB Procedures](#sub-procedures)
  - [END Statement](#end-statement)
  - [Summary: Structured vs. Unstructured Flow Control](#summary-structured-vs-unstructured-flow-control)
- [Text I/O](#text-io)
  - [PRINT Statement](#print-statement)
  - [INPUT Statement](#input-statement)
  - [LOCATE Statement](#locate-statement)
  - [COLOR Statement](#color-statement)
  - [SET Statement](#set-statement)
  - [String Operations](#string-operations)
    - [String Concatenation](#string-concatenation)
    - [String Slicing](#string-slicing)
    - [String Length](#string-length)
    - [String Comparison](#string-comparison)
    - [String Functions](#string-functions)
- [File I/O](#file-io)
  - [Opening and Closing Files](#opening-and-closing-files)
    - [OPEN Statement](#open-statement)
    - [CLOSE Statement](#close-statement)
  - [Reading from Files](#reading-from-files)
    - [LINE INPUT Statement (Text)](#line-input-statement-text)
    - [READ Statement (Binary)](#read-statement-binary)
  - [Writing to Files](#writing-to-files)
    - [WRITE Statement (Text and Binary)](#write-statement-text-and-binary)
  - [File Navigation](#file-navigation)
    - [SEEK Statement](#seek-statement)
    - [EOF Function](#eof-function)
    - [LOC Function](#loc-function)
  - [Convenience File Operations](#convenience-file-operations)
    - [READFILE Statement](#readfile-statement)
    - [WRITEFILE Statement](#writefile-statement)
    - [LISTDIR Statement](#listdir-statement)
    - [MKDIR Statement](#mkdir-statement)
    - [RMDIR Statement](#rmdir-statement)
    - [COPY Statement](#copy-statement)
    - [MOVE Statement](#move-statement)
    - [DELETE Statement](#delete-statement)
  - [File I/O Examples](#file-io-examples)
- [Graphics](#graphics)
  - [CLS Statement](#cls-statement)
  - [PSET Statement](#pset-statement)
  - [LINE Statement](#line-statement)
  - [CIRCLE Statement](#circle-statement)
  - [TRIANGLE Statement](#triangle-statement)
  - [PAINT Statement](#paint-statement)
  - [GET Statement](#get-statement)
  - [PUT Statement](#put-statement)
  - [COLOR Statement (Graphics)](#color-statement-graphics)
  - [Graphics Examples](#graphics-examples)
- [Audio](#audio)
- [Command and Function Reference](#command-and-function-reference)
  - (Alphabetical listing of 70+ commands, functions, and operators)

---

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

#### Swapping Variables

The `SWAP` command exchanges the values of two variables. Both variables must be of the same type.

**Syntax:**
```
SWAP variable1 WITH variable2
```

**Example:**
```
LET x% = 5
LET y% = 10
SWAP x% WITH y%
PRINT x%, y%        ' Prints: 10    5

LET firstName$ = "John"
LET lastName$ = "Doe"
SWAP firstName$ WITH lastName$
PRINT firstName$, lastName$    ' Prints: Doe    John
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

EduBASIC supports both structured programming constructs and traditional BASIC flow control. While `GOTO` and `GOSUB` are available for backwards compatibility and educational purposes, modern structured programming approaches are encouraged for maintainable code.

### Labels

Labels mark specific locations in code that can be targeted by `GOTO` and `GOSUB` statements. Unlike traditional BASIC which uses line numbers, EduBASIC uses descriptive labels.

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

The `GOTO` statement transfers control unconditionally to a labeled location.

**Syntax:**
```
GOTO labelName
```

**Note:** While `GOTO` is supported, excessive use creates "spaghetti code" that is difficult to read and maintain. Prefer structured alternatives like loops and procedures when possible.

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

`GOSUB` calls a subroutine at a labeled location. `RETURN` returns control to the statement following the `GOSUB` call.

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

**Note:** For modern code, prefer `SUB` procedures (described later) over `GOSUB`.

**Important:** `RETURN` is used exclusively for returning from `GOSUB` subroutines. `SUB` procedures use implicit return at `END SUB` or explicit early exit with `EXIT SUB`.

### IF Statement

The `IF` statement executes code conditionally based on a boolean expression.

**Single-line `IF`:**
```
IF condition THEN statement
```

**Block `IF`:**
```
IF condition THEN
    statements
END IF
```

**`IF-ELSE`:**
```
IF condition THEN
    statements
ELSE
    statements
END IF
```

**`IF-ELSEIF-ELSE`:**
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

The `UNLESS` statement is syntactic sugar for `IF NOT`, making negative conditions more readable.

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

The `SELECT CASE` statement provides multi-way branching based on the value of an expression. This is EduBASIC's implementation of QuickBASIC's `SELECT CASE`.

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

**`CASE` Clauses:**
- **Single value:** `CASE 5` matches when expression equals `5`
- **Multiple values:** `CASE 1, 2, 3` matches when expression equals `1`, `2`, or `3`
- **Relational:** `CASE IS > 10` matches when expression is greater than `10`
  - Available operators: `=`, `<>`, `<`, `>`, `<=`, `>=`
- **Range:** `CASE 10 TO 20` matches when expression is between `10` and `20` (inclusive)
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

The `FOR` loop iterates a counter variable through a range of values.

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
- `STEP` is optional (defaults to `1`)
- `STEP` can be positive or negative
- The loop variable can be used inside the loop
- The `NEXT` statement can optionally specify the variable name for clarity

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

The `WHILE` loop repeats while a condition is true, testing the condition before each iteration.

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
WHILE NOT EOF fileHandle%
    LINE INPUT line$ FROM #fileHandle%
    PRINT line$
WEND
```

### UNTIL Loop

The `UNTIL` loop is syntactic sugar for `WHILE NOT`, repeating until a condition becomes true.

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

The `DO` loop provides flexible looping with conditions that can be tested at the beginning or end of the loop.

**`DO WHILE` (condition tested at top):**
```
DO WHILE condition
    statements
LOOP
```

**`DO UNTIL` (condition tested at top):**
```
DO UNTIL condition
    statements
LOOP
```

**`DO-LOOP WHILE` (condition tested at bottom):**
```
DO
    statements
LOOP WHILE condition
```

**`DO-LOOP UNTIL` (condition tested at bottom):**
```
DO
    statements
LOOP UNTIL condition
```

**Unconditional `DO`:**
```
DO
    statements
LOOP
```

**Key Difference:**
- Top-tested loops (`DO WHILE` / `DO UNTIL`) may never execute if the condition is initially `false` / `true`
- Bottom-tested loops (`DO ... LOOP WHILE` / `DO ... LOOP UNTIL`) always execute at least once

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

The `EXIT` statement immediately exits from a loop or procedure.

**Syntax:**
```
EXIT FOR
EXIT WHILE
EXIT DO
EXIT SUB
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

`SUB` defines a subroutine (procedure) that performs an action. Subroutines can accept parameters and modify variables through reference parameters or module-level variables.

**Syntax:**
```
SUB procedureName (param1, param2, BYREF param3, ...)
    statements
END SUB
```

**Note:** Parameters are passed **by value** by default. Prefix individual parameters with `BYREF` to pass by reference.

**Calling a `SUB`:**
```
CALL procedureName(argument1, argument2, ...)
```

or simply:

```
procedureName argument1, argument2, ...
```

**Rules:**
- Parameters must include type sigils
- Parameters are passed **by value** by default (the subroutine receives a copy)
- Use `BYREF` keyword to pass **by reference** (allows modification of the original variable)
- Use `EXIT SUB` to return early
- `SUB`s can call other `SUB`s recursively

#### Parameter Passing

EduBASIC supports two parameter passing modes:

**By Value (Default):**
- The subroutine receives a **copy** of the argument
- Changes to the parameter do **not** affect the original variable
- This is the default behavior for all parameters

**By Reference (with `BYREF`):**
- The subroutine receives a **reference** to the original variable
- Changes to the parameter **do** affect the original variable
- Use the `BYREF` keyword before the parameter to enable this

**Syntax:**
```
SUB procedureName (valueParam%, BYREF refParam#)
    ' valueParam% is passed by value (default)
    ' refParam# is passed by reference (BYREF keyword)
END SUB
```

**Example demonstrating the difference:**
```
SUB TestParameters (byValue%, BYREF byReference%)
    LET byValue% = 999
    LET byReference% = 999
END SUB

LET x% = 100
LET y% = 100
CALL TestParameters(x%, y%)
PRINT "x ="; x%        ' Prints: x = 100 (unchanged, passed by value)
PRINT "y ="; y%        ' Prints: y = 999 (changed, passed by reference)
```

#### Local Variables

Variables created with `LET` inside a `SUB` are **module-level** (global). To create variables that are local to the subroutine, use the `LOCAL` keyword:

```
LOCAL variableName = value
```

Local variables:
- Are only accessible within the current `SUB`
- Are destroyed when the `SUB` exits
- Do not conflict with module-level variables of the same name
- Must still include type sigils

**Examples:**

```
SUB DrawBox (width%, height%, char$)
    LOCAL row%
    LOCAL col%
    
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
SUB CalculateStats (values#[], count%, BYREF average#, BYREF maximum#)
    LOCAL sum# = 0
    LOCAL i%
    
    LET maximum# = values#[1]
    
    FOR i% = 1 TO count%
        LET sum# += values#[i%]
        IF values#[i%] > maximum# THEN
            LET maximum# = values#[i%]
        END IF
    NEXT i%
    
    LET average# = sum# / count%
END SUB

DIM scores#[10]
' ... fill array ...
LET avg# = 0
LET max# = 0
CALL CalculateStats(scores#, 10, avg#, max#)
PRINT "Average:"; avg#; "Maximum:"; max#
```

```
SUB InitializeGame ()
    ' These are module-level variables (global)
    LET score% = 0
    LET level% = 1
    LET lives% = 3
    PRINT "Game initialized!"
END SUB

CALL InitializeGame()
```


### END Statement

The `END` statement terminates program execution immediately.

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

**Note:** `END` is different from `RETURN`, which returns from a subroutine. `END` terminates the entire program.

### Summary: Structured vs. Unstructured Flow Control

EduBASIC provides both structured and unstructured control flow:

**Structured (Recommended):**
- `IF` / `THEN` / `ELSE` and `UNLESS`
- `SELECT CASE`
- `FOR` loops
- `WHILE` and `UNTIL` loops
- `DO` loops
- `SUB` procedures with parameters

**Unstructured (Use Sparingly):**
- `GOTO`
- `GOSUB` / `RETURN`

While `GOTO` and `GOSUB` are available for educational purposes and backwards compatibility, structured programming constructs produce more readable, maintainable code. Use labels and `GOTO` only when necessary or when demonstrating the evolution of programming techniques.

**Note:** EduBASIC does not have user-defined functions. Use `SUB` procedures with `BYREF` parameters to return computed values.

## Text I/O

EduBASIC provides a text output system that is separate from the 640×480 graphics system. The text system is rendered as an overlay on top of the graphics display, allowing you to combine text output with graphics operations. Text is displayed in a character grid, and you can control the position, color, and formatting of text output.

**Note:** All colors in EduBASIC use 32-bit RGBA format, where each component (Red, Green, Blue, Alpha) is 8 bits, allowing for 256 levels per channel and full transparency control.

### PRINT Statement

The `PRINT` statement outputs text and values to the text display.

**Syntax:**
```
PRINT expression1, expression2, ...
PRINT expression1; expression2; ...
PRINT
```

**Output Formatting:**
- **Comma (`,`):** Separates items with tab spacing
- **Semicolon (`;`):** Separates items with no spacing (concatenated)
- **No separator:** Ends the line (same as semicolon followed by newline)
- **Ending with semicolon:** Suppresses the newline, so the next `PRINT` continues on the same line
- **Empty `PRINT`:** Outputs a blank line (newline only)

**Controlling Newlines:**
- To avoid a newline at the end of output, end the `PRINT` statement with a semicolon
- To output a blank line, use an empty `PRINT` statement (no arguments)

**Examples:**
```
PRINT "Hello, world!"
PRINT "Name: "; name$; " Age: "; age%
PRINT "X:", x%, "Y:", y%

' Suppress newline to continue on same line
PRINT "Enter your name: ";
INPUT name$

' Print blank lines for spacing
PRINT
PRINT "Line 1"
PRINT
PRINT "Line 3"

' Multiple items on same line
PRINT "Count: "; count%; "  ";
PRINT "Total: "; total#
```

**Special Characters:**
- `\n` - Newline
- `\t` - Tab
- `\"` - Literal double quote
- `\\` - Literal backslash

### INPUT Statement

The `INPUT` statement reads a value from the user and assigns it to a variable. Unlike traditional BASIC dialects, `INPUT` is separate from the prompt, allowing you to use `PRINT` for more flexible prompt formatting.

**Syntax:**
```
INPUT variable
```

**Rules:**
- `INPUT` can read any data type (integer, real, string, complex)
- The variable's type sigil determines what type of value is expected
- The prompt is displayed separately using `PRINT` before the `INPUT` statement
- After the user enters a value and presses Enter, the value is assigned to the variable
- If the input cannot be converted to the variable's type, an error occurs

**Examples:**
```
' Reading an integer
PRINT "Enter your age: ";
INPUT age%
PRINT "You are "; age%; " years old"

' Reading a real number
PRINT "Enter temperature: ";
INPUT temperature#
PRINT "Temperature is "; temperature#

' Reading a string
PRINT "Enter your name: ";
INPUT name$
PRINT "Hello, "; name$; "!"

' Reading a complex number
PRINT "Enter complex number (e.g., 3+4i): ";
INPUT z&
PRINT "You entered: "; z&

' Reading multiple values
PRINT "Enter X coordinate: ";
INPUT x%
PRINT "Enter Y coordinate: ";
INPUT y%
PRINT "Position: ("; x%; ", "; y%; ")"

' Using LOCATE for formatted input
LOCATE 10, 1
PRINT "Name: ";
INPUT playerName$
LOCATE 11, 1
PRINT "Score: ";
INPUT score%
```

**Note:** Since `INPUT` is separate from the prompt, you have full control over how prompts are displayed. Use `PRINT` with a semicolon at the end to keep the cursor on the same line as the prompt, or use `LOCATE` to position prompts precisely.

### LOCATE Statement

The `LOCATE` statement positions the text cursor at a specific row and column in the text display.

**Syntax:**
```
LOCATE row%, column%
```

**Rules:**
- Row and column are 1-based (row 1, column 1 is the top-left corner)
- The text display has a fixed character grid size
- After `LOCATE`, subsequent `PRINT` statements output at the specified position

**Examples:**
```
LOCATE 10, 20
PRINT "This text appears at row 10, column 20"

LOCATE 1, 1
PRINT "Top-left corner"

FOR row% = 1 TO 10
    LOCATE row%, row%
    PRINT "*"
NEXT row%
```

### COLOR Statement

The `COLOR` statement sets the foreground and/or background color for subsequent text output.

**Syntax:**
```
COLOR foregroundColor%
COLOR foregroundColor%, backgroundColor%
```

**Color Format:**
- Colors are specified as 32-bit RGBA integers
- Format: `0xRRGGBBAA` (hexadecimal) or decimal
- Each component (R, G, B, A) ranges from 0-255
- Alpha channel controls transparency (0 = fully transparent, 255 = fully opaque)

**Common Colors (examples):**
```
LET black% = &H000000FF      ' Black (opaque)
LET white% = &HFFFFFFFF      ' White (opaque)
LET red% = &HFF0000FF        ' Red (opaque)
LET green% = &H00FF00FF      ' Green (opaque)
LET blue% = &H0000FFFF       ' Blue (opaque)
LET yellow% = &HFFFF00FF     ' Yellow (opaque)
LET transparent% = &HFFFFFF00 ' White (fully transparent)
```

**Examples:**
```
COLOR &HFF0000FF        ' Red text
PRINT "This is red text"

COLOR &HFFFFFF00, &H000000FF  ' Transparent text on black background
PRINT "Invisible text on black"

LET myColor% = &H00FF00FF
COLOR myColor%
PRINT "Green text"
```

**Note:** The default text color is white on a transparent background. Colors persist until changed by another `COLOR` statement.

### SET Statement

The `SET` statement configures system-wide settings for the text display system.

**Syntax:**
```
SET LINE SPACING ON
SET LINE SPACING OFF
```

**Text Grid Dimensions:**

EduBASIC uses IBM Plex Mono font, where each character is rendered at exactly 8×16 graphics pixels. The text display grid dimensions depend on the line spacing setting:

- **With line spacing OFF (default):** The text grid is **80×30 characters**
  - Width: 640 pixels ÷ 8 pixels per character = 80 columns
  - Height: 480 pixels ÷ 16 pixels per character = 30 rows
  - Characters are rendered with no extra spacing between lines

- **With line spacing ON:** The text grid is **80×24 characters**
  - Width: 640 pixels ÷ 8 pixels per character = 80 columns (unchanged)
  - Height: 480 pixels ÷ (16 pixels per character + 4 pixels spacing) = 24 rows
  - Each line of text has 4 additional pixels of spacing after it, making text more readable but reducing the number of available rows

**Examples:**
```
SET LINE SPACING OFF    ' Use 80×30 character grid (default)
LOCATE 30, 1
PRINT "Bottom row"

SET LINE SPACING ON     ' Use 80×24 character grid
LOCATE 24, 1
PRINT "Bottom row with spacing"
```

**Note:** The line spacing setting affects the entire text display and persists until changed. When line spacing is enabled, the additional 4 pixels of vertical spacing are added after each character row, creating more readable text at the cost of fewer available rows.

### String Operations

EduBASIC provides several operations for working with string data.

#### String Concatenation

Strings can be concatenated using the `+` operator or by using semicolons in `PRINT` statements.

**Syntax:**
```
LET result$ = string1$ + string2$
LET result$ = string1$ + "literal" + string2$
```

**Examples:**
```
LET firstName$ = "John"
LET lastName$ = "Doe"
LET fullName$ = firstName$ + " " + lastName$
PRINT fullName$    ' Prints: John Doe

LET greeting$ = "Hello, " + name$ + "!"
LET message$ = "Value: " + STR$(number%)
```

#### String Slicing

Strings can be sliced to extract substrings using square bracket notation with index ranges.

**Syntax:**
```
LET substring$ = string$[startIndex TO endIndex]
LET substring$ = string$[startIndex]
LET substring$ = string$[... TO endIndex]
LET substring$ = string$[startIndex TO ...]
LET substring$ = string$[... TO ...]
```

**Rules:**
- String indices are **1-based** (first character is at index 1)
- `string$[startIndex TO endIndex]` extracts characters from `startIndex` to `endIndex` (inclusive)
- `string$[startIndex]` extracts a single character at `startIndex`
- `...` (ellipsis) can be used in place of `startIndex` or `endIndex` to mean the start or end of the string respectively
  - `string$[... TO endIndex]` extracts from the beginning of the string to `endIndex`
  - `string$[startIndex TO ...]` extracts from `startIndex` to the end of the string
  - `string$[... TO ...]` extracts the entire string
- Out-of-range indices result in an empty string or error

**Examples:**
```
LET text$ = "Hello, world!"

LET firstChar$ = text$[1]              ' "H"
LET firstWord$ = text$[1 TO 5]         ' "Hello"
LET world$ = text$[8 TO 12]            ' "world"
LET lastChar$ = text$[LEN(text$)]      ' "!"

LET name$ = "Alice"
LET firstThree$ = name$[1 TO 3]        ' "Ali"
LET lastTwo$ = name$[4 TO 5]           ' "ce"

' Using ellipsis for start/end of string
LET fromStart$ = text$[... TO 5]       ' "Hello" (from start to position 5)
LET toEnd$ = text$[8 TO ...]            ' "world!" (from position 8 to end)
LET entire$ = text$[... TO ...]         ' "Hello, world!" (entire string)
LET suffix$ = name$[3 TO ...]          ' "ice" (from position 3 to end)
```

#### String Length

Use the `LEN` function to get the length of a string.

**Syntax:**
```
LET length% = LEN(string$)
```

**Example:**
```
LET text$ = "Hello"
LET size% = LEN(text$)    ' size% = 5
```

#### String Comparison

Strings can be compared using standard comparison operators (`=`, `<>`, `<`, `>`, `<=`, `>=`). Comparisons are case-sensitive and use lexicographic (alphabetical) ordering.

**Examples:**
```
IF name$ = "Alice" THEN PRINT "Found Alice"
IF text1$ <> text2$ THEN PRINT "Different"
IF word$ < "middle" THEN PRINT "Comes before 'middle'"
```

#### String Functions

**`STR$` - Convert number to string:**
```
LET num% = 42
LET numStr$ = STR$(num%)    ' "42"
LET piStr$ = STR$(3.14159)  ' "3.14159"
```

**`VAL` - Convert string to number:**
```
LET text$ = "123"
LET number% = VAL(text$)    ' 123
LET decimal$ = "3.14"
LET value# = VAL(decimal$)  ' 3.14
```

**`CHR$` - Convert ASCII code to character:**
```
LET char$ = CHR$(65)        ' "A"
LET newline$ = CHR$(10)     ' Newline character
```

**`ASC` - Convert character to ASCII code:**
```
LET code% = ASC("A")        ' 65
LET code% = ASC("a")        ' 97
```

**`UCASE$` - Convert to uppercase:**
```
LET upper$ = UCASE$("hello")    ' "HELLO"
```

**`LCASE$` - Convert to lowercase:**
```
LET lower$ = LCASE$("WORLD")    ' "world"
```

**`LTRIM$` - Remove leading spaces:**
```
LET trimmed$ = LTRIM$("  text")    ' "text"
```

**`RTRIM$` - Remove trailing spaces:**
```
LET trimmed$ = RTRIM$("text  ")    ' "text"
```

**`TRIM$` - Remove leading and trailing spaces:**
```
LET trimmed$ = TRIM$("  text  ")   ' "text"
```

**`INSTR` - Find substring position:**
```
LET pos% = INSTR("Hello world", "world")    ' 7
LET pos% = INSTR(5, "Hello world", "o")    ' 5 (start search at position 5)
```

**`REPLACE$` - Replace substring:**
```
LET new$ = REPLACE$("Hello world", "world", "EduBASIC")    ' "Hello EduBASIC"
```

**Note:** Functions like `LEFT$`, `RIGHT$`, and `MID$` are not provided as built-in functions since they can be easily implemented using string slicing:
- `LEFT$(text$, n)` is equivalent to `text$[1 TO n]`
- `RIGHT$(text$, n)` is equivalent to `text$[LEN(text$) - n + 1 TO LEN(text$)]`
- `MID$(text$, start, length)` is equivalent to `text$[start TO start + length - 1]`

## File I/O

EduBASIC provides comprehensive file input/output operations for reading and writing both text and binary data. All file operations use UTF-8 encoding for text data, and files can mix text and binary operations seamlessly.

**Note:** File handles are integer identifiers that reference open files. You must explicitly open files before use and close them when finished.

### Opening and Closing Files

#### OPEN Statement

The `OPEN` statement opens a file and assigns a handle to a variable.

**Syntax:**
```
OPEN "filename" FOR mode AS fileHandle%
```

**Modes:**
- `READ` - Open file for reading only
- `APPEND` - Open file for writing, appending to the end
- `OVERWRITE` - Open file for writing, replacing existing content

**Rules:**
- The file handle variable receives an integer identifier
- Files must be opened before any read/write operations
- Attempting to open a non-existent file in `READ` mode causes an error
- Opening a non-existent file in `APPEND` or `OVERWRITE` mode creates the file
- The file handle is just an integer ID; it does not store file state

**Examples:**
```
OPEN "data.txt" FOR READ AS inputFile%
OPEN "output.txt" FOR OVERWRITE AS outputFile%
OPEN "log.txt" FOR APPEND AS logFile%
```

#### CLOSE Statement

The `CLOSE` statement closes an open file.

**Syntax:**
```
CLOSE fileHandle%
```

**Examples:**
```
OPEN "data.txt" FOR READ AS file%
' ... read operations ...
CLOSE file%
```

### Reading from Files

EduBASIC supports both text and binary reading operations.

#### LINE INPUT Statement (Text)

The `LINE INPUT` statement reads a complete line of text from a file.

**Syntax:**
```
LINE INPUT lineVariable$ FROM #fileHandle%
```

**Rules:**
- Reads one line including the newline character
- The newline character is included in the string
- At end of file, an error occurs (check with `EOF` first)

**Examples:**
```
OPEN "data.txt" FOR READ AS file%

WHILE NOT EOF file%
    LINE INPUT line$ FROM #file%
    PRINT line$
WEND

CLOSE file%
```

#### READ Statement (Binary)

The `READ` statement reads binary data from a file based on the variable's type.

**Syntax:**
```
READ variable FROM fileHandle%
```

**Rules:**
- Reads binary data matching the variable's type
- Integer: reads 4 bytes (32-bit signed integer)
- Real: reads 8 bytes (64-bit floating-point)
- Complex: reads 16 bytes (128-bit complex number)
- String: reads the string's length prefix and data
- Reading advances the file position
- At end of file, an error occurs (check with `EOF` first)

**Examples:**
```
OPEN "data.bin" FOR READ AS file%

READ count% FROM file%
DIM numbers%[count%]

FOR i% = 1 TO count%
    READ numbers%[i%] FROM file%
NEXT i%

CLOSE file%
```

### Writing to Files

EduBASIC supports both text and binary writing operations.

#### WRITE Statement (Text and Binary)

The `WRITE` statement writes data to a file. For text, it writes the string representation. For binary, it writes the raw binary data.

**Syntax:**
```
WRITE expression TO fileHandle%
WRITE "text" TO fileHandle%
WRITE variable TO fileHandle%
```

**Rules:**
- For strings: writes the text followed by a newline
- For numbers: writes the binary representation (not text)
- Multiple `WRITE` statements can be used to build file content
- Text and binary operations can be mixed in the same file

**Examples:**
```
OPEN "output.txt" FOR OVERWRITE AS file%

WRITE "Name: " TO file%
WRITE playerName$ TO file%
WRITE "Score: " TO file%
WRITE score% TO file%

CLOSE file%
```

**Binary Writing Example:**
```
OPEN "data.bin" FOR OVERWRITE AS file%

LET count% = 5
WRITE count% TO file%    ' Write binary integer

FOR i% = 1 TO count%
    WRITE numbers%[i%] TO file%    ' Write binary integers
NEXT i%

CLOSE file%
```

### File Navigation

#### SEEK Statement

The `SEEK` statement positions the file pointer at a specific byte position.

**Syntax:**
```
SEEK position% IN #fileHandle%
```

**Rules:**
- Position is always in bytes (0-based)
- Position 0 is the beginning of the file
- For text files, positions refer to UTF-8 byte positions
- Seeking past end of file is allowed (file will extend on write)

**Examples:**
```
OPEN "data.bin" FOR READ AS file%

SEEK 100 IN #file%    ' Jump to byte 100
READ value% FROM file%

SEEK 0 IN #file%      ' Return to beginning
CLOSE file%
```

#### EOF Function

The `EOF` function checks if the file pointer is at the end of the file.

**Syntax:**
```
EOF fileHandle%
```

**Returns:** Integer (0 = false, -1 = true)

**Examples:**
```
OPEN "data.txt" FOR READ AS file%

WHILE NOT EOF file%
    LINE INPUT line$ FROM #file%
    PRINT line$
WEND

CLOSE file%
```

#### LOC Function

The `LOC` function returns the current byte position in the file.

**Syntax:**
```
LOC fileHandle%
```

**Returns:** Integer (current byte position, 0-based)

**Examples:**
```
OPEN "data.bin" FOR READ AS file%

LET startPos% = LOC file%
READ value% FROM file%
LET endPos% = LOC file%
LET bytesRead% = endPos% - startPos%

CLOSE file%
```

### Convenience File Operations

EduBASIC provides convenient statements for common file operations.

#### READFILE Statement

The `READFILE` statement reads an entire file into a string variable.

**Syntax:**
```
READFILE "filename" INTO contentVariable$
```

**Examples:**
```
READFILE "config.txt" INTO config$
PRINT config$

READFILE "data.json" INTO jsonData$
' Process jsonData$
```

#### WRITEFILE Statement

The `WRITEFILE` statement writes an entire string to a file.

**Syntax:**
```
WRITEFILE "filename" FROM contentVariable$
WRITEFILE contentVariable$ TO "filename"
```

**Examples:**
```
LET report$ = "Sales Report" + CHR$(10) + "Total: $1000"
WRITEFILE "report.txt" FROM report$

WRITEFILE output$ TO "results.txt"
```

#### LISTDIR Statement

The `LISTDIR` statement lists files in a directory.

**Syntax:**
```
LISTDIR "path" INTO filesArray$[]
```

**Rules:**
- Returns an array of filenames (strings)
- Array is 1-based
- Includes files and subdirectories
- Use `DIM` to declare the array first, or it will be created automatically

**Examples:**
```
LISTDIR "." INTO files$[]
FOR i% = 1 TO LEN(files$[])
    PRINT files$[i%]
NEXT i%

LISTDIR "/Users/name/Documents" INTO docs$[]
```

#### MKDIR Statement

The `MKDIR` statement creates a directory.

**Syntax:**
```
MKDIR "path"
```

**Examples:**
```
MKDIR "backups"
MKDIR "/Users/name/data"
```

#### RMDIR Statement

The `RMDIR` statement removes an empty directory.

**Syntax:**
```
RMDIR "path"
```

**Examples:**
```
RMDIR "temp"
RMDIR "/Users/name/old_data"
```

#### COPY Statement

The `COPY` statement copies a file.

**Syntax:**
```
COPY "source" TO "destination"
```

**Examples:**
```
COPY "data.txt" TO "backup.txt"
COPY "/source/file.bin" TO "/dest/file.bin"
```

#### MOVE Statement

The `MOVE` statement moves or renames a file.

**Syntax:**
```
MOVE "source" TO "destination"
```

**Examples:**
```
MOVE "oldname.txt" TO "newname.txt"
MOVE "/temp/file.txt" TO "/final/file.txt"
```

#### DELETE Statement

The `DELETE` statement deletes a file.

**Syntax:**
```
DELETE "filename"
```

**Examples:**
```
DELETE "temp.txt"
DELETE "/Users/name/old_data.bin"
```

### File I/O Examples

**Example: Reading and Writing Text:**
```
OPEN "students.txt" FOR READ AS inputFile%
OPEN "grades.txt" FOR OVERWRITE AS outputFile%

WHILE NOT EOF inputFile%
    LINE INPUT line$ FROM #inputFile%
    ' Parse line$ to extract name$ and score%
    ' (parsing logic here)
    
    IF score% >= 90 THEN
        WRITE name$ TO outputFile%
        WRITE "A" TO outputFile%
    END IF
WEND

CLOSE inputFile%
CLOSE outputFile%
```

**Example: Binary Data Storage:**
```
' Write binary data
OPEN "scores.bin" FOR OVERWRITE AS file%
LET count% = 3
WRITE count% TO file%
WRITE 95 TO file%
WRITE 87 TO file%
WRITE 92 TO file%
CLOSE file%

' Read binary data
OPEN "scores.bin" FOR READ AS file%
READ count% FROM file%
DIM scores%[count%]
FOR i% = 1 TO count%
    READ scores%[i%] FROM file%
NEXT i%
CLOSE file%
```

**Example: Mixed Text and Binary:**
```
OPEN "mixed.dat" FOR OVERWRITE AS file%

' Write text header
WRITE "Data File v1.0" TO file%

' Write binary data
LET recordCount% = 10
WRITE recordCount% TO file%
FOR i% = 1 TO recordCount%
    WRITE data%[i%] TO file%
NEXT i%

' Write text footer
WRITE "End of file" TO file%

CLOSE file%
```

## Graphics

EduBASIC provides a comprehensive graphics system for drawing shapes, sprites, and images. The graphics display is separate from the text system and is rendered at a fixed resolution of 640×480 pixels.

**Coordinate System:**
- Graphics coordinates use **(0, 0) at the bottom-left corner** (mathematical convention)
- X increases to the right (0 to 639)
- Y increases upward (0 to 479)
- This is different from the text grid, which uses 1-based coordinates with top-left origin

**Color Format:**
- All graphics operations use **32-bit RGBA** color format
- Format: `0xRRGGBBAA` (hexadecimal) or decimal
- Each component (R, G, B, A) ranges from 0-255
- Alpha channel controls transparency (0 = fully transparent, 255 = fully opaque)

**Coordinate Syntax:**
- Graphics commands use parentheses to denote planar points: `(x, y)`
- This is an exception to EduBASIC's general rule that parentheses are only for grouping expressions
- Coordinates are always written as `(x%, y%)` or `(x#, y#)` in graphics commands

**Note:** The text display system overlays the graphics display, allowing you to combine text and graphics in the same program.

### CLS Statement

The `CLS` statement clears the graphics screen.

**Syntax:**
```
CLS
CLS WITH backgroundColor%
```

**Rules:**
- Without a color, clears to black (0x000000FF)
- With a color, clears to the specified background color
- Does not affect the text display

**Examples:**
```
CLS    ' Clear to black

CLS WITH &H000033FF    ' Clear to dark blue
```

### PSET Statement

The `PSET` statement sets a single pixel to a specified color.

**Syntax:**
```
PSET (x%, y%) WITH color%
```

**Rules:**
- Coordinates are in graphics pixels (0-based, bottom-left origin)
- X ranges from 0 to 639
- Y ranges from 0 to 479
- Color is a 32-bit RGBA integer

**Examples:**
```
PSET (100, 200) WITH &HFF0000FF    ' Red pixel

FOR i% = 0 TO 639
    PSET (i%, 240) WITH &HFFFFFFFF    ' White horizontal line
NEXT i%
```

### LINE Statement

The `LINE` statement draws a line between two points.

**Syntax:**
```
LINE FROM (x1%, y1%) TO (x2%, y2%) WITH color%
LINE FROM (x1%, y1%) TO (x2%, y2%) WITH color% FILLED
```

**Rules:**
- Draws a line from point (x1%, y1%) to point (x2%, y2%)
- With `FILLED`, draws a filled rectangle (useful for drawing boxes)
- Coordinates are in graphics pixels (0-based, bottom-left origin)

**Examples:**
```
LINE FROM (10, 10) TO (100, 50) WITH &H00FF00FF    ' Green line

' Draw a rectangle outline
LINE FROM (50, 50) TO (150, 150) WITH &HFFFFFFFF

' Draw a filled rectangle
LINE FROM (200, 200) TO (300, 300) WITH &HFF0000FF FILLED
```

### CIRCLE Statement

The `CIRCLE` statement draws a circle or ellipse.

**Syntax:**
```
CIRCLE AT (x%, y%) RADIUS radius# WITH color%
CIRCLE AT (x%, y%) RADIUS radius# WITH color% FILLED
CIRCLE AT (x%, y%) RADIUS radius# WITH color% ASPECT aspectRatio#
```

**Rules:**
- Center point is at (x%, y%)
- Radius is a real number (can be fractional)
- With `FILLED`, draws a filled circle
- With `ASPECT`, draws an ellipse with the specified aspect ratio (width/height)
- Coordinates are in graphics pixels (0-based, bottom-left origin)

**Examples:**
```
CIRCLE AT (320, 240) RADIUS 50 WITH &HFFFF00FF    ' Yellow circle

CIRCLE AT (100, 100) RADIUS 30 WITH &H00FF00FF FILLED    ' Filled green circle

CIRCLE AT (200, 200) RADIUS 40 WITH &HFF00FFFF ASPECT 2.0    ' Ellipse (2:1 width:height)
```

### TRIANGLE Statement

The `TRIANGLE` statement draws a triangle or filled triangle.

**Syntax:**
```
TRIANGLE (x1%, y1%) TO (x2%, y2%) TO (x3%, y3%) WITH color%
TRIANGLE (x1%, y1%) TO (x2%, y2%) TO (x3%, y3%) WITH color% FILLED
```

**Rules:**
- Draws a triangle with vertices at (x1%, y1%), (x2%, y2%), and (x3%, y3%)
- With `FILLED`, draws a filled triangle
- Without `FILLED`, draws only the triangle outline
- Coordinates are in graphics pixels (0-based, bottom-left origin)

**Examples:**
```
' Draw triangle outline
TRIANGLE (100, 100) TO (200, 200) TO (150, 250) WITH &HFFFFFFFF

' Draw filled triangle
TRIANGLE (50, 50) TO (150, 50) TO (100, 150) WITH &HFF0000FF FILLED
```

### PAINT Statement

The `PAINT` statement fills a bounded area with a color.

**Syntax:**
```
PAINT (x%, y%) WITH color%
PAINT (x%, y%) WITH color% BORDER borderColor%
```

**Rules:**
- Fills the area starting at point (x%, y%)
- Fills until it reaches a boundary
- With `BORDER`, fills until it reaches pixels of the specified border color
- Without `BORDER`, fills until it reaches pixels of a different color than the starting point
- Coordinates are in graphics pixels (0-based, bottom-left origin)

**Examples:**
```
' Fill area starting at (100, 100) with red
PAINT (100, 100) WITH &HFF0000FF

' Fill area bounded by blue pixels
PAINT (200, 200) WITH &H00FF00FF BORDER &H0000FFFF
```

### GET Statement

The `GET` statement captures a rectangular region of the screen into an integer array (sprite).

**Syntax:**
```
GET spriteArray%[] FROM (x1%, y1%) TO (x2%, y2%)
```

**Rules:**
- Captures the rectangular region from (x1%, y1%) to (x2%, y2%)
- Stores the sprite data in an integer array
- Array format: `[width, height, pixel1, pixel2, ...]`
  - First integer: width in pixels
  - Second integer: height in pixels
  - Remaining integers: pixel colors (32-bit RGBA, row by row)
- The array must be large enough or will be automatically sized
- Coordinates are in graphics pixels (0-based, bottom-left origin)

**Examples:**
```
' Capture a 32x32 sprite
DIM sprite%[32 * 32 + 2]
GET sprite%[] FROM (100, 100) TO (131, 131)

' Capture entire screen
DIM screen%[640 * 480 + 2]
GET screen%[] FROM (0, 0) TO (639, 479)
```

### PUT Statement

The `PUT` statement draws a sprite (from a `GET` array) onto the screen.

**Syntax:**
```
PUT spriteArray%[] AT (x%, y%)
```

**Rules:**
- Draws the sprite at position (x%, y%)
- The sprite's bottom-left corner is positioned at (x%, y%)
- Sprite array format must match `GET` format: `[width, height, pixel1, pixel2, ...]`
- Pixels are alpha-blended automatically using the alpha channel from the sprite data
- Transparent pixels (alpha = 0) are not drawn
- Semi-transparent pixels are blended with the background
- Coordinates are in graphics pixels (0-based, bottom-left origin)

**Examples:**
```
' Draw sprite with automatic alpha blending
PUT sprite%[] AT (200, 150)

' Animate sprite
PUT player%[] AT (x%, y%)
```

### COLOR Statement (Graphics)

The `COLOR` statement sets the current drawing color for graphics operations.

**Syntax:**
```
COLOR color%
```

**Rules:**
- Sets the default color for subsequent graphics operations
- Color is a 32-bit RGBA integer
- Affects `PSET`, `LINE`, `CIRCLE`, `TRIANGLE`, and other drawing operations
- Does not affect `PUT` operations (which use the sprite's stored colors with alpha blending)
- Persists until changed by another `COLOR` statement

**Examples:**
```
COLOR &HFF0000FF    ' Set to red
PSET (100, 100) WITH &HFF0000FF    ' Red pixel (color specified explicitly)

COLOR &H00FF00FF    ' Set to green
LINE FROM (0, 0) TO (100, 100) WITH &H00FF00FF    ' Green line
```

**Note:** The graphics `COLOR` statement is separate from the text `COLOR` statement. They operate independently.

### Graphics Examples

**Example: Drawing a Simple Scene:**
```
CLS WITH &H000033FF    ' Dark blue background

' Draw ground
LINE FROM (0, 50) TO (639, 50) WITH &H00FF00FF FILLED

' Draw sun
CIRCLE AT (550, 400) RADIUS 40 WITH &HFFFF00FF FILLED

' Draw house
LINE FROM (200, 50) TO (400, 200) WITH &HFF0000FF FILLED    ' Red roof
LINE FROM (250, 50) TO (350, 150) WITH &HFFFFFFFF FILLED    ' White walls
```

**Example: Sprite Animation:**
```
' Capture sprite
DIM player%[32 * 32 + 2]
GET player%[] FROM (0, 0) TO (31, 31)

LET x% = 100
LET y% = 100

' Animation loop
DO
    CLS
    
    ' Draw sprite at current position (alpha blending handles transparency)
    PUT player%[] AT (x%, y%)
    
    ' Update position
    LET x% += 2
    IF x% > 600 THEN LET x% = 0
    
    ' Small delay
    FOR i% = 1 TO 1000
    NEXT i%
LOOP
```

## Audio

## Command and Function Reference

This section provides an alphabetical reference of all EduBASIC commands, functions, and operators.

---

### ACOS

**Type:** Function (Trigonometric)  
**Syntax:** `ACOS x#`  
**Description:** Returns the arccosine of `x` in radians. Input must be in range [-1, 1].  
**Example:**
```
LET angle# = ACOS 0.5
PRINT angle#    ' Prints: 1.047... (π/3 radians)
```

---

### ACOSH

**Type:** Function (Hyperbolic)  
**Syntax:** `ACOSH x#`  
**Description:** Returns the inverse hyperbolic cosine of `x`. Input must be ≥ 1.  
**Example:**
```
LET result# = ACOSH 2.0
```

---

### AND

**Type:** Operator (Boolean/Bitwise)  
**Syntax:** `expression1 AND expression2`  
**Description:** Bitwise AND operation. Output bit is 1 when both input bits are 1.  
**Example:**
```
LET result% = 12 AND 10    ' Binary: 1100 AND 1010 = 1000 (8)
IF (x% > 0) AND (y% < 10) THEN PRINT "Valid"
```

---

### ASIN

**Type:** Function (Trigonometric)  
**Syntax:** `ASIN x#`  
**Description:** Returns the arcsine of `x` in radians. Input must be in range [-1, 1].  
**Example:**
```
LET angle# = ASIN 0.5
PRINT angle#    ' Prints: 0.524... (π/6 radians)
```

---

### ASINH

**Type:** Function (Hyperbolic)  
**Syntax:** `ASINH x#`  
**Description:** Returns the inverse hyperbolic sine of `x`.  
**Example:**
```
LET result# = ASINH 1.0
```

---

### ATAN

**Type:** Function (Trigonometric)  
**Syntax:** `ATAN x#`  
**Description:** Returns the arctangent of `x` in radians.  
**Example:**
```
LET angle# = ATAN 1.0
PRINT angle#    ' Prints: 0.785... (π/4 radians)
```

---

### ATANH

**Type:** Function (Hyperbolic)  
**Syntax:** `ATANH x#`  
**Description:** Returns the inverse hyperbolic tangent of `x`. Input must be in range (-1, 1).  
**Example:**
```
LET result# = ATANH 0.5
```

---

### CABS

**Type:** Function (Complex)  
**Syntax:** `CABS z&`  
**Description:** Returns the absolute value (magnitude) of complex number `z`.  
**Example:**
```
LET z& = 3+4i
LET magnitude# = CABS z&
PRINT magnitude#    ' Prints: 5.0
```

---

### CALL

**Type:** Command (Control Flow)  
**Syntax:** `CALL subroutineName(arg1, arg2, ...)`  
**Description:** Calls a `SUB` procedure with arguments. The `CALL` keyword is optional.  
**Example:**
```
CALL DrawBox(10, 5, "*")
DrawBox 20, 3, "#"    ' Same as CALL DrawBox(20, 3, "#")
```

---

### CARG

**Type:** Function (Complex)  
**Syntax:** `CARG z&`  
**Description:** Returns the argument (phase angle) of complex number `z` in radians.  
**Example:**
```
LET z& = 1+1i
LET angle# = CARG z&
PRINT angle#    ' Prints: 0.785... (π/4 radians)
```

---

### CASE

**Type:** Command (Control Flow)  
**Syntax:** `CASE value` or `CASE value1, value2, ...` or `CASE IS operator value` or `CASE value1 TO value2`  
**Description:** Defines a case within a `SELECT CASE` statement.  
**Example:**
```
SELECT CASE grade%
    CASE 90 TO 100
        PRINT "A"
    CASE 80 TO 89
        PRINT "B"
    CASE ELSE
        PRINT "Other"
END SELECT
```

---

### CBRT

**Type:** Function (Math)  
**Syntax:** `CBRT x#`  
**Description:** Returns the cube root of `x`.  
**Example:**
```
LET result# = CBRT 27
PRINT result#    ' Prints: 3.0
```

---

### CEIL

**Type:** Function (Rounding)  
**Syntax:** `CEIL x#`  
**Description:** Rounds `x` toward positive infinity (+∞). Returns the smallest integer ≥ `x`.  
**Example:**
```
PRINT CEIL 3.2     ' Prints: 4
PRINT CEIL -3.7    ' Prints: -3
```

---

### CONJ

**Type:** Function (Complex)  
**Syntax:** `CONJ z&`  
**Description:** Returns the complex conjugate of `z` (negates the imaginary part).  
**Example:**
```
LET z& = 3+4i
LET conjugate& = CONJ z&
PRINT conjugate&    ' Prints: 3-4i
```

---

### COS

**Type:** Function (Trigonometric)  
**Syntax:** `COS x#`  
**Description:** Returns the cosine of `x` (where `x` is in radians).  
**Example:**
```
LET result# = COS 0
PRINT result#    ' Prints: 1.0
```

---

### COSH

**Type:** Function (Hyperbolic)  
**Syntax:** `COSH x#`  
**Description:** Returns the hyperbolic cosine of `x`.  
**Example:**
```
LET result# = COSH 0
PRINT result#    ' Prints: 1.0
```

---

### CSQRT

**Type:** Function (Complex)  
**Syntax:** `CSQRT z&`  
**Description:** Returns the complex square root of `z`.  
**Example:**
```
LET z& = -1+0i
LET root& = CSQRT z&
PRINT root&    ' Prints: 0+1i
```

---

### DEG

**Type:** Operator (Unit Conversion)  
**Syntax:** `expression DEG`  
**Description:** Postfix operator that converts radians to degrees.  
**Example:**
```
LET degrees# = (3.14159 / 2) DEG
PRINT degrees#    ' Prints: 90.0
```

---

### DIM

**Type:** Command (Variable Declaration)  
**Syntax:** `DIM arrayName[size]` or `DIM arrayName[start TO end]`  
**Description:** Declares an array or structure. Arrays are one-based by default.  
**Example:**
```
DIM numbers%[10]              ' Array with indices 1 to 10
DIM studentNames$[0 TO 11]    ' Array with indices 0 to 11
DIM matrix#[5, 10]            ' Two-dimensional array
```

---

### DO

**Type:** Command (Control Flow)  
**Syntax:** `DO WHILE condition` or `DO UNTIL condition` or `DO` with `LOOP WHILE` or `LOOP UNTIL`  
**Description:** Begins a `DO` loop with optional condition at top or bottom.  
**Example:**
```
DO WHILE count% < 10
    PRINT count%
    LET count% += 1
LOOP

DO
    INPUT "Enter value: ", value%
LOOP UNTIL value% = 0
```

---

### ELSE

**Type:** Command (Control Flow)  
**Syntax:** `ELSE`  
**Description:** Defines the alternative branch in an `IF` or `UNLESS` statement.  
**Example:**
```
IF score% >= 60 THEN
    PRINT "Pass"
ELSE
    PRINT "Fail"
END IF
```

---

### ELSEIF

**Type:** Command (Control Flow)  
**Syntax:** `ELSEIF condition THEN`  
**Description:** Adds additional conditional branches to an `IF` statement.  
**Example:**
```
IF age% < 13 THEN
    PRINT "Child"
ELSEIF age% < 20 THEN
    PRINT "Teenager"
ELSE
    PRINT "Adult"
END IF
```

---

### END

**Type:** Command (Control Flow)  
**Syntax:** `END`  
**Description:** Terminates program execution immediately.  
**Example:**
```
IF criticalError% THEN
    PRINT "Fatal error!"
    END
END IF
```

---

### END IF

**Type:** Command (Control Flow)  
**Syntax:** `END IF`  
**Description:** Terminates an `IF` statement block.  
**Example:**
```
IF x% > 0 THEN
    PRINT "Positive"
END IF
```

---

### END SELECT

**Type:** Command (Control Flow)  
**Syntax:** `END SELECT`  
**Description:** Terminates a `SELECT CASE` statement block.  
**Example:**
```
SELECT CASE grade%
    CASE 90 TO 100
        PRINT "A"
END SELECT
```

---

### END SUB

**Type:** Command (Control Flow)  
**Syntax:** `END SUB`  
**Description:** Terminates a `SUB` procedure definition.  
**Example:**
```
SUB PrintMessage (msg$)
    PRINT msg$
END SUB
```

---

### END UNLESS

**Type:** Command (Control Flow)  
**Syntax:** `END UNLESS`  
**Description:** Terminates an `UNLESS` statement block.  
**Example:**
```
UNLESS valid% THEN
    PRINT "Invalid input"
END UNLESS
```

---

### EXIT

**Type:** Command (Control Flow)  
**Syntax:** `EXIT FOR` or `EXIT WHILE` or `EXIT DO` or `EXIT SUB`  
**Description:** Immediately exits from the specified loop or procedure.  
**Example:**
```
FOR i% = 1 TO 100
    IF found% THEN EXIT FOR
NEXT i%

DO
    IF quit% THEN EXIT DO
LOOP
```

---

### EXP

**Type:** Function (Math)  
**Syntax:** `EXP x#`  
**Description:** Returns e raised to the power `x` (e^x).  
**Example:**
```
LET result# = EXP 1
PRINT result#    ' Prints: 2.718... (e)
```

---

### EXPAND

**Type:** Function (Rounding)  
**Syntax:** `EXPAND x#`  
**Description:** Rounds `x` away from zero.  
**Example:**
```
PRINT EXPAND 3.1     ' Prints: 4
PRINT EXPAND -3.1    ' Prints: -4
```

---

### FLOOR

**Type:** Function (Rounding)  
**Syntax:** `FLOOR x#`  
**Description:** Rounds `x` toward negative infinity (-∞). Returns the largest integer ≤ `x`.  
**Example:**
```
PRINT FLOOR 3.7      ' Prints: 3
PRINT FLOOR -3.2     ' Prints: -4
```

---

### FOR

**Type:** Command (Control Flow)  
**Syntax:** `FOR variable = start TO end [STEP increment]`  
**Description:** Begins a `FOR` loop that iterates a variable through a range.  
**Example:**
```
FOR i% = 1 TO 10
    PRINT i%
NEXT i%

FOR x# = 10 TO 0 STEP -0.5
    PRINT x#
NEXT x#
```

---

### GOSUB

**Type:** Command (Control Flow)  
**Syntax:** `GOSUB labelName`  
**Description:** Calls a subroutine at the specified label. Use `RETURN` to return.  
**Example:**
```
GOSUB PrintHeader
PRINT "Main program"
END

LABEL PrintHeader
    PRINT "=========="
RETURN
```

---

### GOTO

**Type:** Command (Control Flow)  
**Syntax:** `GOTO labelName`  
**Description:** Transfers control unconditionally to the specified label.  
**Example:**
```
LET x% = 0
LABEL Loop
    PRINT x%
    LET x% += 1
    IF x% < 5 THEN GOTO Loop
```

---

### IF

**Type:** Command (Control Flow)  
**Syntax:** `IF condition THEN statement` or `IF condition THEN ... END IF`  
**Description:** Executes code conditionally based on a boolean expression.  
**Example:**
```
IF score% >= 90 THEN PRINT "A"

IF temperature# > 100 THEN
    PRINT "Boiling!"
END IF
```

---

### IMAG

**Type:** Function (Complex)  
**Syntax:** `IMAG z&`  
**Description:** Returns the imaginary part of complex number `z`.  
**Example:**
```
LET z& = 3+4i
LET imagPart# = IMAG z&
PRINT imagPart#    ' Prints: 4.0
```

---

### IMP

**Type:** Operator (Boolean/Bitwise)  
**Syntax:** `expression1 IMP expression2`  
**Description:** Bitwise implication. Output bit is 1 when first bit is 0 or second bit is 1.  
**Example:**
```
LET result% = 5 IMP 3    ' Binary implication
```

---

### LABEL

**Type:** Command (Control Flow)  
**Syntax:** `LABEL labelName`  
**Description:** Defines a label that can be targeted by `GOTO` or `GOSUB`.  
**Example:**
```
LABEL StartProgram
PRINT "Starting..."

LABEL MainLoop
PRINT "Looping..."
```

---

### LET

**Type:** Command (Variable Assignment)  
**Syntax:** `LET variable = expression`  
**Description:** Assigns a value to a variable. Creates module-level (global) variables.  
**Example:**
```
LET count% = 10
LET name$ = "Alice"
LET result# = 3.14159
LET complex& = 3+4i
```

---

### LOCAL

**Type:** Command (Variable Assignment)  
**Syntax:** `LOCAL variable = expression`  
**Description:** Creates a variable local to the current `SUB` procedure.  
**Example:**
```
SUB Calculate ()
    LOCAL temp% = 10    ' Local to this SUB
    LOCAL result# = 0   ' Local to this SUB
END SUB
```

---

### LOG

**Type:** Function (Math)  
**Syntax:** `LOG x#`  
**Description:** Returns the natural logarithm (base e) of `x`.  
**Example:**
```
LET result# = LOG 2.718
PRINT result#    ' Prints: 1.0 (approximately)
```

---

### LOG10

**Type:** Function (Math)  
**Syntax:** `LOG10 x#`  
**Description:** Returns the common logarithm (base 10) of `x`.  
**Example:**
```
LET result# = LOG10 100
PRINT result#    ' Prints: 2.0
```

---

### LOG2

**Type:** Function (Math)  
**Syntax:** `LOG2 x#`  
**Description:** Returns the binary logarithm (base 2) of `x`.  
**Example:**
```
LET result# = LOG2 8
PRINT result#    ' Prints: 3.0
```

---

### LOOP

**Type:** Command (Control Flow)  
**Syntax:** `LOOP` or `LOOP WHILE condition` or `LOOP UNTIL condition`  
**Description:** Marks the end of a `DO` loop, with optional condition at bottom.  
**Example:**
```
DO
    PRINT "Hello"
LOOP WHILE continue%

DO
    INPUT "Value: ", val%
LOOP UNTIL val% = 0
```

---

### MOD

**Type:** Operator (Arithmetic)  
**Syntax:** `expression1 MOD expression2`  
**Description:** Returns the remainder of integer division.  
**Example:**
```
LET remainder% = 17 MOD 5
PRINT remainder%    ' Prints: 2
```

---

### NAND

**Type:** Operator (Boolean/Bitwise)  
**Syntax:** `expression1 NAND expression2`  
**Description:** Bitwise NAND. Output bit is 1 when at least one input bit is 0.  
**Example:**
```
LET result% = 12 NAND 10
```

---

### NEXT

**Type:** Command (Control Flow)  
**Syntax:** `NEXT [variable]`  
**Description:** Marks the end of a `FOR` loop. Variable name is optional.  
**Example:**
```
FOR i% = 1 TO 10
    PRINT i%
NEXT i%

FOR j% = 1 TO 5
    PRINT j%
NEXT
```

---

### NOR

**Type:** Operator (Boolean/Bitwise)  
**Syntax:** `expression1 NOR expression2`  
**Description:** Bitwise NOR. Output bit is 1 when both input bits are 0.  
**Example:**
```
LET result% = 12 NOR 10
```

---

### NOT

**Type:** Operator (Boolean/Bitwise)  
**Syntax:** `NOT expression`  
**Description:** Bitwise NOT. Output bit is 1 when the input bit is 0.  
**Example:**
```
LET result% = NOT 5
IF NOT gameOver% THEN GOSUB UpdateGame
```

---

### OR

**Type:** Operator (Boolean/Bitwise)  
**Syntax:** `expression1 OR expression2`  
**Description:** Bitwise OR. Output bit is 1 when at least one input bit is 1.  
**Example:**
```
LET result% = 12 OR 10    ' Binary: 1100 OR 1010 = 1110 (14)
IF (x% = 0) OR (y% = 0) THEN PRINT "Zero found"
```

---

### RAD

**Type:** Operator (Unit Conversion)  
**Syntax:** `expression RAD`  
**Description:** Postfix operator that converts degrees to radians.  
**Example:**
```
LET radians# = 90 RAD
PRINT radians#    ' Prints: 1.5708... (π/2 radians)
```

---

### RANDOMIZE

**Type:** Command (Random)  
**Syntax:** `RANDOMIZE` or `RANDOMIZE seed%`  
**Description:** Seeds the random number generator. Without argument, uses `TIMER%`.  
**Example:**
```
RANDOMIZE              ' Seed with system timer
RANDOMIZE 12345        ' Seed with specific value
```

---

### REAL

**Type:** Function (Complex)  
**Syntax:** `REAL z&`  
**Description:** Returns the real part of complex number `z`.  
**Example:**
```
LET z& = 3+4i
LET realPart# = REAL z&
PRINT realPart#    ' Prints: 3.0
```

---

### RETURN

**Type:** Command (Control Flow)  
**Syntax:** `RETURN`  
**Description:** Returns from a `GOSUB` subroutine to the statement after the `GOSUB` call.  
**Example:**
```
GOSUB PrintMessage
PRINT "Done"
END

LABEL PrintMessage
    PRINT "Hello!"
RETURN
```

---

### RND

**Type:** Function (Random)  
**Syntax:** `RND`  
**Description:** Returns a random real number in the range [0, 1).  
**Example:**
```
LET random# = RND
LET dice% = INT(RND * 6) + 1    ' Random integer 1-6
```

---

### ROUND

**Type:** Function (Rounding)  
**Syntax:** `ROUND x#`  
**Description:** Rounds `x` to the nearest integer. Ties round up.  
**Example:**
```
PRINT ROUND 3.5      ' Prints: 4
PRINT ROUND 3.4      ' Prints: 3
```

---

### SELECT CASE

**Type:** Command (Control Flow)  
**Syntax:** `SELECT CASE expression ... END SELECT`  
**Description:** Multi-way branching based on the value of an expression.  
**Example:**
```
SELECT CASE grade%
    CASE 90 TO 100
        PRINT "A"
    CASE 80 TO 89
        PRINT "B"
    CASE ELSE
        PRINT "Other"
END SELECT
```

---

### SGN

**Type:** Function (Math)  
**Syntax:** `SGN x#`  
**Description:** Returns the sign of `x`: -1 (negative), 0 (zero), or 1 (positive).  
**Example:**
```
PRINT SGN 5        ' Prints: 1
PRINT SGN -3       ' Prints: -1
PRINT SGN 0        ' Prints: 0
```

---

### SIN

**Type:** Function (Trigonometric)  
**Syntax:** `SIN x#`  
**Description:** Returns the sine of `x` (where `x` is in radians).  
**Example:**
```
LET result# = SIN (90 RAD)
PRINT result#    ' Prints: 1.0
```

---

### SINH

**Type:** Function (Hyperbolic)  
**Syntax:** `SINH x#`  
**Description:** Returns the hyperbolic sine of `x`.  
**Example:**
```
LET result# = SINH 0
PRINT result#    ' Prints: 0.0
```

---

### SQRT

**Type:** Function (Math)  
**Syntax:** `SQRT x#`  
**Description:** Returns the square root of `x`.  
**Example:**
```
LET result# = SQRT 16
PRINT result#    ' Prints: 4.0
```

---

### STEP

**Type:** Keyword (Control Flow)  
**Syntax:** Used within `FOR` loops  
**Description:** Specifies the increment/decrement value for a `FOR` loop.  
**Example:**
```
FOR i% = 0 TO 100 STEP 10
    PRINT i%
NEXT i%
```

---

### SUB

**Type:** Command (Control Flow)  
**Syntax:** `SUB name (parameters) ... END SUB`  
**Description:** Defines a subroutine procedure that can accept parameters.  
**Example:**
```
SUB DrawBox (width%, height%, char$)
    FOR row% = 1 TO height%
        FOR col% = 1 TO width%
            PRINT char$;
        NEXT col%
        PRINT
    NEXT row%
END SUB
```

---

### SWAP

**Type:** Command (Variable Operation)  
**Syntax:** `SWAP variable1 WITH variable2`  
**Description:** Exchanges the values of two variables of the same type.  
**Example:**
```
LET x% = 5
LET y% = 10
SWAP x% WITH y%
PRINT x%, y%    ' Prints: 10    5
```

---

### TAN

**Type:** Function (Trigonometric)  
**Syntax:** `TAN x#`  
**Description:** Returns the tangent of `x` (where `x` is in radians).  
**Example:**
```
LET result# = TAN (45 RAD)
PRINT result#    ' Prints: 1.0
```

---

### TANH

**Type:** Function (Hyperbolic)  
**Syntax:** `TANH x#`  
**Description:** Returns the hyperbolic tangent of `x`.  
**Example:**
```
LET result# = TANH 0
PRINT result#    ' Prints: 0.0
```

---

### THEN

**Type:** Keyword (Control Flow)  
**Syntax:** Used with `IF` and `UNLESS`  
**Description:** Separates the condition from the action in conditional statements.  
**Example:**
```
IF x% > 0 THEN PRINT "Positive"
```

---

### TO

**Type:** Keyword (Control Flow)  
**Syntax:** Used within `FOR` loops and `CASE` clauses  
**Description:** Specifies a range in `FOR` loops or `CASE` statements.  
**Example:**
```
FOR i% = 1 TO 10
NEXT i%

CASE 90 TO 100
    PRINT "A"
```

---

### TRUNC

**Type:** Function (Rounding)  
**Syntax:** `TRUNC x#`  
**Description:** Rounds `x` toward zero (truncates the decimal part).  
**Example:**
```
PRINT TRUNC 3.9      ' Prints: 3
PRINT TRUNC -3.9     ' Prints: -3
```

---

### UNLESS

**Type:** Command (Control Flow)  
**Syntax:** `UNLESS condition THEN statement` or `UNLESS condition THEN ... END UNLESS`  
**Description:** Syntactic sugar for `IF NOT`. Executes when condition is false.  
**Example:**
```
UNLESS valid% THEN PRINT "Invalid"

UNLESS password$ = "secret" THEN
    PRINT "Access denied"
END UNLESS
```

---

### WEND

**Type:** Command (Control Flow)  
**Syntax:** `WEND`  
**Description:** Marks the end of a `WHILE` or `UNTIL` loop.  
**Example:**
```
WHILE count% < 10
    PRINT count%
    LET count% += 1
WEND
```

---

### WHILE

**Type:** Command (Control Flow)  
**Syntax:** `WHILE condition ... WEND`  
**Description:** Repeats a block while a condition is true. Condition tested before each iteration.  
**Example:**
```
LET count% = 0
WHILE count% < 10
    PRINT count%
    LET count% += 1
WEND
```

---

### XNOR

**Type:** Operator (Boolean/Bitwise)  
**Syntax:** `expression1 XNOR expression2`  
**Description:** Bitwise XNOR. Output bit is 1 when both input bits are the same.  
**Example:**
```
LET result% = 12 XNOR 10
```

---

### XOR

**Type:** Operator (Boolean/Bitwise)  
**Syntax:** `expression1 XOR expression2`  
**Description:** Bitwise XOR. Output bit is 1 when the input bits are different.  
**Example:**
```
LET result% = 12 XOR 10    ' Binary: 1100 XOR 1010 = 0110 (6)
```

