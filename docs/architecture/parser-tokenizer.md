# Parser and Tokenizer

This document describes the parsing and tokenization system.

## Tokenizer

**Location**: `src/app/interpreter/tokenizer.service.ts`

Converts source code into tokens for parsing.

### Token Types

**TokenType Enum**:
- `EOF` - End of file
- `Integer`, `Real`, `Complex`, `String` - Literals
- `Identifier` - Variable/function names
- `Keyword` - Language keywords
- Operators: `Plus`, `Minus`, `Star`, `Slash`, `Caret`, `StarStar`
- Comparison: `Equal`, `NotEqual`, `Less`, `Greater`, `LessEqual`, `GreaterEqual`
- Punctuation: `LeftParen`, `RightParen`, `LeftBracket`, `RightBracket`, `Comma`, `Semicolon`, etc.

### Token Interface

```typescript
interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}
```

### Tokenization Process

**tokenize(source: string): Token[]**:
1. Initialize position tracking
2. Skip whitespace
3. Identify token type
4. Extract token value
5. Track line/column for errors
6. Return token array

**Token Recognition**:
- Strings: `"text"` with escape sequences
- Numbers: Integer, real, complex
- Identifiers: Alphanumeric with type suffixes
- Keywords: Reserved words
- Operators: Single and multi-character
- Punctuation: Parentheses, brackets, commas, etc.

## ParserService

**Location**: `src/app/interpreter/parser.service.ts`

Parses tokens into statement objects.

### Parsing Flow

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

### Parse Methods

**parseLine(lineNumber, sourceText): ParsedLine**:
- Entry point for parsing
- Handles empty lines and comments
- Tokenizes source
- Dispatches to statement parsers
- Returns `ParsedLine` with statement or error

**Statement Parsers**:
- `parsePrint()` - PRINT statement
- `parseIf()` - IF statement
- `parseFor()` - FOR statement
- `parseWhile()` - WHILE statement
- `parseLet()` - LET statement
- etc.

### ParsedLine Interface

```typescript
interface ParsedLine {
    lineNumber: number;
    sourceText: string;
    statement: Statement;
    hasError: boolean;
    errorMessage?: string;
}
```

## ExpressionParserService

**Location**: `src/app/interpreter/expression-parser.service.ts`

Parses expressions with operator precedence.

### Operator Precedence

From lowest to highest:
1. IMP (Implication)
2. XOR, XNOR
3. OR, NOR
4. AND, NAND
5. NOT (Unary)
6. Comparison (`==`, `!=`, `<`, `>`, `<=`, `>=`)
7. Arithmetic (`+`, `-`, `*`, `/`, `MOD`, `^`, `**`)
8. Unary (`+`, `-`, `NOT`)
9. Primary (literals, variables, function calls)

### Parsing Methods

Recursive descent parsing:
- `expression()` - Entry point
- `imp()` - IMP operator
- `xorXnor()` - XOR, XNOR
- `orNor()` - OR, NOR
- `andNand()` - AND, NAND
- `not()` - NOT operator
- `comparison()` - Comparison operators
- `term()` - Addition, subtraction
- `factor()` - Multiplication, division
- `unary()` - Unary operators
- `primary()` - Literals, variables, parentheses

### Expression Parsing

**parseExpression(source: string): Expression**:
1. Tokenize source
2. Parse with precedence
3. Return Expression object

## Error Handling

### Tokenization Errors

- Invalid characters
- Unterminated strings
- Malformed numbers

### Parsing Errors

- Unexpected tokens
- Missing tokens
- Syntax errors
- Type mismatches

### Error Reporting

- Line and column numbers
- Error messages
- Returned in `ParsedLine.hasError`

## Indentation Handling

**Indent Level Tracking**:
- Statements track `indentLevel`
- Used for block structure
- IF/WHILE/FOR blocks have higher indent

**Indent Adjustment**:
- `getIndentAdjustment()` returns indent change
- Used for parsing nested structures

## Statement Parsing

### Control Flow Parsing

**IF Statements**:
- Parse condition
- Parse THEN block (indented)
- Parse ELSE/ELSEIF if present
- Parse END IF

**Loops**:
- Parse loop header
- Parse loop body (indented)
- Parse loop terminator

**Subroutines**:
- Parse SUB declaration
- Parse parameters
- Parse body (indented)
- Parse END SUB

## Expression Parsing

### Literal Parsing

- Integer: `123`
- Real: `123.456`
- Complex: `(1+2i)`
- String: `"text"`
- Array: `[1, 2, 3]`
- Structure: `{key: value}`

### Variable Parsing

- Identifier with type suffix
- Array access: `arr[index]`
- Structure access: `struct.member`

### Operator Parsing

- Binary operators: Left-associative
- Unary operators: Right-associative
- Precedence handled by parse methods

## Future Enhancements

Potential additions:
- **Error recovery**: Continue parsing after errors
- **Syntax highlighting**: Token-based highlighting
- **Code completion**: Token-based suggestions
- **Linting**: Static analysis during parsing
