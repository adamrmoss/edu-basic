# EduBASIC

Education-focused BASIC dialect that runs in the web browser.

## Overview

EduBASIC is a web-based programming environment and an education-focused BASIC dialect. It runs entirely in the browser (no install), and includes an editor, interactive console, graphics/audio output, and a project “disk” system for saving and sharing work.

### Philosophy

EduBASIC intentionally favors **explicit, keyword-driven syntax** over terse punctuation-heavy forms. The goal is to make programs:

- **Readable aloud** (good for teaching and pair programming)
- **Easy to scan** (keywords carry meaning, not symbol soup)
- **Consistent to parse** (predictable grammar and error messages)
- **Batteries included** for teaching: text I/O, graphics, audio, arrays, and file I/O are first-class parts of the language

### Intended Audience

- **Learners**: first programming language, or a friendly on-ramp to core programming ideas (data, control flow, state, I/O).
- **Teachers**: classroom demos where installation and environment setup are friction.
- **Explorers**: quick experiments in the console, then grow into full programs in the editor.

### Language at a glance (capabilities)

The authoritative reference is [EduBASIC Language Reference](docs/edu-basic-language.md). High level:

- **Core data model**
  - Scalar types: **Integer** (`%`), **Real** (`#`), **Complex** (`&`), **String** (`$`)
  - **Structures**: untyped key/value dictionaries (no sigil)
  - **Arrays**: typed element arrays (`varType[]`, e.g. `scores%[]`)
  - Variables are **case-insensitive** and are generally **implicitly created** when assigned (`LET` / `LOCAL`).
- **Control flow**
  - Structured blocks (`IF`, loops, `SELECT CASE`, `SUB` procedures) plus labels for jump-style control flow.
  - Step-by-step execution model via a program counter under the hood (see `src/lang/runtime-execution.ts`).
- **Text I/O**
  - `PRINT`, `INPUT`, and cursor/color control for the output surface.
  - Interactive console supports expression auto-evaluation and `HELP <keyword>` for syntax lookup.
- **Graphics**
  - A built-in graphics surface designed for teaching visual programs (canvas is **640×480**, with an **80×30** text grid).
  - Pixel drawing primitives and higher-level shapes (see the language reference for statement forms).
- **Audio**
  - General MIDI-style synthesis via `webaudio-tinysynth` through the language `Audio` runtime.
  - Tempo/voice/volume control and `PLAY` using an MML-style sequence syntax.
- **File I/O**
  - A virtual file system inside the app (not your OS filesystem), with handle-based file operations plus convenience statements.
  - Projects can be saved/loaded as a single `.disk` file (a zip archive containing the program and any data files).
- **Errors**
  - Parse errors are designed to be recoverable and UI-friendly (the editor can keep running while highlighting invalid lines).
  - The language includes structured error handling forms (`TRY` / `CATCH` / `FINALLY`, `THROW`).

## Documentation

- **User docs**
  - [EduBASIC User Guide](docs/user-guide.md)
  - [EduBASIC Language Reference](docs/edu-basic-language.md)
- **Architecture**
  - [Architecture Overview](docs/architecture.md)
  - [Refactor Seams](docs/refactor-seams.md)
- **In-source docs (start here for code)**
  - [Source Code Documentation](src/README.md)
    - [Application Components](src/app/README.md)
    - [Interpreter Services](src/app/interpreter/README.md)
    - [Console Service](src/app/console/README.md)
    - [Language Core](src/lang/README.md)
    - [Parsing Engine](src/lang/parsing/README.md)
    - [Expressions System](src/lang/expressions/README.md)
    - [Statements System](src/lang/statements/README.md)

## Development

**Prerequisites**

- Node.js (compatible with Angular 19)
- npm

**Install**

```bash
npm install
```

**Run**

```bash
npm start
```

The app will be available at `http://localhost:4200/`.

**Build**

```bash
npm run build
```

Production build:

```bash
npm run build:prod
```

**Watch build**

```bash
npm run watch
```

**Tests**

```bash
npm test
```

Other useful scripts:

- `npm run typecheck`
- `npm run test:coverage`
- `npm run test:watch`

## Repository Map

```
edu-basic/
├── docs/         # User + architecture documentation
├── programs/     # Sample .bas programs
├── public/       # Static assets
├── specs/        # Jest specs
└── src/
    ├── app/      # Angular UI components + application services
    └── lang/     # EduBASIC language runtime (values, parsing, statements, execution)
```

## Tech Notes

- **UI**: built with Angular 19 + standalone components, SCSS, and `ng-luna`.
- **Language runtime**: lives under `src/lang/` and runs entirely in-browser.
- **Version ranges**: package versions are generally expressed as `major.x.x` placeholders (for example `19.x.x`), but not all dependencies follow that strictly (see `package.json`).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
