export type ParseResult<T> =
    | { success: true; value: T }
    | { success: false; error: string };

export function success<T>(value: T): ParseResult<T>
{
    return { success: true, value };
}

export function failure<T>(error: string): ParseResult<T>
{
    return { success: false, error };
}
