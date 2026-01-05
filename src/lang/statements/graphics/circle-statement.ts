import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class CircleStatement extends Statement
{
    public constructor(
        public readonly centerX: Expression,
        public readonly centerY: Expression,
        public readonly radius: Expression,
        public readonly color: Expression | null,
        public readonly filled: boolean
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const cxVal = this.centerX.evaluate(context);
        const cyVal = this.centerY.evaluate(context);
        const rVal = this.radius.evaluate(context);
        
        const cx = Math.floor(cxVal.type === 'integer' || cxVal.type === 'real' ? cxVal.value as number : 0);
        const cy = Math.floor(cyVal.type === 'integer' || cyVal.type === 'real' ? cyVal.value as number : 0);
        const radius = Math.floor(rVal.type === 'integer' || rVal.type === 'real' ? rVal.value as number : 0);
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = colorValue.type === 'integer' ? colorValue.value as number : 0xFFFFFFFF;
            
            const r = (rgba >> 24) & 0xFF;
            const g = (rgba >> 16) & 0xFF;
            const b = (rgba >> 8) & 0xFF;
            const a = rgba & 0xFF;
            
            graphics.drawCircle(cx, cy, radius, this.filled, { r, g, b, a });
        }
        else
        {
            graphics.drawCircle(cx, cy, radius, this.filled);
        }
        
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        let result = `CIRCLE AT (${this.centerX.toString()}, ${this.centerY.toString()}) RADIUS ${this.radius.toString()}`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        if (this.filled)
        {
            result += ' FILLED';
        }

        return result;
    }
}

