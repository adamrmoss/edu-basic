# Testing Guide for EduBASIC

## Overview

This project uses **Jest** for TypeScript unit testing. Jest is a fast, modern test runner with excellent TypeScript support and clean console output.

## Running Tests

```bash
npm test
```

This will:
- Compile TypeScript files
- Run all tests
- Display results in the console with clean output
- Show pass/fail summary
- Exit automatically when done

### Watch Mode

To run tests in watch mode (auto-rerun on file changes):

```bash
npm run test:watch
```

## Test File Structure

Test files should:
- Be named `*.spec.ts`
- Be placed alongside the code they test
- Follow TypeScript conventions with full type safety

Example structure:
```
src/app/
  ├── lexer/
  │   ├── tokenizer.ts
  │   └── tokenizer.spec.ts
  ├── parser/
  │   ├── expression-parser.ts
  │   └── expression-parser.spec.ts
  └── runtime/
      ├── variable-store.ts
      └── variable-store.spec.ts
```

## Basic Test Patterns

### Simple Test Suite

```typescript
describe('MyClass', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Setup and Teardown

```typescript
describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  it('should add two numbers', () => {
    expect(calculator.add(2, 3)).toBe(5);
  });
});
```

### Testing Algorithms

```typescript
describe('ExpressionEvaluator', () => {
  it('should evaluate arithmetic expressions', () => {
    const evaluator = new ExpressionEvaluator();
    expect(evaluator.eval('2 + 3 * 4')).toBe(14);
  });

  it('should handle operator precedence', () => {
    const evaluator = new ExpressionEvaluator();
    expect(evaluator.eval('(2 + 3) * 4')).toBe(20);
  });
});
```

## Jest Matchers

Common assertions:
- `expect(x).toBe(y)` - Strict equality (===)
- `expect(x).toEqual(y)` - Deep equality (for objects/arrays)
- `expect(x).toBeTruthy()` / `expect(x).toBeFalsy()`
- `expect(x).toBeNull()` / `expect(x).toBeUndefined()`
- `expect(x).toContain(y)` - For arrays/strings
- `expect(x).toMatch(/regex/)` - Regex matching
- `expect(() => fn()).toThrow()` - Function throws error
- `expect(x).toHaveLength(n)` - Array/string length
- `expect(x).toBeCloseTo(y, digits)` - Floating point comparison

## EduBASIC Testing Focus Areas

### Lexer/Tokenizer
- Token recognition
- Type sigil handling (%, #, $, &)
- Keyword identification
- String literal parsing
- Number parsing (integers, reals, complex)

### Parser
- Expression parsing
- Statement parsing
- Control flow structures
- Operator precedence
- Error handling

### Type System
- Type coercion rules
- Sigil validation
- Type checking
- Structure definitions

### Runtime
- Variable storage and retrieval
- Array operations
- GOSUB/RETURN stack
- Label management

### Evaluator
- Arithmetic operations
- Boolean operations
- String operations
- Complex number operations
- Function calls

## Configuration Files

- **jest.config.js** - Jest test runner configuration
- **setup-jest.ts** - Jest environment setup
- **tsconfig.spec.json** - TypeScript config for tests

## Jest Advantages

Jest provides several advantages for algorithm testing:

- **Fast**: Runs tests in parallel for speed
- **Clean output**: No browser overhead, pure console output
- **Built-in coverage**: No additional configuration needed
- **Watch mode**: Intelligent test re-running based on changed files
- **Snapshot testing**: Useful for testing parser/AST output
- **Easy mocking**: Built-in mock functions and modules

## Console Output

Jest provides clean, readable output:

Example successful run:
```
PASS  src/app/lexer-example.spec.ts
PASS  src/app/expression-evaluator.spec.ts
PASS  src/app/variable-store.spec.ts

Test Suites: 3 passed, 3 total
Tests:       74 passed, 74 total
Time:        2.5s
```

Example with failures:
```
FAIL  src/app/lexer-example.spec.ts
  ● Lexer › should tokenize integer variable
  
    expect(received).toBe(expected)
    
    Expected: "INTEGER"
    Received: "UNKNOWN"
```

## Tips for Testing Algorithms

1. **Test edge cases**: Empty strings, zero, negative numbers, boundary values
2. **Test error conditions**: Invalid input, malformed syntax, type mismatches
3. **Test complex scenarios**: Nested expressions, multiple operations, long inputs
4. **Use descriptive test names**: `it('should handle nested parentheses in expressions', ...)`
5. **Keep tests focused**: One logical assertion per test
6. **Use setup/teardown**: Initialize common test data in `beforeEach()`

## Example: Testing the Lexer

```typescript
describe('EduBASIC Lexer', () => {
  let lexer: Lexer;

  beforeEach(() => {
    lexer = new Lexer();
  });

  describe('variable names with sigils', () => {
    it('should tokenize integer variable', () => {
      const tokens = lexer.tokenize('count%');
      expect(tokens[0].type).toBe('IDENTIFIER');
      expect(tokens[0].dataType).toBe('INTEGER');
    });

    it('should tokenize real variable', () => {
      const tokens = lexer.tokenize('temp#');
      expect(tokens[0].dataType).toBe('REAL');
    });

    it('should tokenize string variable', () => {
      const tokens = lexer.tokenize('name$');
      expect(tokens[0].dataType).toBe('STRING');
    });

    it('should tokenize complex variable', () => {
      const tokens = lexer.tokenize('impedance&');
      expect(tokens[0].dataType).toBe('COMPLEX');
    });
  });

  describe('literals', () => {
    it('should tokenize integer literal', () => {
      const tokens = lexer.tokenize('42');
      expect(tokens[0].type).toBe('NUMBER');
      expect(tokens[0].value).toBe(42);
    });

    it('should tokenize complex literal', () => {
      const tokens = lexer.tokenize('3+4i');
      expect(tokens[0].type).toBe('COMPLEX');
      expect(tokens[0].real).toBe(3);
      expect(tokens[0].imag).toBe(4);
    });
  });

  describe('statements', () => {
    it('should tokenize LET statement', () => {
      const tokens = lexer.tokenize('LET x% = 10');
      expect(tokens[0].type).toBe('KEYWORD');
      expect(tokens[0].value).toBe('LET');
      expect(tokens[1].type).toBe('IDENTIFIER');
      expect(tokens[2].type).toBe('OPERATOR');
      expect(tokens[2].value).toBe('=');
      expect(tokens[3].type).toBe('NUMBER');
    });
  });
});
```

## Coverage Reports

HTML coverage reports are generated in:
```
coverage/edu-basic/index.html
```

Open this file in a browser to see detailed line-by-line coverage.

## Continuous Integration

For CI environments, Jest works perfectly out of the box:

```bash
npm test -- --ci --coverage --maxWorkers=2
```

The `--ci` flag optimizes Jest for CI environments.

