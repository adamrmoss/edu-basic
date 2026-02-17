/**
 * Build a `Set<string>` from one or more string arrays.
 *
 * @param arrays Arrays whose values will be added to the set.
 * @returns A set containing the union of all provided values.
 */
export function toSet(...arrays: readonly (readonly string[])[]): Set<string>
{
    // Union all array elements into a single set (duplicates removed).
    const set = new Set<string>();
    for (const arr of arrays)
    {
        for (const k of arr)
        {
            set.add(k);
        }
    }
    return set;
}
