import { Statement } from './statements/statement';

/**
 * Number of spaces used per indent level in canonical line representation.
 */
export const INDENT_SPACES_PER_LEVEL = 4;

/**
 * Build the canonical representation of a program line including its indent.
 *
 * Used by the editor and console so that statement canonicalization (keyword casing,
 * spacing, etc.) and indent level live in one place. Applies to parsed statements,
 * empty lines (statement null), and unparsable lines (UnparsableStatement).
 *
 * @param indentLevel 0-based indent level (0 = no indent).
 * @param statement Parsed statement for the line, or null for empty/comment lines.
 * @returns Full line string: indent prefix + body (statement.toString() or "").
 */
export function getCanonicalLine(indentLevel: number, statement: Statement | null): string
{
    // Build indent prefix from level, body from statement toString or empty; concatenate.
    const spaces = Math.max(0, indentLevel) * INDENT_SPACES_PER_LEVEL;
    const prefix = ' '.repeat(spaces);
    const body = statement !== null ? statement.toString() : '';
    return prefix + body;
}
