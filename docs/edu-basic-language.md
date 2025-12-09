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

#### Basic Arithmetic Operators

| Operator    | Description    | Example                        |
|-------------|----------------|--------------------------------|
| `+`         | Addition       | `LET totalSum% = 5 + 3`        |
| `-`         | Subtraction    | `LET difference% = 10 - 4`     |
| `*`         | Multiplication | `LET product% = 6 * 7`         |
| `/`         | Division       | `LET quotient# = 15 / 4`       |
| `^` or `**` | Exponentiation | `LET powerResult# = 2 ^ 8`     |
| `!`         | Factorial      | `LET factorialNum% = 5!`       |

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

#### Absolute Value / Norm

Use vertical bars for absolute value (for reals) or norm (for complex numbers):
```
LET absoluteValue# = | -5 |
LET complexNorm# = | 3+4i |
```

#### Advanced Arithmetic Functions

EduBASIC provides a rich set of arithmetic functions similar to Fortran, including trigonometric functions, logarithms, and other mathematical operations. See the [Command and Function Reference](#command-and-function-reference) section for a complete list.

### Boolean Operations

EduBASIC uses integers to represent boolean values:
- `0` represents **false**
- Any non-zero value (typically `1`) represents **true**

There is no separate boolean data type.

#### Boolean Operators

| Operator | Description  | Example                                   |
|----------|--------------|-------------------------------------------|
| `AND`    | Logical AND  | `IF (xValue% > 0) AND (yValue% < 10) THEN` |
| `OR`     | Logical OR   | `IF (xValue% = 0) OR (yValue% = 0) THEN`   |
| `NOT`    | Logical NOT  | `IF NOT (xValue% = 0) THEN`               |
| `XOR`    | Exclusive OR | `IF (flagA% XOR flagB%) THEN`             |

Boolean operations return integer values (0 for false, 1 for true).

### Comparison Operations

Standard comparison operators are available for all data types:

| Operator | Description            | Example                      |
|----------|------------------------|------------------------------|
| `=`      | Equal to               | `IF testScore% = 5 THEN`     |
| `<>`     | Not equal to           | `IF testScore% <> 0 THEN`    |
| `<`      | Less than              | `IF testScore% < 10 THEN`    |
| `>`      | Greater than           | `IF testScore% > 0 THEN`     |
| `<=`     | Less than or equal     | `IF testScore% <= 100 THEN`  |
| `>=`     | Greater than or equal  | `IF testScore% >= 0 THEN`    |

Comparison operations return integer values (0 for false, 1 for true).

### Operator Precedence

EduBASIC follows standard mathematical operator precedence:

1. Parentheses `()` (highest precedence)
2. Factorial `!`
3. Exponentiation `^` or `**`
4. Absolute value `| |`
5. Unary `+` and `-`
6. Multiplication `*` and Division `/`
7. Addition `+` and Subtraction `-`
8. Comparison operators (`=`, `<>`, `<`, `>`, `<=`, `>=`)
9. `NOT`
10. `AND`
11. `OR`, `XOR` (lowest precedence)

When operators have the same precedence, evaluation proceeds left to right.

## Control Flow

## Console I/O

## File I/O

## Graphics

## Audio

## Command and Function Reference

