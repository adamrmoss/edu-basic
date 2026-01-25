import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class DimStatement extends Statement
{
    public constructor(
        public readonly arrayName: string,
        public readonly dimensions: Expression[]
    )
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const sizes: number[] = [];
        
        for (const dim of this.dimensions)
        {
            const sizeValue = dim.evaluate(context);
            const size = Math.floor(sizeValue.type === EduBasicType.Integer || sizeValue.type === EduBasicType.Real ? sizeValue.value as number : 0);
            
            if (size < 0)
            {
                throw new Error(`DIM: Array dimension cannot be negative`);
            }
            
            sizes.push(size);
        }
        
        const array = this.createMultiDimensionalArray(sizes);
        context.setVariable(this.arrayName, { type: EduBasicType.Array, value: array, elementType: EduBasicType.Integer });
        
        return { result: ExecutionResult.Continue };
    }
    
    private createMultiDimensionalArray(sizes: number[]): any[]
    {
        if (sizes.length === 0)
        {
            return [];
        }
        
        if (sizes.length === 1)
        {
            return new Array(sizes[0]).fill({ type: EduBasicType.Integer, value: 0 });
        }
        
        const result: any[] = [];
        const [firstSize, ...restSizes] = sizes;
        
        for (let i = 0; i < firstSize; i++)
        {
            result.push(this.createMultiDimensionalArray(restSizes));
        }
        
        return result;
    }

    public override toString(): string
    {
        const dims = this.dimensions.map(d => d.toString()).join(', ');
        return `DIM ${this.arrayName}[${dims}]`;
    }
}
