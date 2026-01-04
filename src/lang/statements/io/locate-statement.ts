import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class LocateStatement extends Statement
{
    public constructor(
        public readonly row: Expression,
        public readonly column: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement LOCATE statement
        // Evaluate row and column expressions
        // Set text cursor position in video buffer
        const rowValue = this.row.evaluate(context);
        const colValue = this.column.evaluate(context);

        // program.videoBuffer.setCursorPosition(rowValue.value, colValue.value);

        throw new Error('LOCATE statement not yet implemented');
    }

    public toString(): string
    {
        return `LOCATE ${this.row.toString()}, ${this.column.toString()}`;
    }
}

