# Expressions System

This document describes the expression parsing and evaluation system.

## Expression Architecture

All expressions extend the abstract `Expression` class:

```typescript
abstract class Expression extends RuntimeNode {
    abstract evaluate(context: ExecutionContext): EduBasicValue;
}
```

## Expression Categories

### Literal Expressions

**Location**: `src/lang/expressions/literals/`

Represent constant values in source code.

**Types**:
- `LiteralExpression` - Base for all literals
- `ArrayLiteralExpression` - Array literals `[1, 2, 3]`
- `ComplexLiteralExpression` - Complex literals `(1+2i)`
- `StructureLiteralExpression` - Structure literals `{key: value}`

**Evaluation**: Returns the literal value directly.

### Variable Expressions

**Location**: `src/lang/expressions/special/variable-expression.ts`

Accesses variable values.

**Evaluation**:
1. Calls `context.getVariable(name)`
2. Returns variable value or default

### Arithmetic Expressions

**Location**: `src/lang/expressions/arithmetic/`

Binary arithmetic operations.

**Operators**:
- `+` (Add)
- `-` (Subtract)
- `*` (Multiply)
- `/` (Divide)
- `MOD` (Modulo)
- `^` or `**` (Power)

**Type Handling**:
- Integer + Integer → Integer
- Mixed numeric → Real
- Complex numbers → Complex operations
- String concatenation via `+` operator

**Unary Operators**:
- `UnaryOperatorExpression` - Unary `+` and `-`
- Location: `src/lang/expressions/arithmetic/unary-operator-expression.ts`

### Comparison Expressions

**Location**: `src/lang/expressions/comparison/`

Comparison operations returning boolean (as Integer 0/1).

**Operators**:
- `==` (Equal)
- `!=` (Not Equal)
- `<` (Less)
- `>` (Greater)
- `<=` (Less or Equal)
- `>=` (Greater or Equal)

**Type Coercion**:
- Numeric comparisons: Coerce to common numeric type
- String comparisons: Lexicographic
- Complex comparisons: Not supported (error)

### Logical Expressions

**Location**: `src/lang/expressions/logical/`

Boolean logic operations.

**Operators**:
- `AND` - Logical AND
- `OR` - Logical OR
- `NOT` - Logical NOT (unary)
- `NAND` - Logical NAND
- `NOR` - Logical NOR
- `XOR` - Exclusive OR
- `XNOR` - Exclusive NOR
- `IMP` - Implication

**Evaluation**:
- Operands coerced to boolean (0 = false, non-zero = true)
- Returns Integer (0 or 1)

### Mathematical Expressions

**Location**: `src/lang/expressions/mathematical/`

Mathematical functions.

**Operators**:
- `SIN`, `COS`, `TAN` - Trigonometry
- `ASIN`, `ACOS`, `ATAN` - Inverse trigonometry
- `SINH`, `COSH`, `TANH` - Hyperbolic
- `LOG`, `LOG10`, `EXP` - Logarithms and exponential
- `SQRT`, `CBRT` - Roots
- `ABS` - Absolute value
- `FLOOR`, `CEIL`, `ROUND` - Rounding
- `MIN`, `MAX` - Min/max
- `RAND` - Random number

**Type Handling**:
- Operands coerced to Real
- Results are Real
- Complex numbers supported where applicable

### String Expressions

**Location**: `src/lang/expressions/string/`

String operations.

**Operators**:
- `+` - String concatenation
- `&` - String concatenation (alternative)

**String Manipulation**:
- Location: `src/lang/expressions/string-manipulation/`
- `LEFT$`, `RIGHT$`, `MID$` - Substring extraction
- `LEN` - String length
- `UPPER$`, `LOWER$` - Case conversion
- `TRIM$`, `LTRIM$`, `RTRIM$` - Whitespace removal

### Array Expressions

**Location**: `src/lang/expressions/array/`

Array operations.

**Operators**:
- Array access: `arr[index]`
- Array literals: `[1, 2, 3]`
- Array operations: `SIZE`, `EMPTY`, etc.

**Array Access**:
- Location: `src/lang/expressions/special/array-access-expression.ts`
- Evaluates index expression
- Accesses array element
- Returns element value or default

### Complex Expressions

**Location**: `src/lang/expressions/complex/`

Complex number operations.

**Operators**:
- `+`, `-`, `*`, `/` - Arithmetic
- `REAL`, `IMAG` - Extract parts
- `CONJ` - Conjugate
- `ABS` - Magnitude
- `ARG` - Argument (phase)

### Type Conversion Expressions

**Location**: `src/lang/expressions/type-conversion/`

Type conversion operations.

**Operators**:
- `CINT`, `CLNG` - To integer
- `CSNG`, `CDBL` - To real
- `CSTR` - To string
- `CCOMPLEX` - To complex

### Special Expressions

**Location**: `src/lang/expressions/special/`

Special-purpose expressions.

**Types**:
- `ParenthesizedExpression` - `(expr)` - Groups expressions
- `AbsoluteValueExpression` - `ABS(expr)` - Absolute value
- `StructureMemberExpression` - `struct.member` - Structure access
- `ArrayAccessExpression` - `arr[index]` - Array indexing
- `VariableExpression` - Variable access

### Constant Expressions

**Location**: `src/lang/expressions/constants/`

Built-in constants.

**Constants**:
- `PI#` - Pi (3.14159...)
- `E#` - Euler's number
- `TRUE`, `FALSE` - Boolean constants

## Expression Parsing

### Operator Precedence

From lowest to highest:

1. **IMP** (Implication)
2. **XOR, XNOR**
3. **OR, NOR**
4. **AND, NAND**
5. **NOT** (Unary)
6. **Comparison** (`==`, `!=`, `<`, `>`, `<=`, `>=`)
7. **Arithmetic** (`+`, `-`, `*`, `/`, `MOD`, `^`, `**`)
8. **Unary** (`+`, `-`, `NOT`)
9. **Primary** (literals, variables, function calls)

### Parsing Methods

**ExpressionParserService** uses recursive descent parsing:

- `expression()` - Entry point
- `imp()` - IMP operator
- `xorXnor()` - XOR, XNOR operators
- `orNor()` - OR, NOR operators
- `andNand()` - AND, NAND operators
- `not()` - NOT operator
- `comparison()` - Comparison operators
- `term()` - Addition, subtraction
- `factor()` - Multiplication, division, modulo
- `unary()` - Unary operators
- `primary()` - Literals, variables, parentheses

### Parenthesized Expressions

Parentheses override operator precedence:

```typescript
class ParenthesizedExpression extends Expression {
    constructor(public readonly expression: Expression) {}
}
```

## Expression Evaluation

### Evaluation Flow

```
Expression.evaluate(context)
    ↓
Evaluate operands recursively
    ↓
Perform operation
    ↓
Return EduBasicValue
```

### Type Coercion

**Numeric Coercion**:
- Integer → Real: Automatic promotion
- Real → Integer: Truncation
- Numeric → Complex: Real part set, imaginary = 0

**String Coercion**:
- Any value → String: `toString()` conversion
- String → Numeric: Parse if possible

**Boolean Coercion**:
- 0 → false
- Non-zero → true
- Used in logical operations

### Error Handling

**Type Errors**:
- Invalid type operations throw errors
- Caught in statement execution
- Displayed to user

**Division by Zero**:
- Detected during evaluation
- Throws error
- Handled gracefully

## Expression Examples

### Arithmetic
```
10 + 20          → 30 (Integer)
10.5 + 20        → 30.5 (Real)
"Hello" + "World" → "HelloWorld" (String)
```

### Comparison
```
10 < 20          → 1 (true)
10 == 20         → 0 (false)
"abc" < "def"    → 1 (true)
```

### Logical
```
10 AND 20        → 1 (true)
NOT 0            → 1 (true)
10 OR 0          → 1 (true)
```

### Mathematical
```
SIN(PI# / 2)     → 1.0 (Real)
SQRT(16)         → 4.0 (Real)
ABS(-10)         → 10 (Integer)
```

### Array
```
arr%[0]          → First element
SIZE(arr%[])      → Array length
```

### Complex
```
(1+2i) + (3+4i)  → (4+6i)
REAL((1+2i))     → 1.0
ABS((3+4i))      → 5.0
```

## Expression Optimization

**Current Implementation**:
- No expression optimization
- All expressions evaluated at runtime
- No constant folding

**Future Enhancements**:
- Constant folding
- Expression simplification
- Dead code elimination

## Expression Testing

Expressions are tested via:
- Unit tests in `specs/expressions/`
- Integration tests in statement tests
- Manual testing in console
