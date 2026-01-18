import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class LocateStatement extends Statement
{
    public constructor(
        public readonly row: Expression,
        public readonly column: Expression
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
        const rowValue = this.row.evaluate(context);
        const colValue = this.column.evaluate(context);
        
        const row = Math.floor(rowValue.type === EduBasicType.Integer || rowValue.type === EduBasicType.Real ? rowValue.value as number : 0);
        const col = Math.floor(colValue.type === EduBasicType.Integer || colValue.type === EduBasicType.Real ? colValue.value as number : 0);
        
        graphics.setCursorPosition(row, col);
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `LOCATE ${this.row.toString()}, ${this.column.toString()}`;
    }
}
