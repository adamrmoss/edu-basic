import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class PsetStatement extends Statement
{
    public constructor(
        public readonly x: Expression,
        public readonly y: Expression,
        public readonly color: Expression | null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const xValue = this.x.evaluate(context);
        const yValue = this.y.evaluate(context);
        
        const x = Math.floor(xValue.type === 'integer' || xValue.type === 'real' ? xValue.value as number : 0);
        const y = Math.floor(yValue.type === 'integer' || yValue.type === 'real' ? yValue.value as number : 0);
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = colorValue.type === 'integer' ? colorValue.value as number : 0xFFFFFFFF;
            
            const r = (rgba >> 24) & 0xFF;
            const g = (rgba >> 16) & 0xFF;
            const b = (rgba >> 8) & 0xFF;
            const a = rgba & 0xFF;
            
            graphics.drawPixel(x, y, { r, g, b, a });
        }
        else
        {
            graphics.drawPixel(x, y);
        }
        
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        let result = `PSET (${this.x.toString()}, ${this.y.toString()})`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        return result;
    }
}

