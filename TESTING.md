# Testing Guide for EduBASIC

## Overview

This project uses **Jasmine** and **Karma** for TypeScript unit testing. Tests are configured to output results directly to the console in headless Chrome.

## Running Tests

```bash
npm test
```

This will:
- Compile TypeScript files
- Run tests in ChromeHeadless (no browser window)
- Display results in the console with progress indicators
- Show code coverage summary
- Exit automatically when done (single-run mode)

### Watch Mode (Optional)

If you prefer to keep tests running and auto-rerun on file changes, edit `karma.conf.js`:

```javascript
singleRun: false,  // Keep running
autoWatch: true,   // Watch for changes
```

Then tests will continuously watch for changes and re-run automatically.

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

## Jasmine Matchers

Common assertions:
- `expect(x).toBe(y)` - Strict equality (===)
- `expect(x).toEqual(y)` - Deep equality (for objects/arrays)
- `expect(x).toBeTruthy()` / `expect(x).toBeFalsy()`
- `expect(x).toBeNull()` / `expect(x).toBeUndefined()`
- `expect(x).toContain(y)` - For arrays/strings
- `expect(x).toMatch(/regex/)` - Regex matching
- `expect(() => fn()).toThrow()` - Function throws error

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

- **karma.conf.js** - Test runner configuration
- **src/test.ts** - Test environment bootstrap
- **tsconfig.spec.json** - TypeScript config for tests
- **angular.json** - Angular CLI test configuration

## Headless vs Regular Browser

The test runner is configured with **ChromeHeadless** by default. Here's when to use each:

### Use Headless (Current Setup)
- **Unit testing**: Testing algorithms, classes, functions, utilities
- **No visual inspection needed**: You're testing logic, not UI
- **Faster execution**: No GUI rendering overhead
- **CI/CD**: Automated testing in environments without displays
- **Console-focused workflow**: Results go straight to terminal

### Use Regular Browser
If you need to visually inspect component rendering or debug UI tests, edit `karma.conf.js`:
```javascript
browsers: ['Chrome'], // Opens visible browser window
```

For unit testing algorithms (lexer, parser, evaluator, runtime), **headless is perfect**. You only need a visible browser when testing visual components or debugging tricky test failures.

## Console Output

The test runner is configured with:
- `progress` reporter - Shows test progress with symbols
- `coverage` reporter - Shows code coverage summary
- ChromeHeadless - No browser window
- No styles loaded - Faster compilation for algorithm tests

Example output:
```
Chrome Headless 120.0.0.0 (Mac OS 10.15.7): Executed 15 of 15 SUCCESS (0.234 secs / 0.189 secs)

=============================== Coverage summary ===============================
Statements   : 85.5% ( 123/144 )
Branches     : 78.2% ( 43/55 )
Functions    : 90.0% ( 18/20 )
Lines        : 84.7% ( 122/144 )
================================================================================
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

## Test Runner Modes

### Single-Run Mode (Default)

The test runner is configured to run once and exit automatically:
- Tests execute completely
- Results are displayed
- Process exits cleanly (no need to press Ctrl+C)
- Perfect for quick test runs and CI/CD

### Watch Mode (Optional)

For active development where you want tests to re-run on file changes:

Edit `karma.conf.js`:
```javascript
singleRun: false,
autoWatch: true,
restartOnFileChange: true,
```

In watch mode:
- Tests re-run automatically when you save files
- Faster feedback during development
- Press Ctrl+C to exit when done

## Continuous Integration

For CI environments, the default single-run mode works perfectly. You can also specify the ChromeHeadlessCI launcher:

```bash
ng test --browsers=ChromeHeadlessCI --code-coverage
```

