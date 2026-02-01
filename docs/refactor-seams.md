# Refactor Seams

This document captures architectural “seams” and complexity hotspots discovered while working in the codebase, and is meant to guide refactoring toward more cohesive design.

## Refactoring Targets
If you are auditing or refactoring the interpreter, start with:

- `src/app/interpreter/keywords.ts` (keyword classification)
- `src/app/interpreter/tokenizer.service.ts` (tokenization)
- `src/app/interpreter/parser/statement-dispatch.ts` and `src/app/interpreter/parser/parser.service.ts` (statement parsing)
- `src/app/interpreter/expression-parser.service.ts` (expression precedence and operators)

## Parsing pipeline (mapped)

The parsing code is decomposed, but the boundaries are easier to see if you follow the flow end-to-end:

- **Keyword taxonomy**: `src/app/interpreter/keywords.ts`
  - The language vocabulary (statement starters, modifiers, expression terminators, operator keywords).
  - Drives token classification and several parsing decisions.
- **Tokenizer**: `src/app/interpreter/tokenizer.service.ts`
  - Converts source into `Token[]`.
  - Note: this is a plain class (`Tokenizer`), not an Angular service.
- **Statement parsing**: `src/app/interpreter/parser/parser.service.ts`
  - Owns the token stream for a single line and produces a `Statement`.
  - Delegates based on the first keyword via `src/app/interpreter/parser/statement-dispatch.ts`.
  - Uses `ParserContext` (`src/app/interpreter/parser/parsers/parser-context.ts`) for shared token helpers and expression parsing.
- **Per-domain statement parsers**: `src/app/interpreter/parser/parsers/*-parsers.ts`
  - Organized by domain (control-flow, io, file-io, graphics, audio, variables, arrays, misc).
  - These are natural refactor boundaries: each file corresponds to a language “subsystem”.
- **Expression parsing**: `src/app/interpreter/expression-parser.service.ts`
  - A separate precedence ladder used by statement parsers (via `ParserContext.parseExpression()`).

## Complexity hotspots (high-value refactor targets)

### Token slicing + re-tokenizing for expressions (hidden complexity)

Current behavior:

- Statement parsers call `ParserContext.parseExpression()`.
- That delegates to `ExpressionHelpers.parseExpression(...)`, which:
  - slices a subset of statement tokens until a stop condition (punctuation or `Keywords.expressionTerminator`)
  - converts those tokens back into source text
  - then calls `ExpressionParserService.parseExpression(...)`, which re-tokenizes the string and parses it

Why this matters:

- The expression boundaries inside statements are enforced mostly by `Keywords.expressionTerminator` plus a few punctuation tokens.
- Adding or changing a statement syntax often means touching the terminator set, which is not always obvious when reading a single statement parser.

Potential improvements:

- Replace “slice → string → re-tokenize” with a token-native expression parse entrypoint that can operate on the existing `Token[]` and cursor (no lossy reconstruction).
- Make stop-sets explicit and named per statement form (instead of a single global “expression terminator keyword” set doing most of the work).

### Keyword ambiguity / multi-role keywords

Some keywords are ambiguous and require context to interpret. Example class of problem:

- A keyword can be a statement starter in one context but part of a different statement in another (e.g., `LINE` can begin a graphics statement or `LINE INPUT`).

Refactor direction:
- Centralize “disambiguation rules” (or make disambiguation tables explicit) so this logic isn’t scattered across parsers.

### Expression stop-conditions inside statements

Many statement grammars depend on “parse expression until stop token/keyword” behavior. This is powerful, but can be opaque and brittle.

Refactor direction:
- Make stop-sets explicit and named (e.g., `StopAtCommaOrRightParen`, `StopAtThen`, etc.).
- Prefer small statement-specific expression parse helpers over ad-hoc stop keyword lists.

### Cursor-passing by `{ value: number }` (shared mutable state)

Current behavior:

- `ParserContext` shares a mutable cursor object (`current: { value: number }`) across helpers.

Potential improvements:

- Use an explicit `TokenStream` abstraction with methods like `peek()`, `consume()`, `expectKeyword()`, `mark()/rewind()` to reduce accidental cursor misuse and make backtracking possible where needed.

### Two operator namespaces (token vs keyword)

Operators live in two namespaces:

- **Token-level operators**: `+`, `*`, `<>`, `**`, `^`, etc.
- **Keyword operators**: `MOD`, logical operators, string operators, array-search operators, postfix `DEG`/`RAD`, etc.

Refactor direction:
- Document and enforce the split deliberately (in code and docs).
- Consider a cohesive representation for “operator kinds” so adding an operator isn’t spread across multiple places.

### Barrel/file-name collisions

Example discovered during `DEG`/`RAD` work:

- We previously had both `src/lang/expressions/operators.ts` and `src/lang/expressions/operators/`, which is a high-risk naming collision.

Refactor direction:
- Avoid ambiguous same-name file/dir pairs; prefer a single obvious barrel (`index.ts`) for a directory.

## “Cohesion boundaries” to preserve

If you refactor, these existing boundaries are already paying rent and should probably stay boundaries:

- Per-domain statement parser files under `src/app/interpreter/parser/parsers/`
- Expression evaluation classes under `src/lang/expressions/` (AST nodes) and `src/lang/expressions/helpers/` (evaluation helpers)
