import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType, EduBasicValue, tryGetArrayRankSuffixFromName } from '../../edu-basic-value';

/**
 * Implements the `INPUT` statement.
 */
export class InputStatement extends Statement
{
    /**
     * Target variable name (scalar or 1D array).
     */
    public readonly variableName: string;

    /**
     * Create a new `INPUT` statement.
     *
     * @param variableName Target variable name.
     */
    public constructor(variableName: string)
    {
        super();
        this.variableName = variableName;
    }

    /**
     * Execute the statement.
     *
     * @returns Execution status.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const raw = this.readUserInput();

        const arraySuffix = tryGetArrayRankSuffixFromName(this.variableName);
        if (arraySuffix !== null)
        {
            if (arraySuffix.rank !== 1)
            {
                throw new Error('INPUT is only supported for 1D arrays');
            }

            const parsedElements = this.parseArrayInput(raw, this.variableName);

            const existing = context.getVariable(this.variableName);
            const elementType = this.getArrayElementType(this.variableName);
            let values: EduBasicValue[] = [];

            if (existing.type === EduBasicType.Array && existing.dimensions && existing.dimensions.length > 1)
            {
                throw new Error('INPUT is only supported for 1D arrays');
            }

            if (existing.type === EduBasicType.Array && existing.elementType === elementType && existing.value.length > 0)
            {
                values = existing.value.slice();
            }
            else
            {
                values = [];
            }

            const targetLength = values.length > 0 ? values.length : parsedElements.length;

            // Pad to target length with defaults, then fill from parsed comma-separated values.
            while (values.length < targetLength)
            {
                values.push(this.getDefaultValueForType(elementType));
            }

            for (let i = 0; i < Math.min(targetLength, parsedElements.length); i++)
            {
                values[i] = parsedElements[i];
            }

            context.setVariable(this.variableName, { type: EduBasicType.Array, value: values, elementType }, false);
            return { result: ExecutionResult.Continue };
        }

        const value = this.parseScalarInput(raw, this.variableName);
        context.setVariable(this.variableName, value, false);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `INPUT ${this.variableName}`;
    }

    private readUserInput(): string
    {
        if (typeof window !== 'undefined' && typeof window.prompt === 'function')
        {
            const result = window.prompt('') ?? '';
            return result;
        }

        return '';
    }

    private parseArrayInput(text: string, arrayName: string): EduBasicValue[]
    {
        const elementType = this.getArrayElementType(arrayName);
        const parts = text.split(',').map(p => p.trim()).filter(p => p.length > 0);
        return parts.map(p => this.parseValueByType(p, elementType));
    }

    private parseScalarInput(text: string, variableName: string): EduBasicValue
    {
        const type = this.getScalarType(variableName);
        return this.parseValueByType(text.trim(), type);
    }

    private getArrayElementType(arrayName: string): EduBasicType
    {
        const suffix = tryGetArrayRankSuffixFromName(arrayName);
        if (suffix === null)
        {
            return EduBasicType.Integer;
        }

        const sigil = suffix.baseName.charAt(suffix.baseName.length - 1);
        switch (sigil)
        {
            case '%':
                return EduBasicType.Integer;
            case '#':
                return EduBasicType.Real;
            case '$':
                return EduBasicType.String;
            case '&':
                return EduBasicType.Complex;
            default:
                return EduBasicType.Structure;
        }
    }

    private getScalarType(variableName: string): EduBasicType
    {
        const sigil = variableName.charAt(variableName.length - 1);
        switch (sigil)
        {
            case '%':
                return EduBasicType.Integer;
            case '#':
                return EduBasicType.Real;
            case '$':
                return EduBasicType.String;
            case '&':
                return EduBasicType.Complex;
            default:
                return EduBasicType.Structure;
        }
    }

    private parseValueByType(text: string, type: EduBasicType): EduBasicValue
    {
        switch (type)
        {
            case EduBasicType.Integer:
            {
                const parsed = Number.parseInt(text, 10);
                if (!Number.isFinite(parsed))
                {
                    throw new Error('INPUT: invalid integer');
                }
                return { type: EduBasicType.Integer, value: parsed };
            }
            case EduBasicType.Real:
            {
                const parsed = Number.parseFloat(text);
                if (!Number.isFinite(parsed))
                {
                    throw new Error('INPUT: invalid real');
                }
                return { type: EduBasicType.Real, value: parsed };
            }
            case EduBasicType.String:
            {
                const trimmed = text.trim();
                if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2)
                {
                    return { type: EduBasicType.String, value: trimmed.substring(1, trimmed.length - 1) };
                }
                return { type: EduBasicType.String, value: text };
            }
            case EduBasicType.Complex:
            {
                const parsed = this.parseComplex(text);
                if (!parsed)
                {
                    throw new Error('INPUT: invalid complex');
                }
                return { type: EduBasicType.Complex, value: parsed };
            }
            case EduBasicType.Structure:
                throw new Error('INPUT: cannot read STRUCTURE values');
            case EduBasicType.Array:
                throw new Error('INPUT: cannot read ARRAY values');
        }
    }

    private parseComplex(text: string): { real: number; imaginary: number } | null
    {
        const trimmed = text.trim();

        const imagOnly = /^([+-]?[\d.]+(?:[eE][+-]?\d+)?)[iI]$/;
        const fullComplex = /^([+-]?[\d.]+(?:[eE][+-]?\d+)?)([+-][\d.]+(?:[eE][+-]?\d+)?)[iI]$/;

        let match = trimmed.match(imagOnly);
        if (match)
        {
            const imaginary = Number.parseFloat(match[1]);
            if (!Number.isFinite(imaginary))
            {
                return null;
            }
            return { real: 0, imaginary };
        }

        match = trimmed.match(fullComplex);
        if (match)
        {
            const real = Number.parseFloat(match[1]);
            const imaginary = Number.parseFloat(match[2]);
            if (!Number.isFinite(real) || !Number.isFinite(imaginary))
            {
                return null;
            }
            return { real, imaginary };
        }

        const asReal = Number.parseFloat(trimmed);
        if (Number.isFinite(asReal))
        {
            return { real: asReal, imaginary: 0 };
        }

        return null;
    }

    private getDefaultValueForType(type: EduBasicType): EduBasicValue
    {
        switch (type)
        {
            case EduBasicType.Integer:
                return { type: EduBasicType.Integer, value: 0 };
            case EduBasicType.Real:
                return { type: EduBasicType.Real, value: 0.0 };
            case EduBasicType.String:
                return { type: EduBasicType.String, value: '' };
            case EduBasicType.Complex:
                return { type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } };
            case EduBasicType.Structure:
                return { type: EduBasicType.Structure, value: new Map() };
            case EduBasicType.Array:
                return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer };
        }
    }
}
