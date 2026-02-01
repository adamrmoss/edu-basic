/**
 * Base type for runtime AST nodes (statements and expressions).
 *
 * The runtime uses `toString()` as a lightweight "source-ish" representation for:
 * - Debug output
 * - Some fallback matching logic in the executor
 * - Display in tooling/UI
 */
export abstract class RuntimeNode
{
    public abstract toString(): string;
}
