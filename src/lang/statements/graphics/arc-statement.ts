import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export class ArcStatement extends Statement
{
    public constructor(
        public readonly centerX: Expression,
        public readonly centerY: Expression,
        public readonly radius: Expression,
        public readonly startAngle: Expression,
        public readonly endAngle: Expression,
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
        const cxVal = this.centerX.evaluate(context);
        const cyVal = this.centerY.evaluate(context);
        const rVal = this.radius.evaluate(context);
        const startVal = this.startAngle.evaluate(context);
        const endVal = this.endAngle.evaluate(context);
        
        const cx = Math.floor(cxVal.type === 'integer' || cxVal.type === 'real' ? cxVal.value as number : 0);
        const cy = Math.floor(cyVal.type === 'integer' || cyVal.type === 'real' ? cyVal.value as number : 0);
        const radius = Math.floor(rVal.type === 'integer' || rVal.type === 'real' ? rVal.value as number : 0);
        const startAngle = startVal.type === 'integer' || startVal.type === 'real' ? startVal.value as number : 0;
        const endAngle = endVal.type === 'integer' || endVal.type === 'real' ? endVal.value as number : 0;
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = colorValue.type === 'integer' ? colorValue.value as number : 0xFFFFFFFF;
            
            const r = (rgba >> 24) & 0xFF;
            const g = (rgba >> 16) & 0xFF;
            const b = (rgba >> 8) & 0xFF;
            const a = rgba & 0xFF;
            
            graphics.drawArc(cx, cy, radius, startAngle, endAngle, { r, g, b, a });
        }
        else
        {
            graphics.drawArc(cx, cy, radius, startAngle, endAngle);
        }
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = `ARC AT (${this.centerX.toString()}, ${this.centerY.toString()}) RADIUS ${this.radius.toString()} FROM ${this.startAngle.toString()} TO ${this.endAngle.toString()}`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        return result;
    }
}

