# EduBASIC

Education-focused BASIC dialect that runs in web browser.

## Overview

EduBASIC is an Angular-based web application that provides a BASIC programming environment designed for educational purposes. The application runs entirely in the browser, making it accessible and easy to use for learning programming fundamentals.

**Documentation:**
- [EduBASIC Tutorial](docs/edu-basic-tutorial.md) - Introduction to language and development environment, with examples
- [EduBASIC Language Reference](docs/edu-basic-language.md) - Complete language specification and reference

## Tech Stack

- **Angular 19** - Modern Angular framework with standalone components
- **TypeScript** - Type-safe JavaScript
- **SCSS** - Enhanced CSS with variables and mixins
- **ng-luna** - Windows XP-styled Angular component library
- **Angular CDK** - Component Dev Kit for enhanced functionality
- **IBM Plex Fonts** - Typography system using IBM Plex Sans, Serif, and Mono

## Project Structure

```
edu-basic/
├── src/
│   ├── app/                    # Angular application
│   │   ├── app.component.*     # Root component
│   │   ├── app.config.ts       # Application configuration
│   │   └── app.routes.ts       # Routing configuration
│   ├── _breakpoints.scss       # Responsive breakpoint definitions
│   ├── _fonts.scss             # Font family definitions
│   ├── _palette.scss           # Color palette variables
│   ├── _reset.scss             # CSS reset styles
│   ├── _theme.scss             # Theme configuration (IBM Carbon Design colors)
│   ├── _z-layers.scss          # Z-index layer definitions
│   ├── index.html              # Main HTML entry point
│   ├── index.scss              # Global styles
│   └── main.ts                 # Application bootstrap
├── public/                     # Static assets
├── angular.json                # Angular CLI configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Dependencies

### Core Dependencies

- **@angular/core**: 19.x.x
- **@angular/common**: 19.x.x
- **@angular/forms**: 19.x.x
- **@angular/router**: 19.x.x
- **@angular/cdk**: 19.x.x - Required by ng-luna for enhanced component functionality

### UI Library

- **ng-luna**: 0.x.x - Windows XP-styled Angular component library providing:
  - Button, Checkbox, Input, Select, Textarea components
  - Progress, Slider, Radio components
  - Tabs, Window, Fieldset components
  - All components support reactive forms and are standalone

### Typography

- **@fontsource/ibm-plex-sans**: 5.x.x - Sans-serif font family
- **@fontsource/ibm-plex-serif**: 5.x.x - Serif font family
- **@fontsource/ibm-plex-mono**: 5.x.x - Monospace font family

### Version Management

All dependencies use the `x.x.x` version format instead of caret (`^`) or tilde (`~`) ranges. This provides more predictable dependency resolution while still allowing patch and minor updates.

## Development

### Prerequisites

- Node.js (version compatible with Angular 19)
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200/`

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Testing

```bash
npm test
```

## Component Architecture

- All Angular components are **standalone** (no NgModules)
- Components use separate template (`.html`) and stylesheet (`.scss`) files
- SCSS is used throughout for enhanced styling capabilities

## Using ng-luna Components

The project uses the `ng-luna` component library for Windows XP-styled UI components. All components are standalone and can be imported directly:

```typescript
import { ButtonComponent, InputComponent, WindowComponent } from 'ng-luna';

@Component({
  imports: [ButtonComponent, InputComponent, WindowComponent],
  // ...
})
```

### Example Usage

```html
<luna-window title="EduBASIC Editor">
  <luna-input 
    [(ngModel)]="code"
    placeholder="Enter BASIC code">
  </luna-input>
  
  <luna-button (click)="runCode()">
    Run
  </luna-button>
</luna-window>
```

All form components (input, checkbox, radio, select, textarea, slider) support Angular's reactive forms API and can be used with `FormControl`, `FormGroup`, and `ngModel`.

## License

[To be determined]
