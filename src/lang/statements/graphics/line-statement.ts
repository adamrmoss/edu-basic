import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class LineStatement extends Statement
{
    public constructor(
        public readonly x1: Expression,
        public readonly y1: Expression,
        public readonly x2: Expression,
        public readonly y2: Expression,
        public readonly color: Expression | null
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
        const x1Val = this.x1.evaluate(context);
        const y1Val = this.y1.evaluate(context);
        const x2Val = this.x2.evaluate(context);
        const y2Val = this.y2.evaluate(context);
        
        const x1 = Math.floor(x1Val.type === 'integer' || x1Val.type === 'real' ? x1Val.value as number : 0);
        const y1 = Math.floor(y1Val.type === 'integer' || y1Val.type === 'real' ? y1Val.value as number : 0);
        const x2 = Math.floor(x2Val.type === 'integer' || x2Val.type === 'real' ? x2Val.value as number : 0);
        const y2 = Math.floor(y2Val.type === 'integer' || y2Val.type === 'real' ? y2Val.value as number : 0);
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = colorValue.type === 'integer' ? colorValue.value as number : 0xFFFFFFFF;
            
            const r = (rgba >> 24) & 0xFF;
            const g = (rgba >> 16) & 0xFF;
            const b = (rgba >> 8) & 0xFF;
            const a = rgba & 0xFF;
            
            graphics.drawLine(x1, y1, x2, y2, { r, g, b, a });
        }
        else
        {
            graphics.drawLine(x1, y1, x2, y2);
        }
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = `LINE FROM (${this.x1.toString()}, ${this.y1.toString()}) TO (${this.x2.toString()}, ${this.y2.toString()})`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        return result;
    }
}

