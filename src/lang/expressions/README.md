# Expressions System

This document describes the expression parsing and evaluation system.

## Expression Architecture

All expressions extend the abstract `Expression` class:

```typescript
abstract class Expression extends RuntimeNode {
    abstract evaluate(context: ExecutionContext): EduBasicValue;
    abstract toString(): string;
}
```

## Core Expression Classes

The expression system uses three unified expression classes:

### BinaryExpression

**Location**: `src/lang/expressions/binary-expression.ts`

Handles all binary (infix) operators.

**Operators**:
- **Arithmetic**: `+`, `-`, `*`, `/`, `MOD`, `^`, `**`
- **Comparison**: `=`, `<>`, `<`, `>`, `<=`, `>=`
- **Logical**: `AND`, `OR`, `XOR`, `XNOR`, `NAND`, `NOR`, `IMP`

**Type Handling**:
- Integer + Integer → Integer (if result is whole number)
- Integer / Integer → Integer (if result is whole number), otherwise Real
- Mixed numeric → Real
- Complex numbers → Complex operations (automatic upcasting)
- String concatenation via `+` operator
- Comparison operators return Integer (-1 for true, 0 for false)
- Complex comparisons: Not supported (throws error)

### UnaryExpression

**Location**: `src/lang/expressions/unary-expression.ts`

Handles all unary operators and single-argument functions.

**Operators**:
- **Prefix**: `+`, `-`, `NOT`
- **Mathematical**: `SIN`, `COS`, `TAN`, `ASIN`, `ACOS`, `ATAN`, `SINH`, `COSH`, `TANH`, `ASINH`, `ACOSH`, `ATANH`, `EXP`, `LOG`, `LOG10`, `LOG2`, `SQRT`, `CBRT`, `ROUND`, `FLOOR`, `CEIL`, `TRUNC`, `EXPAND`, `SGN`, `ABS`
- **Complex**: `REAL`, `IMAG`, `REALPART`, `IMAGPART`, `CONJ`, `CABS`, `CARG`, `CSQRT`
- **String Manipulation**: `ASC`, `CHR`, `UCASE`, `LCASE`, `LTRIM`, `RTRIM`, `TRIM`, `REVERSE`
- **Type Conversion**: `INT`, `STR`, `VAL`, `HEX`, `BIN`

**Type Handling**:
- Mathematical functions automatically upcast to Complex when needed (e.g., `SQRT(-1)`, `LOG(-1)`)
- `REALPART` and `IMAGPART` work on any numeric type (extract real/imaginary parts)
- `REAL` and `IMAG` require complex operands
- Results preserve type when possible (e.g., `ABS` of integer may return integer)

### FunctionCallExpression

**Location**: `src/lang/expressions/function-call-expression.ts`

Handles multi-argument function calls.

**Functions**:
- **String**: `LEFT`, `RIGHT`, `MID`, `INSTR`, `REPLACE`, `STARTSWITH`, `ENDSWITH`
- **Array**: `FIND`, `JOIN`, `INDEXOF`, `INCLUDES`, `SIZE`, `EMPTY`, `LEN`

**Evaluation**: Validates argument count and delegates to helper evaluators.

## Nullary Expressions

**Location**: `src/lang/expressions/nullary-expression.ts`

Represents nullary operators (built-in values that take no arguments) that evaluate at runtime.

**Built-in Values**:
- `PI#`, `E#` - Mathematical constants (unchanging)
- `RND#` - Random number (evaluated fresh at runtime)
- `INKEY$` - Keyboard input (evaluated at runtime)
- `DATE$`, `TIME$`, `NOW%` - Date/time (evaluated fresh at runtime)
- `TRUE%`, `FALSE%` - Boolean constants (unchanging)

**Evaluation**: Calls `ConstantEvaluator.evaluate()` at runtime, ensuring values like `RND#` and `DATE$` are fresh on each evaluation. This is critical for runtime-dependent values - each evaluation produces a new value.

## Special Expressions

**Location**: `src/lang/expressions/special/`

Special-purpose expressions that don't fit the unified pattern:

- `LiteralExpression` - All literal values (Integer, Real, Complex, String, Array, Structure)
- `VariableExpression` - Variable access
- `ParenthesizedExpression` - `(expr)` - Groups expressions
- `ArrayAccessExpression` - `arr[index]` - Array indexing
- `StructureMemberExpression` - `struct.member` - Structure member access

## Helper Evaluators

**Location**: `src/lang/expressions/helpers/`

Helper classes encapsulate evaluation logic:

- `MathematicalFunctionEvaluator` - Mathematical functions with automatic complex upcasting
- `ComplexFunctionEvaluator` - Complex number operations (`REAL`, `IMAG`, `REALPART`, `IMAGPART`, `CONJ`, `CABS`, `CARG`, `CSQRT`)
- `StringFunctionEvaluator` - String manipulation functions
- `TypeConversionEvaluator` - Type conversion functions
- `ConstantEvaluator` - Built-in constants

## Expression Parsing

### Operator Precedence

From lowest to highest:

1. **IMP** (Implication)
2. **XOR, XNOR**
3. **OR, NOR**
4. **AND, NAND**
5. **NOT** (Unary)
6. **Comparison** (`=`, `<>`, `<`, `>`, `<=`, `>=`)
7. **Arithmetic** (`+`, `-`, `*`, `/`, `MOD`, `^`, `**`)
8. **Unary** (`+`, `-`, `NOT`, function calls)
9. **Primary** (literals, variables, parentheses, array access, structure access)

### Parsing Methods

**ExpressionParserService** uses recursive descent parsing:

- `expression()` - Entry point
- `imp()` - IMP operator
- `xorXnor()` - XOR, XNOR operators
- `orNor()` - OR, NOR operators
- `andNand()` - AND, NAND operators
- `not()` - NOT operator
- `comparison()` - Comparison operators
- `addSub()` - Addition, subtraction
- `mulDiv()` - Multiplication, division, modulo
- `exponentiation()` - Power operators
- `unary()` - Unary operators and function calls
- `primary()` - Literals, variables, parentheses, array access, structure access, function calls

## Type System

### Type Hierarchy

```
Integer → Real → Complex
String (separate)
Array (typed by element type)
Structure
```

### Automatic Type Coercion

**Numeric Coercion**:
- Integer → Real: Automatic promotion
- Real → Complex: Real part set, imaginary = 0
- Integer → Complex: Real part set, imaginary = 0

**Mathematical Functions**:
- Automatically upcast to Complex when operation requires it:
  - `SQRT` of negative → Complex
  - `LOG` of negative → Complex
  - `ASIN`/`ACOS` outside [-1, 1] → Complex
  - `ACOSH` of value < 1 → Complex
  - `ATANH` outside (-1, 1) → Complex

**Division**:
- Integer / Integer → Integer (if whole number result), otherwise Real
- Any Real operand → Real result

**Downcasting Errors**:
- Complex → Real/Integer: Throws error (use `REALPART` or `IMAGPART`)
- Detected during variable assignment in `LetStatement`

### Type Checking

- Type checking occurs during evaluation
- Invalid operations throw errors immediately
- Downcasting errors provide helpful messages

## Expression Examples

### Arithmetic
```
10 + 20          → 30 (Integer)
10.5 + 20        → 30.5 (Real)
10 / 2           → 5 (Integer)
7 / 2            → 3.5 (Real)
"Hello" + "World" → "HelloWorld" (String)
(1+2i) + (3+4i)  → (4+6i) (Complex)
```

### Comparison
```
10 < 20          → -1 (true)
10 = 20          → 0 (false)
"abc" < "def"    → -1 (true)
```

### Logical
```
10 AND 20        → -1 (true)
NOT 0            → -1 (true)
10 OR 0          → -1 (true)
```

### Mathematical
```
SIN(PI# / 2)     → 1.0 (Real)
SQRT(16)         → 4.0 (Real)
SQRT(-4)         → (0+2i) (Complex, automatic upcast)
LOG(-1)          → (0+πi) (Complex, automatic upcast)
ABS(-10)         → 10 (Real)
```

### Complex Numbers
```
REALPART((3+4i)) → 3.0 (Real)
IMAGPART((3+4i)) → 4.0 (Real)
REALPART(5)      → 5.0 (Real)
IMAGPART(5)      → 0.0 (Real)
CONJ((3+4i))     → (3-4i) (Complex)
CABS((3+4i))     → 5.0 (Real)
```

### String Functions
```
LEFT("Hello", 3)  → "Hel" (String)
MID("Hello", 2, 3) → "ell" (String)
LEN("Hello")      → 5 (Integer)
```

### Array Functions
```
SIZE([1, 2, 3])  → 3 (Integer)
FIND([1, 2, 3], 2) → 1 (Integer, 0-based)
JOIN([1, 2, 3], ",") → "1,2,3" (String)
```

### Type Conversion
```
INT(3.7)         → 3 (Integer)
STR(42)          → "42" (String)
VAL("3.14")      → 3.14 (Real)
HEX(255)         → "FF" (String)
```

## Error Handling

**Type Errors**:
- Invalid type operations throw errors
- Caught in statement execution
- Displayed to user

**Division by Zero**:
- Detected during evaluation
- Throws error
- Handled gracefully

**Downcasting Errors**:
- Complex → Real/Integer assignment throws error
- Suggests using `REALPART` or `IMAGPART`

**Domain Errors**:
- Mathematical functions automatically upcast to Complex when needed
- Operations that would produce NaN instead produce Complex results

## Expression Testing

Expressions are tested via:
- Unit tests in `specs/expressions/`
- Integration tests in statement tests
- Manual testing in console
