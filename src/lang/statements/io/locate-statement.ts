import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class LocateStatement extends Statement
{
    public constructor(
        public readonly row: Expression,
        public readonly column: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const rowValue = this.row.evaluate(context);
        const colValue = this.column.evaluate(context);
        
        const row = Math.floor(rowValue.type === 'integer' || rowValue.type === 'real' ? rowValue.value as number : 0);
        const col = Math.floor(colValue.type === 'integer' || colValue.type === 'real' ? colValue.value as number : 0);
        
        graphics.setCursorPosition(row, col);
        
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return `LOCATE ${this.row.toString()}, ${this.column.toString()}`;
    }
}

