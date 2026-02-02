## TypeScript documentation comments (TSDoc-style JSDoc)

This repo standardizes on **TSDoc-style JSDoc** blocks (`/** ... */`) for TypeScript documentation comments.

Goals:
- Provide consistent hover/IntelliSense help in VSCode/TypeScript.
- Provide consistent, high-signal context for Cursor AI.
- Document the **public surface** of each module.

### What “public surface” means

For a given `.ts` file, its public surface is:
- All `export`ed declarations (classes, interfaces, types, enums, functions, constants).
- For exported classes, **every `public` member** (properties, getters/setters, and methods).

Internal helpers (non-exported symbols, private/protected members) do not require documentation.

### Comment syntax rules

- Use `/** ... */` blocks only (no `//` docs).
- Put the doc block on its own lines, immediately above the symbol it documents.
- Start with a single-sentence summary that ends with a period.
- Prefer “statement”, “operator”, “keyword”, or “command” for EduBASIC behavior (do not call these “functions”).
- Only use tags when they add real value.

### Recommended structure

Use this structure for most public exports:

```ts
/**
 * Summary sentence describing what this export is.
 *
 * @remarks
 * Additional details, constraints, invariants, or behavioral notes.
 *
 * @example
 * ```ts
 * // Example usage.
 * ```
 */
```

Use tags as applicable:
- `@param` for each parameter (functions/methods).
- `@returns` when the return value meaning is not obvious.
- `@throws` only for truly exceptional cases (avoid throwing for expected failure cases).
- `@deprecated` when applicable.
- `@see` to link to related types/modules.

### Placement with “imports first”

Keep imports at the top of the file.
- If a file needs module-level context, place a doc block after the imports and before the first export.
- For files without imports, a doc block may be placed at the top of the file.

### Examples

Document an exported enum:

```ts
/**
 * High-level interpreter lifecycle states exposed to the UI.
 */
export enum InterpreterState
{
    Idle = 'idle',
    Running = 'running'
}
```

Document an exported class:

```ts
/**
 * Implements the `IF` statement.
 */
export class IfStatement extends Statement
{
}
```

Document an exported function:

```ts
/**
 * Parse an EduBASIC expression from a token stream.
 *
 * @param tokens The tokens to parse.
 * @returns The parsed expression, or `null` if parsing fails.
 */
export function parseExpression(tokens: Token[]): Expression | null
{
}
```

Document a barrel file (`index.ts`):

```ts
/**
 * Re-exports control-flow statements.
 */
export * from './if-statement';
```
