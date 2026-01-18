import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { resolveColorValue, intToRgba } from './color-utils';

export class TriangleStatement extends Statement
{
    public constructor(
        public readonly x1: Expression,
        public readonly y1: Expression,
        public readonly x2: Expression,
        public readonly y2: Expression,
        public readonly x3: Expression,
        public readonly y3: Expression,
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
        const x1Val = this.x1.evaluate(context);
        const y1Val = this.y1.evaluate(context);
        const x2Val = this.x2.evaluate(context);
        const y2Val = this.y2.evaluate(context);
        const x3Val = this.x3.evaluate(context);
        const y3Val = this.y3.evaluate(context);
        
        const x1 = Math.floor(x1Val.type === EduBasicType.Integer || x1Val.type === EduBasicType.Real ? x1Val.value as number : 0);
        const y1 = Math.floor(y1Val.type === EduBasicType.Integer || y1Val.type === EduBasicType.Real ? y1Val.value as number : 0);
        const x2 = Math.floor(x2Val.type === EduBasicType.Integer || x2Val.type === EduBasicType.Real ? x2Val.value as number : 0);
        const y2 = Math.floor(y2Val.type === EduBasicType.Integer || y2Val.type === EduBasicType.Real ? y2Val.value as number : 0);
        const x3 = Math.floor(x3Val.type === EduBasicType.Integer || x3Val.type === EduBasicType.Real ? x3Val.value as number : 0);
        const y3 = Math.floor(y3Val.type === EduBasicType.Integer || y3Val.type === EduBasicType.Real ? y3Val.value as number : 0);
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = resolveColorValue(colorValue);
            const color = intToRgba(rgba);
            
            graphics.drawTriangle(x1, y1, x2, y2, x3, y3, this.filled, color);
        }
        else
        {
            graphics.drawTriangle(x1, y1, x2, y2, x3, y3, this.filled);
        }
        
        graphics.flush();
        runtime.requestTabSwitch('output');
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = `TRIANGLE (${this.x1.toString()}, ${this.y1.toString()}) (${this.x2.toString()}, ${this.y2.toString()}) (${this.x3.toString()}, ${this.y3.toString()})`;

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
