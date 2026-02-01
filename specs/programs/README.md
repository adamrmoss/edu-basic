## Program specs (`specs/programs/`)

Program specs are integration-style tests that execute **real `.bas` programs** through the **real interpreter pipeline**:

- **Parse**: `ParserService.parseLine(...)` is used for each line of source
- **Program model**: statements are appended into a real `Program`
- **Execute**: a real `RuntimeExecution` is stepped until `END`

### Why program specs exist

- Program specs validate the end-to-end behavior that users experience in the IDE.
- They reduce the chance of “unit-test lies” where behavior is accidentally mocked/stubbed incorrectly.
- They are also useful as a curated library of example programs (`/programs/*.bas`) that can be opened and run in the IDE.

### Where the `.bas` files live

- Programs under test live in the repo root `programs/` directory (ordinary `.bas` files).

### How program specs run programs

The test harness is `specs/programs/program-test-runner.ts`:

- Loads a `.bas` file from `programs/`
- Parses it into a `Program`
- Executes it with a real `RuntimeExecution`
- Returns a `BasProgramRunResult` which includes captured console output and other state useful for assertions

### What is mocked vs real

Program specs are intended to use **real application code** for everything below the Angular UI layer, while providing deterministic fakes for the visible/audible surfaces:

- **Real**: parsing, execution, control-flow frame stack, language runtime semantics
- **Mocked**: console service, graphics, audio (see `specs/programs/mocks/`)

### Where output goes (important for assertions)

- **`CONSOLE expr`**: writes to `TestConsoleService.output` (this is the easiest surface to assert against).
- **`PRINT ...`**: writes to `Graphics.printText(...)` (capturable via `TestGraphics.printedText` / `getPrintedOutput()`), and may request an `output` tab switch (`tabSwitches`) for the UI.
- If you want program specs to assert numeric results, prefer `CONSOLE` so values are captured directly without dealing with graphical text buffering.

### Program-spec mocks

Program-spec mocks live under `specs/programs/mocks/` and are intentionally scoped to program specs:

- `TestConsoleService`: captures `CONSOLE` output for assertions
- `TestGraphics`: captures printed output-tab text (for `PRINT`) and other graphics state
- `TestAudio`: captures audio commands without relying on WebAudio

