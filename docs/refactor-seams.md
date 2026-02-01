# Refactor Seams

This document captures architectural “seams” and complexity hotspots discovered while working in the codebase, and is meant to guide refactoring toward more cohesive design.

## Refactoring Targets
If you are auditing or refactoring the interpreter, start with:

- `src/lang/parsing/keywords.ts` (keyword classification)
- `src/lang/parsing/tokenizer.ts` (tokenization)
- `src/lang/parsing/statement-dispatch.ts` (statement parsing dispatch)
- `src/app/interpreter/parser.service.ts` (Angular parsing wrapper)
- `src/lang/parsing/expression-parser.ts` (expression precedence and operators)

## Parsing pipeline (mapped)

The parsing code is decomposed, but the boundaries are easier to see if you follow the flow end-to-end:

- **Keyword taxonomy**: `src/lang/parsing/keywords.ts`
  - The language vocabulary (statement starters, modifiers, expression terminators, operator keywords).
  - Drives token classification and several parsing decisions.
- **Tokenizer**: `src/lang/parsing/tokenizer.ts`
  - Converts source into `Token[]`.
- **Statement parsing (core)**: `src/lang/parsing/statement-dispatch.ts`
  - Delegates based on the first keyword via `getStatementParser(keyword)`.
  - Uses `ParserContext` (`src/lang/parsing/parsers/parser-context.ts`) for shared token helpers and expression parsing.
- **Per-domain statement parsers**: `src/lang/parsing/parsers/*-parsers.ts`
  - Organized by domain (control-flow, io, file-io, graphics, audio, variables, arrays, misc).
  - These are natural refactor boundaries: each file corresponds to a language “subsystem”.
- **Expression parsing**: `src/lang/parsing/expression-parser.ts`
  - A separate precedence ladder used by statement parsers (via `ParserContext.parseExpression()`).

## Complexity hotspots (high-value refactor targets)

### Token slicing + re-tokenizing for expressions (hidden complexity)

Current behavior:

- Statement parsers call `ParserContext.parseExpression()`.
- That delegates to `ExpressionHelpers.parseExpression(...)`, which:
  - slices a subset of statement tokens until a stop condition (punctuation or `Keywords.expressionTerminator`)
  - converts those tokens back into source text
  - then calls `ExpressionParser.parseExpression(...)`, which re-tokenizes the string and parses it

Why this matters:

- The expression boundaries inside statements are enforced mostly by `Keywords.expressionTerminator` plus a few punctuation tokens.
- Adding or changing a statement syntax often means touching the terminator set, which is not always obvious when reading a single statement parser.

Potential improvements:

- Replace “slice → string → re-tokenize” with a token-native expression parse entrypoint that can operate on the existing `Token[]` and cursor (no lossy reconstruction).
- Make stop-sets explicit and named per statement form (instead of a single global “expression terminator keyword” set doing most of the work).

### Consider moving parser core out of Angular (`app/`) into `lang/`

Observation:

- Only `parser.service.ts` is “Angular-shaped” (it imports `@angular/core` and RxJS and maintains UI-friendly state like `parsedLines$` and `currentIndentLevel$`).
- Everything else under `src/lang/parsing/` is plain TypeScript and depends only on:
  - token types (`Tokenizer` / `TokenType`)
  - keyword sets (`Keywords`)
  - the expression parser
  - `src/lang/*` statements/expressions

Potential improvement:

- This has now been done: the pure parsing core lives under `src/lang/parsing/`, and a thin Angular wrapper remains in `src/app/interpreter/parser.service.ts`.

Potential future improvement:

- Keep a thin Angular wrapper service in `src/app/`:
  - **Keep in `app/`**: Angular/RxJS-facing “service wrapper(s)” only.
  - **Keep in `lang/`**: tokenizer, keywords, expression parser, statement-dispatch, parser context, per-domain statement parsers, parse-result helpers.

Practical criterion:

- A file is eligible to move into `lang/` if it does **not** import `@angular/*` and does not rely on DOM APIs.

Workflow note:

- If you do the file moves in the IDE, I can then update imports/barrels/tests by editing files (no CLI required).

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

- Per-domain statement parser files under `src/lang/parsing/parsers/`
- Expression evaluation classes under `src/lang/expressions/` (AST nodes) and `src/lang/expressions/helpers/` (evaluation helpers)
- Per-domain statement parser files under `src/lang/parsing/parsers/`
