import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { ArrayDimension, EduBasicType, EduBasicValue, tryGetArrayRankSuffixFromName } from '../../edu-basic-value';

/**
 * Dimension spec used by the `DIM` statement.
 */
export type DimDimensionSpec =
    | { type: 'size'; size: Expression }
    | { type: 'range'; start: Expression; end: Expression };

/**
 * Implements the `DIM` statement.
 */
export class DimStatement extends Statement
{
    /**
     * Array variable name (including rank suffix).
     */
    public readonly arrayName: string;

    /**
     * Dimension specs used to compute bounds and strides.
     */
    public readonly dimensions: DimDimensionSpec[];

    /**
     * Create a new `DIM` statement.
     *
     * @param arrayName Array variable name (including rank suffix).
     * @param dimensions Dimension specs.
     */
    public constructor(arrayName: string, dimensions: DimDimensionSpec[])
    {
        super();
        this.arrayName = arrayName;
        this.dimensions = dimensions;
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
        const elementType = this.getElementTypeFromName(this.arrayName);

        const dimensions = this.evaluateDimensions(context, this.dimensions);
        if (dimensions.length === 0)
        {
            context.setVariable(this.arrayName, { type: EduBasicType.Array, value: [], elementType, dimensions: [] });
            return { result: ExecutionResult.Continue };
        }

        const totalLength = dimensions.reduce((acc, d) => acc * d.length, 1);

        const values: EduBasicValue[] = new Array(totalLength);
        const defaultValue = this.getDefaultValueForType(elementType);

        for (let i = 0; i < totalLength; i++)
        {
            values[i] = defaultValue;
        }

        context.setVariable(this.arrayName, { type: EduBasicType.Array, value: values, elementType, dimensions });
        
        return { result: ExecutionResult.Continue };
    }

    private evaluateDimensions(context: ExecutionContext, specs: DimDimensionSpec[]): ArrayDimension[]
    {
        if (specs.length === 0)
        {
            return [];
        }

        const dimsNoStride: ArrayDimension[] = [];

        for (const spec of specs)
        {
            switch (spec.type)
            {
                case 'size':
                {
                    const size = this.evaluateIndexBound(context, spec.size);
                    if (size < 0)
                    {
                        throw new Error('DIM: Array dimension cannot be negative');
                    }

                    dimsNoStride.push({ lower: 1, length: size, stride: 0 });
                    break;
                }
                case 'range':
                {
                    const start = this.evaluateIndexBound(context, spec.start);
                    const end = this.evaluateIndexBound(context, spec.end);
                    const length = end - start + 1;

                    if (length < 0)
                    {
                        throw new Error('DIM: Array dimension cannot be negative');
                    }

                    dimsNoStride.push({ lower: start, length, stride: 0 });
                    break;
                }
            }
        }

        let stride = 1;
        for (let i = dimsNoStride.length - 1; i >= 0; i--)
        {
            dimsNoStride[i].stride = stride;
            stride *= dimsNoStride[i].length;
        }

        return dimsNoStride;
    }

    public override toString(): string
    {
        const dims = this.dimensions.map(d =>
        {
            switch (d.type)
            {
                case 'size':
                    return d.size.toString();
                case 'range':
                    return `${d.start.toString()} TO ${d.end.toString()}`;
            }
        }).join(', ');
        return `DIM ${this.arrayName}[${dims}]`;
    }

    private getElementTypeFromName(arrayName: string): EduBasicType
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

    private evaluateIndexBound(context: ExecutionContext, expr: Expression): number
    {
        const value = expr.evaluate(context);

        switch (value.type)
        {
            case EduBasicType.Integer:
                return Math.trunc(value.value);
            case EduBasicType.Real:
                return Math.trunc(value.value);
            case EduBasicType.Complex:
                return Math.trunc(value.value.real);
            default:
                return 0;
        }
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
                return { type: EduBasicType.Structure, value: new Map<string, EduBasicValue>() };
            case EduBasicType.Array:
                return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer, dimensions: [{ lower: 1, length: 0, stride: 1 }] };
        }
    }
}
