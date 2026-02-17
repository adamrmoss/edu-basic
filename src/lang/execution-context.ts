import { EduBasicValue, EduBasicType, tryGetArrayRankSuffixFromName } from './edu-basic-value';
import type { Audio } from './audio';

/**
 * Per-session runtime state for executing EduBASIC statements and operators.
 *
 * Responsibilities:
 * - Variable storage (global + local) with case-insensitive lookup.
 * - Call stack management for `SUB` / `CALL`.
 * - Program counter storage (the "current line index" during execution).
 * - Keyboard state for `INKEY$` and related statements.
 * - A reference to the `Audio` runtime (set by `RuntimeExecution`).
 *
 * Design notes:
 * - Variable names are stored using an uppercase lookup key, while a canonical map
 *   remembers the original casing for display purposes.
 * - The context intentionally does not throw for missing variables; it returns
 *   default values based on the name suffix (%/#/$/& and array ranks).
 */
interface StackFrame
{
    /**
     * Local variables for this call frame.
     *
     * Keys are stored uppercase for case-insensitive lookup.
     */
    localVariables: Map<string, EduBasicValue>;

    /**
     * Canonical display names for locals in this frame.
     *
     * Keys are stored uppercase; values preserve the original casing as last used.
     */
    canonicalLocalNames: Map<string, string>;

    /**
     * Alias map used for by-reference parameters.
     *
     * Key: local parameter name (uppercase).
     * Value: target variable name to resolve in an outer scope.
     */
    byRefBindings: Map<string, string>;

    /**
     * The program counter to resume at when returning from the frame.
     */
    returnAddress: number;
}

/**
 * Execution state shared across the interpreter runtime.
 */
export class ExecutionContext
{
    private globalVariables: Map<string, EduBasicValue>;
    private canonicalGlobalNames: Map<string, string>;
    private stackFrames: StackFrame[];
    private programCounter: number;
    private pressedKeys: Set<string>;
    private lastPressedKey: string | null;
    private audio: Audio | null;

    /**
     * Create a new execution context with empty global/local state.
     */
    public constructor()
    {
        this.globalVariables = new Map<string, EduBasicValue>();
        this.canonicalGlobalNames = new Map<string, string>();
        this.stackFrames = [];
        this.programCounter = 0;
        this.pressedKeys = new Set<string>();
        this.lastPressedKey = null;
        this.audio = null;
    }

    /**
     * Get the currently attached audio runtime (if any).
     *
     * This is set by `RuntimeExecution` so statements can use it indirectly via the context.
     */
    public getAudio(): Audio | null
    {
        return this.audio;
    }

    /**
     * Attach/detach the audio runtime for this context.
     */
    public setAudio(audio: Audio | null): void
    {
        this.audio = audio;
    }

    /**
     * Get the current program counter (0-based statement index).
     */
    public getProgramCounter(): number
    {
        return this.programCounter;
    }

    /**
     * Set the program counter (0-based statement index).
     */
    public setProgramCounter(value: number): void
    {
        this.programCounter = value;
    }

    /**
     * Advance the program counter by one statement.
     */
    public incrementProgramCounter(): void
    {
        this.programCounter++;
    }

    /**
     * Lookup a variable by name.
     *
     * Lookup order:
     * - Current frame locals (unless a by-ref binding redirects the name).
     * - Outer locals (only when resolving a by-ref binding).
     * - Globals.
     * - Default value based on the variable suffix if not found.
     */
    public getVariable(name: string): EduBasicValue
    {
        // Lookup: locals (with by-ref redirect) then globals; missing => default by suffix.
        const lookupKey = name.toUpperCase();

        // Prefer local scope if a call frame is active (respect by-ref aliasing).
        if (this.stackFrames.length > 0)
        {
            const currentFrame = this.stackFrames[this.stackFrames.length - 1];

            if (currentFrame.byRefBindings.has(lookupKey))
            {
                // By-ref parameters alias a variable in an outer scope.
                const targetName = currentFrame.byRefBindings.get(lookupKey)!;
                return this.getVariableFromOuterScopes(targetName);
            }

            if (currentFrame.localVariables.has(lookupKey))
            {
                // Remember the last-used casing for display, then return the stored value.
                currentFrame.canonicalLocalNames.set(lookupKey, name);
                return currentFrame.localVariables.get(lookupKey)!;
            }
        }

        // Fall back to global storage (also tracking canonical casing).
        this.canonicalGlobalNames.set(lookupKey, name);

        if (this.globalVariables.has(lookupKey))
        {
            return this.globalVariables.get(lookupKey)!;
        }

        // Missing variables produce a type-appropriate default value.
        return this.getDefaultValue(name);
    }

    /**
     * Assign a variable by name.
     *
     * - If the name is a by-ref binding in the current frame, assignment is redirected
     *   to the bound target in an outer scope.
     * - Otherwise, `isLocal` determines whether the value is stored in the current frame
     *   (when present) or in globals.
     */
    public setVariable(name: string, value: EduBasicValue, isLocal: boolean = false): void
    {
        // By-ref alias => assign in outer scope; else assign to current frame (if local) or globals.
        const lookupKey = name.toUpperCase();

        // If this name is a by-ref alias in the current frame, redirect the assignment outward.
        if (this.stackFrames.length > 0)
        {
            const currentFrame = this.stackFrames[this.stackFrames.length - 1];

            if (currentFrame.byRefBindings.has(lookupKey))
            {
                const targetName = currentFrame.byRefBindings.get(lookupKey)!;
                this.setVariableInOuterScopes(targetName, value);
                return;
            }
        }

        // Otherwise, assign into the requested scope (local when possible, else global).
        if (isLocal && this.stackFrames.length > 0)
        {
            const currentFrame = this.stackFrames[this.stackFrames.length - 1];
            currentFrame.canonicalLocalNames.set(lookupKey, name);
            currentFrame.localVariables.set(lookupKey, value);
        }
        else
        {
            this.canonicalGlobalNames.set(lookupKey, name);
            this.globalVariables.set(lookupKey, value);
        }
    }

    /**
     * Check whether a variable exists in the visible scope.
     *
     * This differs from `getVariable()` which will produce a default value for missing names.
     */
    public hasVariable(name: string): boolean
    {
        // Normalize the name for case-insensitive lookup.
        const lookupKey = name.toUpperCase();

        // Prefer checking current frame (respecting by-ref aliasing).
        if (this.stackFrames.length > 0)
        {
            const currentFrame = this.stackFrames[this.stackFrames.length - 1];

            if (currentFrame.byRefBindings.has(lookupKey))
            {
                // By-ref aliases must check outer scopes, excluding the current frame.
                const targetName = currentFrame.byRefBindings.get(lookupKey)!;
                return this.hasVariableInOuterScopes(targetName);
            }

            if (currentFrame.localVariables.has(lookupKey))
            {
                return true;
            }
        }

        // Fall back to global storage.
        return this.globalVariables.has(lookupKey);
    }

    /**
     * Get the runtime type of an existing variable, or null if it does not exist.
     */
    public getVariableType(name: string): EduBasicType | null
    {
        if (!this.hasVariable(name))
        {
            return null;
        }

        const value = this.getVariable(name);
        return value.type;
    }

    /**
     * Get the canonical "display name" for a variable.
     *
     * This preserves the original casing as last used (helpful for listing/printing names),
     * while still treating variables case-insensitively for lookup.
     */
    public getCanonicalName(name: string): string
    {
        // Normalize the name for case-insensitive lookup.
        const lookupKey = name.toUpperCase();

        // Prefer the most local visible canonical name (respecting by-ref aliasing).
        if (this.stackFrames.length > 0)
        {
            const currentFrame = this.stackFrames[this.stackFrames.length - 1];

            if (currentFrame.byRefBindings.has(lookupKey))
            {
                // By-ref aliases use the canonical name of the outer target if known.
                const targetName = currentFrame.byRefBindings.get(lookupKey)!;
                return this.getCanonicalNameFromOuterScopes(targetName) ?? targetName;
            }
            const localName = currentFrame.canonicalLocalNames.get(lookupKey);

            if (localName)
            {
                return localName;
            }
        }

        // Fall back to global canonical name if known.
        return this.canonicalGlobalNames.get(lookupKey) ?? name;
    }

    /**
     * Clear globals and call stack frames.
     */
    public clearVariables(): void
    {
        // Clear globals and reset the call stack.
        this.globalVariables.clear();
        this.canonicalGlobalNames.clear();
        this.stackFrames = [];
    }

    /**
     * Push a new call frame.
     *
     * `byRefBindings` is used when the caller passes arguments by reference, allowing
     * the callee's local parameter names to alias variables in an outer scope.
     */
    public pushStackFrame(returnAddress: number, byRefBindings?: Map<string, string>): void
    {
        // Create a fresh local scope with optional by-ref aliases back to outer scopes.
        this.stackFrames.push({
            localVariables: new Map<string, EduBasicValue>(),
            canonicalLocalNames: new Map<string, string>(),
            byRefBindings: byRefBindings ?? new Map<string, string>(),
            returnAddress: returnAddress
        });
    }

    /**
     * Pop the current call frame and return its return address (if any).
     */
    public popCallStackFrame(): number | undefined
    {
        // Pop the call frame and return its return address (if any).
        const frame = this.stackFrames.pop();
        return frame?.returnAddress;
    }

    /**
     * Peek the current return address without mutating the call stack.
     */
    public getCurrentReturnAddress(): number | undefined
    {
        // If there is no active frame, there is no return address.
        if (this.stackFrames.length === 0)
        {
            return undefined;
        }

        // Return the address stored by the most recent call frame.
        return this.stackFrames[this.stackFrames.length - 1].returnAddress;
    }

    /**
     * Whether the runtime is currently executing inside a call frame.
     */
    public hasStackFrames(): boolean
    {
        return this.stackFrames.length > 0;
    }

    /**
     * Current number of active call frames.
     */
    public getStackDepth(): number
    {
        return this.stackFrames.length;
    }

    /**
     * Clear call frames without affecting globals.
     */
    public clearStackFrames(): void
    {
        // Clear the call stack without touching globals.
        this.stackFrames = [];
    }

    /**
     * Track a key-down event for `INKEY$` style input.
     */
    public setKeyDown(key: string): void
    {
        // Ignore empty keys to keep `getInkey()` semantics simple.
        if (!key)
        {
            return;
        }

        // Track the key as pressed and remember it as the most recent.
        this.pressedKeys.add(key);
        this.lastPressedKey = key;
    }

    /**
     * Track a key-up event for `INKEY$` style input.
     */
    public setKeyUp(key: string): void
    {
        // Ignore empty keys to keep `getInkey()` semantics simple.
        if (!key)
        {
            return;
        }

        // Remove the key from the pressed set.
        this.pressedKeys.delete(key);

        // If the most-recent key was released, clear the preference.
        if (this.lastPressedKey === key)
        {
            this.lastPressedKey = null;
        }
    }

    /**
     * Clear all tracked key state.
     */
    public clearKeys(): void
    {
        // Clear both the set and the "most recent" preference.
        this.pressedKeys.clear();
        this.lastPressedKey = null;
    }

    /**
     * Return a single currently pressed key, or an empty string if none.
     *
     * If the last key pressed is still down, it is preferred.
     */
    public getInkey(): string
    {
        // Prefer the most-recent pressed key if it is still down.
        if (this.lastPressedKey && this.pressedKeys.has(this.lastPressedKey))
        {
            return this.lastPressedKey;
        }

        // Otherwise, return any pressed key (iteration order is fine for this purpose).
        const first = this.pressedKeys.values().next();
        if (!first.done)
        {
            return first.value;
        }

        // No keys are currently pressed.
        return '';
    }

    /**
     * Create a default value for a variable name based on its suffix.
     *
     * Examples:
     * - `x%`  => Integer 0
     * - `s$`  => String ""
     * - `a%[]` => Array of Integer values
     */
    private getDefaultValue(variableName: string): EduBasicValue
    {
        // Infer type from name: array suffix (rank + element sigil) or scalar sigil (%/#/$/&).
        const arraySuffix = tryGetArrayRankSuffixFromName(variableName);
        if (arraySuffix !== null)
        {
            const sigil = arraySuffix.baseName.charAt(arraySuffix.baseName.length - 1);
            
            // Choose element type based on the sigil of the base name.
            switch (sigil)
            {
                case '%':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer };
                case '#':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Real };
                case '$':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.String };
                case '&':
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Complex };
                default:
                    return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Structure };
            }
        }

        // Scalar variables use the final character sigil to determine type.
        const sigil = variableName.charAt(variableName.length - 1);

        switch (sigil)
        {
            case '%':
                return { type: EduBasicType.Integer, value: 0 };
            case '#':
                return { type: EduBasicType.Real, value: 0.0 };
            case '$':
                return { type: EduBasicType.String, value: '' };
            case '&':
                return { type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } };
            default:
                return { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() };
        }
    }

    /**
     * Determine whether a name exists outside the current frame.
     *
     * This is used to implement by-reference bindings without allowing access
     * to the current frame's locals.
     */
    private hasVariableInOuterScopes(name: string): boolean
    {
        // Normalize the name for case-insensitive lookup.
        const lookupKey = name.toUpperCase();

        // Search from the frame below the current one down to the oldest frame.
        for (let i = this.stackFrames.length - 2; i >= 0; i--)
        {
            const frame = this.stackFrames[i];
            if (frame.localVariables.has(lookupKey))
            {
                return true;
            }
        }

        // Fall back to globals.
        return this.globalVariables.has(lookupKey);
    }

    /**
     * Resolve a name in outer scopes (excluding the current frame), falling back to globals,
     * then defaulting if missing.
     *
     * Used for by-reference parameter bindings.
     */
    private getVariableFromOuterScopes(name: string): EduBasicValue
    {
        // Normalize the name for case-insensitive lookup.
        const lookupKey = name.toUpperCase();

        // Search from the frame below the current one down to the oldest frame.
        for (let i = this.stackFrames.length - 2; i >= 0; i--)
        {
            const frame = this.stackFrames[i];
            if (frame.localVariables.has(lookupKey))
            {
                // Remember the last-used casing for display, then return the stored value.
                frame.canonicalLocalNames.set(lookupKey, name);
                return frame.localVariables.get(lookupKey)!;
            }
        }

        // Fall back to globals (also tracking canonical casing).
        this.canonicalGlobalNames.set(lookupKey, name);

        if (this.globalVariables.has(lookupKey))
        {
            return this.globalVariables.get(lookupKey)!;
        }

        // Missing variables produce a type-appropriate default value.
        return this.getDefaultValue(name);
    }

    /**
     * Assign a name in outer scopes (excluding the current frame), falling back to globals.
     *
     * Used for by-reference parameter bindings.
     */
    private setVariableInOuterScopes(name: string, value: EduBasicValue): void
    {
        // Normalize the name for case-insensitive lookup.
        const lookupKey = name.toUpperCase();

        // Search from the frame below the current one down to the oldest frame.
        for (let i = this.stackFrames.length - 2; i >= 0; i--)
        {
            const frame = this.stackFrames[i];
            if (frame.localVariables.has(lookupKey))
            {
                // Assign into the first matching outer local scope.
                frame.canonicalLocalNames.set(lookupKey, name);
                frame.localVariables.set(lookupKey, value);
                return;
            }
        }

        // Fall back to globals (also tracking canonical casing).
        this.canonicalGlobalNames.set(lookupKey, name);
        this.globalVariables.set(lookupKey, value);
    }

    /**
     * Resolve the canonical name from outer scopes for display, or null if unknown.
     */
    private getCanonicalNameFromOuterScopes(name: string): string | null
    {
        // Normalize the name for case-insensitive lookup.
        const lookupKey = name.toUpperCase();

        // Search from the frame below the current one down to the oldest frame.
        for (let i = this.stackFrames.length - 2; i >= 0; i--)
        {
            const frame = this.stackFrames[i];
            const localName = frame.canonicalLocalNames.get(lookupKey);
            if (localName)
            {
                return localName;
            }
        }

        // Fall back to global canonical name if known.
        return this.canonicalGlobalNames.get(lookupKey) ?? null;
    }
}
