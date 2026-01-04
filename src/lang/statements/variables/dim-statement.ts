import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class DimStatement extends Statement
{
    public constructor(
        public readonly arrayName: string,
        public readonly dimensions: Expression[]
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement array resizing
        // Evaluate dimension expressions to get sizes
        // Create or resize the array in the execution context
        throw new Error('DIM statement not yet implemented');
    }

    public toString(): string
    {
        const dims = this.dimensions.map(d => d.toString()).join(', ');
        return `DIM ${this.arrayName}[${dims}]`;
    }
}

