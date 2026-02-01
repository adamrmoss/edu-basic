import { EduBasicValue, EduBasicType, tryGetArrayRankSuffixFromName } from './edu-basic-value';

interface StackFrame
{
    localVariables: Map<string, EduBasicValue>;
    canonicalLocalNames: Map<string, string>;
    byRefBindings: Map<string, string>;
    returnAddress: number;
}

export class ExecutionContext
{
    private globalVariables: Map<string, EduBasicValue>;
    private canonicalGlobalNames: Map<string, string>;
    private stackFrames: StackFrame[];
    private programCounter: number;
    private pressedKeys: Set<string>;
    private lastPressedKey: string | null;

    public constructor()
    {
        this.globalVariables = new Map<string, EduBasicValue>();
        this.canonicalGlobalNames = new Map<string, string>();
        this.stackFrames = [];
        this.programCounter = 0;
        this.pressedKeys = new Set<string>();
        this.lastPressedKey = null;
    }

    public getProgramCounter(): number
    {
        return this.programCounter;
    }

    public setProgramCounter(value: number): void
    {
        this.programCounter = value;
    }

    public incrementProgramCounter(): void
    {
        this.programCounter++;
    }

    public getVariable(name: string): EduBasicValue
    {
        const lookupKey = name.toUpperCase();

        if (this.stackFrames.length > 0)
        {
            const currentFrame = this.stackFrames[this.stackFrames.length - 1];

            if (currentFrame.byRefBindings.has(lookupKey))
            {
                const targetName = currentFrame.byRefBindings.get(lookupKey)!;
                return this.getVariableFromOuterScopes(targetName);
            }

            if (currentFrame.localVariables.has(lookupKey))
            {
                currentFrame.canonicalLocalNames.set(lookupKey, name);
                return currentFrame.localVariables.get(lookupKey)!;
            }
        }

        this.canonicalGlobalNames.set(lookupKey, name);

        if (this.globalVariables.has(lookupKey))
        {
            return this.globalVariables.get(lookupKey)!;
        }

        return this.getDefaultValue(name);
    }

    public setVariable(name: string, value: EduBasicValue, isLocal: boolean = false): void
    {
        const lookupKey = name.toUpperCase();

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

    public hasVariable(name: string): boolean
    {
        const lookupKey = name.toUpperCase();

        if (this.stackFrames.length > 0)
        {
            const currentFrame = this.stackFrames[this.stackFrames.length - 1];

            if (currentFrame.byRefBindings.has(lookupKey))
            {
                const targetName = currentFrame.byRefBindings.get(lookupKey)!;
                return this.hasVariableInOuterScopes(targetName);
            }

            if (currentFrame.localVariables.has(lookupKey))
            {
                return true;
            }
        }

        return this.globalVariables.has(lookupKey);
    }

    public getVariableType(name: string): EduBasicType | null
    {
        if (!this.hasVariable(name))
        {
            return null;
        }

        const value = this.getVariable(name);
        return value.type;
    }

    public getCanonicalName(name: string): string
    {
        const lookupKey = name.toUpperCase();

        if (this.stackFrames.length > 0)
        {
            const currentFrame = this.stackFrames[this.stackFrames.length - 1];

            if (currentFrame.byRefBindings.has(lookupKey))
            {
                const targetName = currentFrame.byRefBindings.get(lookupKey)!;
                return this.getCanonicalNameFromOuterScopes(targetName) ?? targetName;
            }
            const localName = currentFrame.canonicalLocalNames.get(lookupKey);

            if (localName)
            {
                return localName;
            }
        }

        return this.canonicalGlobalNames.get(lookupKey) ?? name;
    }

    public clearVariables(): void
    {
        this.globalVariables.clear();
        this.canonicalGlobalNames.clear();
        this.stackFrames = [];
    }

    public pushStackFrame(returnAddress: number, byRefBindings?: Map<string, string>): void
    {
        this.stackFrames.push({
            localVariables: new Map<string, EduBasicValue>(),
            canonicalLocalNames: new Map<string, string>(),
            byRefBindings: byRefBindings ?? new Map<string, string>(),
            returnAddress: returnAddress
        });
    }

    public popStackFrame(): number | undefined
    {
        const frame = this.stackFrames.pop();
        return frame?.returnAddress;
    }

    public getCurrentReturnAddress(): number | undefined
    {
        if (this.stackFrames.length === 0)
        {
            return undefined;
        }

        return this.stackFrames[this.stackFrames.length - 1].returnAddress;
    }

    public hasStackFrames(): boolean
    {
        return this.stackFrames.length > 0;
    }

    public getStackDepth(): number
    {
        return this.stackFrames.length;
    }

    public clearStackFrames(): void
    {
        this.stackFrames = [];
    }

    public setKeyDown(key: string): void
    {
        if (!key)
        {
            return;
        }

        this.pressedKeys.add(key);
        this.lastPressedKey = key;
    }

    public setKeyUp(key: string): void
    {
        if (!key)
        {
            return;
        }

        this.pressedKeys.delete(key);

        if (this.lastPressedKey === key)
        {
            this.lastPressedKey = null;
        }
    }

    public clearKeys(): void
    {
        this.pressedKeys.clear();
        this.lastPressedKey = null;
    }

    public getInkey(): string
    {
        if (this.lastPressedKey && this.pressedKeys.has(this.lastPressedKey))
        {
            return this.lastPressedKey;
        }

        const first = this.pressedKeys.values().next();
        if (!first.done)
        {
            return first.value;
        }

        return '';
    }

    private getDefaultValue(variableName: string): EduBasicValue
    {
        const arraySuffix = tryGetArrayRankSuffixFromName(variableName);
        if (arraySuffix !== null)
        {
            const sigil = arraySuffix.baseName.charAt(arraySuffix.baseName.length - 1);
            
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

    private hasVariableInOuterScopes(name: string): boolean
    {
        const lookupKey = name.toUpperCase();

        for (let i = this.stackFrames.length - 2; i >= 0; i--)
        {
            const frame = this.stackFrames[i];
            if (frame.localVariables.has(lookupKey))
            {
                return true;
            }
        }

        return this.globalVariables.has(lookupKey);
    }

    private getVariableFromOuterScopes(name: string): EduBasicValue
    {
        const lookupKey = name.toUpperCase();

        for (let i = this.stackFrames.length - 2; i >= 0; i--)
        {
            const frame = this.stackFrames[i];
            if (frame.localVariables.has(lookupKey))
            {
                frame.canonicalLocalNames.set(lookupKey, name);
                return frame.localVariables.get(lookupKey)!;
            }
        }

        this.canonicalGlobalNames.set(lookupKey, name);

        if (this.globalVariables.has(lookupKey))
        {
            return this.globalVariables.get(lookupKey)!;
        }

        return this.getDefaultValue(name);
    }

    private setVariableInOuterScopes(name: string, value: EduBasicValue): void
    {
        const lookupKey = name.toUpperCase();

        for (let i = this.stackFrames.length - 2; i >= 0; i--)
        {
            const frame = this.stackFrames[i];
            if (frame.localVariables.has(lookupKey))
            {
                frame.canonicalLocalNames.set(lookupKey, name);
                frame.localVariables.set(lookupKey, value);
                return;
            }
        }

        this.canonicalGlobalNames.set(lookupKey, name);
        this.globalVariables.set(lookupKey, value);
    }

    private getCanonicalNameFromOuterScopes(name: string): string | null
    {
        const lookupKey = name.toUpperCase();

        for (let i = this.stackFrames.length - 2; i >= 0; i--)
        {
            const frame = this.stackFrames[i];
            const localName = frame.canonicalLocalNames.get(lookupKey);
            if (localName)
            {
                return localName;
            }
        }

        return this.canonicalGlobalNames.get(lookupKey) ?? null;
    }
}
