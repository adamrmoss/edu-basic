## Unit-test mocks (`specs/units/mocks/`)

These mocks are used by **unit-style specs** under `specs/units/**`.

### Purpose

- Support isolated unit tests that build statements/programs in memory
- Capture side effects (console/graphics/audio) without relying on browser APIs
- Provide small, focused helpers for unit-level assertions

### Important boundary

- **Program specs** (`specs/programs/**`) should prefer **real `.bas` programs** executed through the real parser + `RuntimeExecution`, and use mocks from `specs/programs/mocks/`.
- Unit mocks here are **not** intended for program-spec execution harnesses.

