export function toSet(...arrays: readonly (readonly string[])[]): Set<string>
{
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
