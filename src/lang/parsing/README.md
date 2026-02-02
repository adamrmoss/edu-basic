# Parsing Engine (`src/lang/parsing/`)

This folder contains the **pure TypeScript** parsing engine for EduBASIC:

- **Tokenization** (source → `Token[]`)
- **Statement parsing** (a BASIC line → `Statement`)
- **Expression parsing** (an expression string → `Expression`)

It is intentionally **Angular-free**. The Angular-facing wrapper is `src/app/interpreter/parser.service.ts`.

## File map (what lives where)

- **`keywords.ts`**
  - `Keywords`: the central keyword taxonomy (statement starters, modifiers, expression terminators, operator keywords).
  - Used by tokenization and several parsing decisions.
- **`tokenizer.ts`**
  - `TokenType`, `Token`, `Tokenizer`
  - Turns source text into `ParseResult<Token[]>`, classifying keywords via `Keywords`.
- **`parse-result.ts`**
  - `ParseResult<T>`, `success(...)`, `failure(...)`
  - The common “recoverable parse failure” channel used across statement and expression parsing.
- **`statement-dispatch.ts`**
  - `statementDispatch`: `Map<string, StatementParser>`
  - `getStatementParser(keyword)`: statement keyword → parse method
- **`parsers/parser-context.ts`**
  - `ParserContext`: wraps a token stream (`Token[]`) plus a mutable cursor (`{ value: number }`) and exposes helpers like:
    - `consume(...)`, `consumeKeyword(...)`
    - `match(...)`, `matchKeyword(...)`
    - `parseExpression()` (parses an expression starting at the current token)
- **`parsers/*-parsers.ts`**
  - Per-domain statement parsers, grouped by language subsystem:
    - `control-flow-parsers.ts`, `io-parsers.ts`, `graphics-parsers.ts`, `file-io-parsers.ts`, `audio-parsers.ts`, `variable-parsers.ts`, `array-parsers.ts`, `misc-parsers.ts`
- **`expression-parser.ts`**
  - `ExpressionParser`: parses expression strings with a fixed precedence ladder and postfix/access phases.
- **`helpers/expression-helpers.ts`**
  - `ExpressionHelpers.parseExpression(tokens, current, expressionParser)`
  - The “expression inside statements” bridge (token-slice → source reconstruction → re-tokenize → expression parse).
- **`helpers/token-helpers.ts`**
  - `TokenHelpers`: low-level cursor operations (`peek`, `advance`, `match`, `matchKeyword`, `consume`).

## The statement parsing pipeline (end-to-end)

At runtime, statement parsing is driven by the Angular wrapper `ParserService` (`src/app/interpreter/parser.service.ts`), but the actual parsing logic is here in `src/lang/parsing/`.

High-level flow for a single line:

```
sourceText (one BASIC line)
  ↓ trim / comment check (app wrapper)
Tokenizer.tokenize(trimmedText)               // src/lang/parsing/tokenizer.ts
  ↓
ParseResult<Token[]> → Token[] + current cursor { value: 0 }
  ↓
ParserContext(tokens, current, ExpressionParser)  // src/lang/parsing/parsers/parser-context.ts
  ↓
getStatementParser(firstKeyword)              // src/lang/parsing/statement-dispatch.ts
  ↓
per-domain parse method                       // src/lang/parsing/parsers/*-parsers.ts
  ↓
ParseResult<Statement>
```

### The dispatch boundary

The **only** thing `statement-dispatch.ts` does is choose the parse method based on the line’s first keyword.
Everything after that is “owned” by the per-domain parser.

This is a useful seam:

- When you add a statement keyword, you usually touch **exactly one** per-domain parser file, plus the dispatch entry.
- When you change a statement’s grammar, you usually touch only its parser method and the statement class in `src/lang/statements/`.

## The expression parsing pipeline (and why it feels “indirect”)

### Direct expression parsing (console / expression-only)

`ExpressionParser.parseExpression(source: string)`:

1. Tokenizes the string using `Tokenizer`
2. Parses with a recursive-descent precedence ladder
3. Returns `ParseResult<Expression>`

### Expression parsing inside statements

Per-domain statement parsers typically don’t parse expressions “token-native”.
Instead they call `ParserContext.parseExpression()`, which delegates to `ExpressionHelpers.parseExpression(...)`.

Current behavior:

```
statement Token[] + cursor
  ↓
ExpressionHelpers.parseExpression(...)
  - slices tokens until a stop condition
  - reconstructs expression source text from tokens
  - calls ExpressionParser.parseExpression(exprSource)
  ↓
ParseResult<Expression>
```

This makes statement parsers very readable (they don’t have to know expression precedence), but it means:

- **Expression boundaries inside statements** depend heavily on the stop conditions (see next section).
- Expression parsing inside statements is a **two-phase** process (token-slice → string → re-tokenize).

## Expression stop conditions (inside statements)

`ExpressionHelpers.parseExpression(...)` stops collecting tokens when:

- It is not inside any `(...)`, `[...]`, or `{...}` nesting, and it sees:
  - punctuation: `,`, `;`, `)`, `]`, `}`
  - an **expression terminator keyword**: `Keywords.isExpressionTerminatorKeyword(token.value)`

This stop-set is one of the highest-leverage parts of the parsing engine:

- Adding new statement forms often means adjusting the terminator set, even if the statement parser itself looks “obviously correct”.
- Some keywords are multi-role (statement starter in one context, modifier/terminator in another), which can create subtle boundary bugs.

## Key classes and their responsibilities

### `Tokenizer`

- Converts raw source to `Token[]`, including:
  - numeric, string, identifier, keyword tokens
  - operator/punctuation tokens
- Tracks `line` and `column` on each `Token`.
- Returns `ParseResult<Token[]>` so tokenization failures are recoverable (e.g. unknown characters, malformed literals).

### Why the tokenizer’s “operator list” looks small

Not everything that “acts like an operator” is a `TokenType`:

- **Keyword operators** are tokenized as `TokenType.Keyword` and handled by `ExpressionParser` (e.g. `AND`, `OR`, `NOT`, `MOD`, `LEFT`, `RIGHT`, `MID`, `FIND`, `INDEXOF`, `INCLUDES`, `DEG`, `RAD`).
- **Type sigils** are part of identifiers, not separate tokens (e.g. `x%`, `name$`, `pi#`, `handle&`).
- The **not-equal operator** is `<>` (not `!=`).

### `ParserContext`

- A thin convenience wrapper for statement parsers.
- It **does not** own parsing policy; it just forwards to helpers:
  - `TokenHelpers` for stream operations
  - `ExpressionHelpers` for “parse an expression here”

### Per-domain `*Parsers`

- Each method:
  - consumes the specific statement keyword and grammar tokens
  - calls `context.parseExpression()` when it needs an expression
  - returns `ParseResult<Statement>`

### `ExpressionParser`

- Parses expressions using a precedence ladder roughly shaped like:
  - logical operators
  - comparisons
  - keyword operators (string operators, array-search operators)
  - arithmetic operators
  - postfix operators and accessors

## Error model

There are two “error channels” to be aware of:

- **Recoverable parse failures**: returned as `ParseResult<T>` with `success: false` (e.g., “Expected X, got Y”).
- **Exceptions**: should be reserved for truly exceptional failures (runtime evaluation errors, unexpected internal invariants, etc.).

The Angular wrapper `ParserService` treats statement parse failures as “successful parse with `UnparsableStatement` + `hasError: true`”.

## How to extend the parser engine

### Add a new statement

1. Add/confirm the keyword is in `Keywords` (`keywords.ts`) so tokenization classifies it as a keyword.
2. Add a `Statement` implementation in `src/lang/statements/`.
3. Implement parsing in the appropriate per-domain file in `src/lang/parsing/parsers/`.
4. Register the statement keyword in `src/lang/parsing/statement-dispatch.ts`.

### Add a new operator / expression form

1. Add the new `Expression` implementation in `src/lang/expressions/`.
2. Update `ExpressionParser` (`expression-parser.ts`) to recognize and construct it in the correct precedence phase.
3. If it’s a keyword operator, ensure `Keywords` classifies it appropriately.

## Known “edges” worth understanding

- **Token slicing + re-tokenizing**: parsing expressions inside statements currently reconstructs source text from tokens and re-tokenizes it. This is convenient, but it’s also one of the major complexity hotspots; see `docs/refactor-seams.md`.

