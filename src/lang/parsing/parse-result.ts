/**
 * Lightweight result type used by parsing/tokenization APIs.
 *
 * Parsing is expected to fail as part of normal operation (invalid input), so callers use
 * `ParseResult<T>` to handle errors without throwing.
 */
export type ParseResult<T> =
    | { success: true; value: T }
    | { success: false; error: string };

/**
 * Create a successful parse result.
 *
 * @param value Parsed value.
 */
export function success<T>(value: T): ParseResult<T>
{
    return { success: true, value };
}

/**
 * Create a failed parse result.
 *
 * @param error Human-readable error message.
 */
export function failure<T>(error: string): ParseResult<T>
{
    return { success: false, error };
}
