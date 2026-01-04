import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class TurtleStatement extends Statement
{
    public constructor(
        public readonly commands: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement TURTLE statement (Logo-style turtle graphics)
        // - Parse turtle commands string
        // - Execute turtle drawing operations
        throw new Error('TURTLE statement not yet implemented');
    }

    public toString(): string
    {
        return `TURTLE ${this.commands.toString()}`;
    }
}

