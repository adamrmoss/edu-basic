# Interpreter Services

This document covers the Angular services under `src/app/interpreter/`.

If you’re looking for the *language* parsing implementation (tokenizer, keyword tables, statement dispatch, expression precedence, etc.), see:

- `src/lang/parsing/README.md`
- `src/lang/expressions/README.md`
- `src/lang/statements/README.md`

## What “interpreter” means in the app

In this codebase, the interpreter layer is primarily responsible for wiring the UI to the language runtime:

- **Program building**: turning editor text into a `Program` (a sequence of `Statement`s).
- **Shared runtime objects**: providing an `ExecutionContext`, `Graphics`, `Audio`, and a `RuntimeExecution`.
- **Execution state**: tracking whether the UI considers the program idle/running/paused, and supporting keyboard input.

Actual “step execution” (\(RuntimeExecution.executeStep()\)) is driven by the UI (currently `CodeEditorComponent`), not by `InterpreterService`.

## Services

### InterpreterService

**Location**: `src/app/interpreter/interpreter.service.ts`

**Purpose**: Holds the shared runtime objects and interpreter state used by both the code editor “run loop” and console commands.

**Owns / provides**

- A long-lived `ExecutionContext` (`getExecutionContext()`).
- A shared `Program` instance (`getSharedProgram()`).
- A lazily-created, cached `RuntimeExecution` (`getRuntimeExecution()`), wired to:
  - `GraphicsService.getGraphics()`
  - `AudioService.getAudio()`
  - `FileSystemService`
  - `ConsoleService` (resolved lazily via `Injector`)
  - `TabSwitchService` (callback from `RuntimeExecution`)

**State (RxJS)**

- `program$`: current `Program | null` (set via the `program` setter).
- `state$`: `InterpreterState` (Idle/Parsing/Running/Paused/Error).
- `parseResult$`: lightweight parse status (`{ success, errors, warnings }`) for bulk parsing (note: this is currently not used by `CodeEditorComponent`).
- `isRunning$`: boolean mirror used by the UI.

**Execution control**

- `run()`, `pause()`, `resume()`, `stop()` update state only.
- Stepping is performed elsewhere (see `src/app/code-editor/code-editor.component.ts` which loops `runtime.executeStep()` while state is `Running`).

**Keyboard integration**

On construction it registers `window` `keydown`/`keyup` listeners (when running in a browser) and forwards normalized key names into the shared `ExecutionContext`. Key events originating from text inputs / contenteditable elements are ignored.

**Important nuance**

`reset()` clears the service’s observable state (`program`, `parseResult`, `state`, `isRunning`), but it does **not** create a new `ExecutionContext` or `RuntimeExecution`. Callers that need a “fresh” runtime should explicitly reset the underlying runtime objects (for example, `CodeEditorComponent` clears the shared `Program` before building a new one).

### ParserService

**Location**: `src/app/interpreter/parser.service.ts`

**Purpose**: Parses a single line of BASIC source into a `Statement`, and tracks per-line parse results (including indentation level).

**How it reports errors**

`parseLine(lineNumber, sourceText)` returns a `ParseResult<ParsedLine>`, but in practice it **always returns** `success(...)` and puts recoverable parse errors into:

- `ParsedLine.hasError: boolean`
- `ParsedLine.errorMessage?: string`

Invalid or non-executable lines are represented with `UnparsableStatement`:

- Empty/comment-only lines (\(starting with `'`\)) become an `UnparsableStatement` with `hasError: false`.
- Tokenization/statement parse failures become an `UnparsableStatement` with `hasError: true`.

This “always success + hasError” convention is used so the editor can keep a `Statement` placeholder for each line even when parsing fails.

**State (RxJS)**

- `parsedLines$`: a `Map<number, ParsedLine>` keyed by the caller-provided `lineNumber`.
- `currentIndentLevel$`: a numeric indent level that is applied to parsed statements and adjusted by `statement.getIndentAdjustment()`.

**Implementation note**

The heavy lifting is in `src/lang/parsing/` (tokenizer, statement dispatch, expression parsing). `ParserService` mainly adapts those building blocks to the UI and maintains UI-friendly state.

### GraphicsService

**Location**: `src/app/interpreter/graphics.service.ts`

**Purpose**: Owns a single `Graphics` instance and exposes buffer updates for the UI.

**API**

- `getGraphics()`: returns the shared `Graphics`.
- `setContext(context: CanvasRenderingContext2D)`: sets the canvas context and installs a flush callback that emits `ImageData` on `buffer$`.

**State (RxJS)**

- `buffer$`: emits the latest `ImageData` when `Graphics.flush()` produces a buffer.

### AudioService

**Location**: `src/app/interpreter/audio.service.ts`

**Purpose**: Owns a single `Audio` instance (language runtime audio facade) and exposes basic mute control.

**API**

- `getAudio()`: returns the shared `Audio`.
- `setMuted(muted: boolean)`
- `getMuted(): boolean`

## Related (call sites)

- **Program run loop**: `src/app/code-editor/code-editor.component.ts`
- **Console execution**: `src/app/console/console.service.ts` (parses an expression or statement and executes it against the shared runtime objects)
