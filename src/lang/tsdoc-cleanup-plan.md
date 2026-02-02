## `src/lang` TSDoc cleanup plan

Style guide: `src/tsdoc-style.md`

### Current status (as of 2026-02-01)

Lightweight scan results:
- **143** total TypeScript files under `src/lang/`
- **15** files contain at least one `/** ... */` documentation block
- **13** barrel files (`index.ts`) under `src/lang/`
- **0** occurrences of `@remarks` under `src/lang/` (not required, but a signal)

Interpretation:
- A small set of core files already has documentation blocks, but at least one of them (`src/lang/statements/graphics/color-utils.ts`) still needs **style normalization** (summary formatting, tag formatting, avoid `@throws` for expected failures, etc.).
- The majority of `src/lang` still needs initial documentation blocks added for their **public surface** (exported declarations + public members on exported classes).

### What “done” means (for each chunk)

Follow `src/tsdoc-style.md`:
- Use `/** ... */` blocks only
- Doc block immediately above the symbol it documents
- Summary is a **single sentence ending with a period**
- Use `@param` for each parameter; use `@returns` only when non-obvious
- Avoid `@throws` unless truly exceptional (prefer returning `null` / no-op for expected failure cases)
- For barrel files (`index.ts`), add a short doc block describing what they re-export
- Keep imports at the top (“imports first”)

### Execution strategy

- Apply fixes in **small batches** to avoid context blow-ups.
- After each batch is fixed, report:
  - What changed
  - What’s next (the next chunk)
  - What remains (high-level counts and remaining chunk list)

### Chunk list (manageable batches)

#### Chunk 0 — Normalize existing docblocks (15 files)

These files already contain docblocks, but need a pass to ensure they match `src/tsdoc-style.md` (and that the “public surface” is actually documented).

- `src/lang/audio.ts`
- `src/lang/colors.ts`
- `src/lang/control-flow-frame-stack.ts`
- `src/lang/control-flow-frames.ts`
- `src/lang/edu-basic-value.ts`
- `src/lang/execution-context.ts`
- `src/lang/graphics.ts`
- `src/lang/program.ts`
- `src/lang/runtime-execution.ts`
- `src/lang/runtime-node.ts`
- `src/lang/parsing/expression-parser.ts`
- `src/lang/parsing/keywords.ts`
- `src/lang/parsing/parse-result.ts`
- `src/lang/parsing/tokenizer.ts`
- `src/lang/statements/graphics/color-utils.ts`

Notes:
- `src/lang/statements/graphics/color-utils.ts` currently contains docblocks that do **not** meet the style guide (summary punctuation/formatting, tag formatting, and `@throws` usage).

#### Chunk 1 — Barrel files (13 files)

Add one short “re-exports …” docblock to each barrel file.

- `src/lang/expressions/index.ts`
- `src/lang/expressions/helpers/index.ts`
- `src/lang/expressions/operators/index.ts`
- `src/lang/expressions/special/index.ts`
- `src/lang/statements/index.ts`
- `src/lang/statements/array/index.ts`
- `src/lang/statements/audio/index.ts`
- `src/lang/statements/control-flow/index.ts`
- `src/lang/statements/file-io/index.ts`
- `src/lang/statements/graphics/index.ts`
- `src/lang/statements/io/index.ts`
- `src/lang/statements/misc/index.ts`
- `src/lang/statements/variables/index.ts`

#### Chunk 2 — Expressions core (7 files)

- `src/lang/expressions/expression.ts`
- `src/lang/expressions/constant-expression.ts`
- `src/lang/expressions/literal-expression.ts`
- `src/lang/expressions/nullary-expression.ts`
- `src/lang/expressions/unary-expression.ts`
- `src/lang/expressions/binary-expression.ts`
- `src/lang/expressions/operators/bars-expression.ts`

#### Chunk 3 — Expressions special (8 files)

- `src/lang/expressions/special/array-access-expression.ts`
- `src/lang/expressions/special/array-literal-expression.ts`
- `src/lang/expressions/special/array-slice-expression.ts`
- `src/lang/expressions/special/bracket-access-expression.ts`
- `src/lang/expressions/special/factorial-expression.ts`
- `src/lang/expressions/special/multi-index-bracket-access-expression.ts`
- `src/lang/expressions/special/parenthesized-expression.ts`
- `src/lang/expressions/special/variable-expression.ts`

#### Chunk 4 — Expressions structure + operators + helpers (7 files)

- `src/lang/expressions/special/structure-literal-expression.ts`
- `src/lang/expressions/special/structure-member-expression.ts`
- `src/lang/expressions/operators/angle-conversion-expression.ts`
- `src/lang/expressions/operators/array-search-expression.ts`
- `src/lang/expressions/operators/string-operator-expressions.ts`
- `src/lang/expressions/helpers/constant-evaluator.ts`
- `src/lang/expressions/helpers/mathematical-function-evaluator.ts`

#### Chunk 5 — Expressions helpers (the rest) (3 files)

- `src/lang/expressions/helpers/complex-function-evaluator.ts`
- `src/lang/expressions/helpers/string-function-evaluator.ts`
- `src/lang/expressions/helpers/type-conversion-evaluator.ts`

#### Chunk 6 — Parsing helpers + dispatch + parser context (3 files)

- `src/lang/parsing/helpers/expression-helpers.ts`
- `src/lang/parsing/helpers/token-helpers.ts`
- `src/lang/parsing/statement-dispatch.ts`

#### Chunk 7 — Parsing per-domain statement parsers (9 files)

- `src/lang/parsing/parsers/array-parsers.ts`
- `src/lang/parsing/parsers/audio-parsers.ts`
- `src/lang/parsing/parsers/control-flow-parsers.ts`
- `src/lang/parsing/parsers/file-io-parsers.ts`
- `src/lang/parsing/parsers/graphics-parsers.ts`
- `src/lang/parsing/parsers/io-parsers.ts`
- `src/lang/parsing/parsers/misc-parsers.ts`
- `src/lang/parsing/parsers/parser-context.ts`
- `src/lang/parsing/parsers/variable-parsers.ts`

#### Chunk 8 — Statements top-level (3 files)

- `src/lang/statements/statement.ts`
- `src/lang/statements/unparsable-statement.ts`
- `src/lang/statements/index.ts`

#### Chunk 9 — Statements: array (4 files)

- `src/lang/statements/array/pop-statement.ts`
- `src/lang/statements/array/push-statement.ts`
- `src/lang/statements/array/shift-statement.ts`
- `src/lang/statements/array/unshift-statement.ts`

#### Chunk 10 — Statements: variables (4 files)

- `src/lang/statements/variables/dim-statement.ts`
- `src/lang/statements/variables/let-bracket-statement.ts`
- `src/lang/statements/variables/let-statement.ts`
- `src/lang/statements/variables/local-statement.ts`

#### Chunk 11 — Statements: IO (5 files)

- `src/lang/statements/io/cls-statement.ts`
- `src/lang/statements/io/color-statement.ts`
- `src/lang/statements/io/input-statement.ts`
- `src/lang/statements/io/locate-statement.ts`
- `src/lang/statements/io/print-statement.ts`

#### Chunk 12 — Statements: audio (4 files)

- `src/lang/statements/audio/play-statement.ts`
- `src/lang/statements/audio/tempo-statement.ts`
- `src/lang/statements/audio/voice-statement.ts`
- `src/lang/statements/audio/volume-statement.ts`

#### Chunk 13 — Statements: misc (4 files)

- `src/lang/statements/misc/console-statement.ts`
- `src/lang/statements/misc/help-statement.ts`
- `src/lang/statements/misc/randomize-statement.ts`
- `src/lang/statements/misc/set-statement.ts`

#### Chunk 14 — Statements: misc registries + sleep (3 files)

- `src/lang/statements/misc/command-help-registry.ts`
- `src/lang/statements/misc/statement-help-registry.ts`
- `src/lang/statements/misc/sleep-statement.ts`

#### Chunk 15 — Statements: graphics (part 1) (6 files)

- `src/lang/statements/graphics/arc-statement.ts`
- `src/lang/statements/graphics/circle-statement.ts`
- `src/lang/statements/graphics/get-statement.ts`
- `src/lang/statements/graphics/line-statement.ts`
- `src/lang/statements/graphics/oval-statement.ts`
- `src/lang/statements/graphics/paint-statement.ts`

#### Chunk 16 — Statements: graphics (part 2) (6 files)

- `src/lang/statements/graphics/pset-statement.ts`
- `src/lang/statements/graphics/put-statement.ts`
- `src/lang/statements/graphics/rectangle-statement.ts`
- `src/lang/statements/graphics/triangle-statement.ts`
- `src/lang/statements/graphics/turtle-statement.ts`
- `src/lang/statements/graphics/color-utils.ts`

#### Chunk 17 — Statements: file I/O (part 1) (5 files)

- `src/lang/statements/file-io/close-statement.ts`
- `src/lang/statements/file-io/copy-statement.ts`
- `src/lang/statements/file-io/delete-statement.ts`
- `src/lang/statements/file-io/line-input-statement.ts`
- `src/lang/statements/file-io/listdir-statement.ts`

#### Chunk 18 — Statements: file I/O (part 2) (5 files)

- `src/lang/statements/file-io/mkdir-statement.ts`
- `src/lang/statements/file-io/move-statement.ts`
- `src/lang/statements/file-io/open-statement.ts`
- `src/lang/statements/file-io/read-file-statement.ts`
- `src/lang/statements/file-io/readfile-statement.ts`

#### Chunk 19 — Statements: file I/O (part 3) (4 files)

- `src/lang/statements/file-io/rmdir-statement.ts`
- `src/lang/statements/file-io/seek-statement.ts`
- `src/lang/statements/file-io/write-file-statement.ts`
- `src/lang/statements/file-io/writefile-statement.ts`

#### Chunk 20 — Statements: control flow (part 1) (9 files)

- `src/lang/statements/control-flow/call-statement.ts`
- `src/lang/statements/control-flow/case-statement.ts`
- `src/lang/statements/control-flow/do-loop-statement.ts`
- `src/lang/statements/control-flow/elseif-statement.ts`
- `src/lang/statements/control-flow/else-statement.ts`
- `src/lang/statements/control-flow/end-statement.ts`
- `src/lang/statements/control-flow/exit-statement.ts`
- `src/lang/statements/control-flow/for-statement.ts`
- `src/lang/statements/control-flow/if-statement.ts`

#### Chunk 21 — Statements: control flow (part 2) (10 files)

- `src/lang/statements/control-flow/label-statement.ts`
- `src/lang/statements/control-flow/loop-statement.ts`
- `src/lang/statements/control-flow/next-statement.ts`
- `src/lang/statements/control-flow/return-statement.ts`
- `src/lang/statements/control-flow/select-case-statement.ts`
- `src/lang/statements/control-flow/sub-statement.ts`
- `src/lang/statements/control-flow/throw-statement.ts`
- `src/lang/statements/control-flow/try-statement.ts`
- `src/lang/statements/control-flow/uend-statement.ts`
- `src/lang/statements/control-flow/unless-statement.ts`

#### Chunk 22 — Statements: control flow (part 3) (9 files)

- `src/lang/statements/control-flow/until-statement.ts`
- `src/lang/statements/control-flow/wend-statement.ts`
- `src/lang/statements/control-flow/while-statement.ts`
- `src/lang/statements/control-flow/continue-statement.ts`
- `src/lang/statements/control-flow/catch-statement.ts`
- `src/lang/statements/control-flow/finally-statement.ts`
- `src/lang/statements/control-flow/goto-statement.ts`
- `src/lang/statements/control-flow/gosub-statement.ts`
- `src/lang/statements/control-flow/throw-statement.ts`

### Known plan caveat

This plan is based on:
- A full file inventory under `src/lang/`
- Export-pattern scans
- Presence/absence of doc blocks

During execution, if a file turns out to have additional exports (or unusually large public surfaces), it may be split into a smaller chunk.

