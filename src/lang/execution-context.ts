import { EduBasicValue, EduBasicType } from './edu-basic-value';

interface StackFrame
{
    localVariables: Map<string, EduBasicValue>;
    canonicalLocalNames: Map<string, string>;
    returnAddress: number;
}

export class ExecutionContext
{
    private globalVariables: Map<string, EduBasicValue>;
    private canonicalGlobalNames: Map<string, string>;
    private stackFrames: StackFrame[];
    private programCounter: number;

    public constructor()
    {
        this.globalVariables = new Map<string, EduBasicValue>();
        this.canonicalGlobalNames = new Map<string, string>();
        this.stackFrames = [];
        this.programCounter = 0;
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

            if (currentFrame.localVariables.has(lookupKey))
            {
                return true;
            }
        }

        return this.globalVariables.has(lookupKey);
    }

    public getCanonicalName(name: string): string
    {
        const lookupKey = name.toUpperCase();

        if (this.stackFrames.length > 0)
        {
            const currentFrame = this.stackFrames[this.stackFrames.length - 1];
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

    public pushStackFrame(returnAddress: number): void
    {
        this.stackFrames.push({
            localVariables: new Map<string, EduBasicValue>(),
            canonicalLocalNames: new Map<string, string>(),
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

    private getDefaultValue(variableName: string): EduBasicValue
    {
        if (variableName.endsWith('[]'))
        {
            const sigil = variableName.charAt(variableName.length - 3);
            
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
}
