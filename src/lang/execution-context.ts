import { EduBasicValue, EduBasicType } from './edu-basic-value';

export class ExecutionContext
{
    private variables: Map<string, EduBasicValue>;
    private canonicalNames: Map<string, string>;
    private callStack: number[];
    private labels: Map<string, number>;
    private canonicalLabelNames: Map<string, string>;

    public constructor()
    {
        this.variables = new Map<string, EduBasicValue>();
        this.canonicalNames = new Map<string, string>();
        this.callStack = [];
        this.labels = new Map<string, number>();
        this.canonicalLabelNames = new Map<string, string>();
    }

    public getVariable(name: string): EduBasicValue
    {
        const lookupKey = name.toUpperCase();
        this.canonicalNames.set(lookupKey, name);

        if (this.variables.has(lookupKey))
        {
            return this.variables.get(lookupKey)!;
        }

        return this.getDefaultValue(name);
    }

    public setVariable(name: string, value: EduBasicValue): void
    {
        const lookupKey = name.toUpperCase();
        this.canonicalNames.set(lookupKey, name);
        this.variables.set(lookupKey, value);
    }

    public hasVariable(name: string): boolean
    {
        const lookupKey = name.toUpperCase();
        return this.variables.has(lookupKey);
    }

    public getCanonicalName(name: string): string
    {
        const lookupKey = name.toUpperCase();
        return this.canonicalNames.get(lookupKey) ?? name;
    }

    public clearVariables(): void
    {
        this.variables.clear();
        this.canonicalNames.clear();
    }

    public registerLabel(name: string, statementIndex: number): void
    {
        const lookupKey = name.toUpperCase();
        this.canonicalLabelNames.set(lookupKey, name);
        this.labels.set(lookupKey, statementIndex);
    }

    public getLabel(name: string): number | undefined
    {
        const lookupKey = name.toUpperCase();
        this.canonicalLabelNames.set(lookupKey, name);
        return this.labels.get(lookupKey);
    }

    public getCanonicalLabelName(name: string): string
    {
        const lookupKey = name.toUpperCase();
        return this.canonicalLabelNames.get(lookupKey) ?? name;
    }

    public pushCallStack(returnAddress: number): void
    {
        this.callStack.push(returnAddress);
    }

    public popCallStack(): number | undefined
    {
        return this.callStack.pop();
    }

    private getDefaultValue(variableName: string): EduBasicValue
    {
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
