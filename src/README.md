# Source Code Documentation

This directory contains the complete source code for the EduBASIC application. Documentation is organized by component and system area.

## Directory Structure

```
src/
├── app/              # Angular application components and services
├── lang/             # Language core (value system, execution, runtime)
├── index.html        # Application entry point
├── index.scss        # Global styles
└── main.ts           # Application bootstrap
```

## Documentation Index

### Application Layer (`app/`)

The application layer contains all Angular components, services, and UI-related code.

- **[Application Components](app/README.md)** - All Angular UI components (Console, Code Editor, Disk, Output) and their functionality
  - **[Console Service](app/console/README.md)** - Console command execution and history management
  - **[Disk Component](app/disk/README.md)** - Project and file management system
  - **[Interpreter Services](app/interpreter/README.md)** - Interpreter, parser, tokenizer, and expression parser services

### Language Core (`lang/`)

The language core implements the EduBASIC language runtime, including value types, execution model, and statement/expression systems.

- **[Language Core](lang/README.md)** - Core language types, execution model, runtime execution, graphics, and audio
  - **[Parsing Engine](lang/parsing/README.md)** - Tokenizer, keywords, statement parsing, expression parsing, and parser helpers
  - **[Expressions System](lang/expressions/README.md)** - Expression parsing, evaluation, and operator precedence
  - **[Statements System](lang/statements/README.md)** - All statement types and their execution

## Quick Navigation

**For UI/Component Development:**
- Start with [Application Components](app/README.md)
- See [Interpreter Services](app/interpreter/README.md) for parsing and execution
- Check [Console Service](app/console/README.md) for command handling
- Review [Disk Component](app/disk/README.md) for project management

**For Language Implementation:**
- Start with [Language Core](lang/README.md) for value types and execution model
- See [Expressions System](lang/expressions/README.md) for expression parsing and evaluation
- Review [Statements System](lang/statements/README.md) for statement execution

**For Audio Features:**
- See [Language Core](lang/README.md) (Audio class) for sound via webaudio-tinysynth (General MIDI)

## Architecture Overview

For a high-level view of the system architecture, see [Architecture Overview](../docs/architecture.md) in the main documentation.

## Related Documentation

**User Documentation:**
- [EduBASIC User Guide](../docs/user-guide.md) - Complete guide to using the EduBASIC software
- [EduBASIC Language Reference](../docs/edu-basic-language.md) - Complete language specification

**System Documentation:**
- [Architecture Overview](../docs/architecture.md) - High-level system architecture
