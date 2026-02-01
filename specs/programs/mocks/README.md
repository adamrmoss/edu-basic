## Program-spec mocks (`specs/programs/mocks/`)

These mocks exist to support **program specs** (`specs/programs/**`) which run the **real parser** and **real `RuntimeExecution`**, but need deterministic and inspectable substitutes for UI-facing I/O.

### Goals

- Deterministic behavior in Jest (no real canvas, no real WebAudio)
- Easy assertions on “what would the user see/hear”
- Keep the interpreter/runtime real (no fake control-flow semantics)

### Contents

- **`TestConsoleService`** (`test-console.service.ts`)
  - Captures `CONSOLE` output in `output: string[]`
  - Captures error output in `errors: string[]`
- **`TestGraphics`** (`test-graphics.ts`)
  - Captures printed output text (what `PRINT` would show)
  - Captures basic cursor/color state useful for program assertions
- **`TestAudio`** (`test-audio.ts`)
  - Captures audio commands (tempo/volume/voice/sequence/note/frequency)
  - Intentionally avoids WebAudio usage

### Not for unit tests

Unit tests should use `specs/units/mocks/` instead.

