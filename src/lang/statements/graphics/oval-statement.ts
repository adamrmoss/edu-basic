import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class OvalStatement extends Statement
{
    public constructor(
        public readonly centerX: Expression,
        public readonly centerY: Expression,
        public readonly radiusX: Expression,
        public readonly radiusY: Expression,
        public readonly color: Expression | null,
        public readonly filled: boolean
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
        const rxVal = this.radiusX.evaluate(context);
        const ryVal = this.radiusY.evaluate(context);
        
        const cx = Math.floor(cxVal.type === EduBasicType.Integer || cxVal.type === EduBasicType.Real ? cxVal.value as number : 0);
        const cy = Math.floor(cyVal.type === EduBasicType.Integer || cyVal.type === EduBasicType.Real ? cyVal.value as number : 0);
        const rx = Math.floor(rxVal.type === EduBasicType.Integer || rxVal.type === EduBasicType.Real ? rxVal.value as number : 0);
        const ry = Math.floor(ryVal.type === EduBasicType.Integer || ryVal.type === EduBasicType.Real ? ryVal.value as number : 0);
        
        const x = cx - rx;
        const y = cy - ry;
        const width = rx * 2;
        const height = ry * 2;
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = colorValue.type === EduBasicType.Integer ? colorValue.value as number : 0xFFFFFFFF;
            
            const r = (rgba >> 24) & 0xFF;
            const g = (rgba >> 16) & 0xFF;
            const b = (rgba >> 8) & 0xFF;
            const a = rgba & 0xFF;
            
            graphics.drawOval(x, y, width, height, this.filled, { r, g, b, a });
        }
        else
        {
            graphics.drawOval(x, y, width, height, this.filled);
        }
        
        graphics.flush();
        runtime.requestTabSwitch('output');
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = `OVAL AT (${this.centerX.toString()}, ${this.centerY.toString()}) RADII (${this.radiusX.toString()}, ${this.radiusY.toString()})`;

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

