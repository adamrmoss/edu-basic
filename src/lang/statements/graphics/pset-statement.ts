import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { resolveColorValue, intToRgba } from './color-utils';

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

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const xValue = this.x.evaluate(context);
        const yValue = this.y.evaluate(context);
        
        const x = Math.floor(xValue.type === EduBasicType.Integer || xValue.type === EduBasicType.Real ? xValue.value as number : 0);
        const y = Math.floor(yValue.type === EduBasicType.Integer || yValue.type === EduBasicType.Real ? yValue.value as number : 0);
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = resolveColorValue(colorValue);
            const color = intToRgba(rgba);
            
            graphics.drawPixel(x, y, color);
        }
        else
        {
            graphics.drawPixel(x, y);
        }
        
        graphics.flush();
        runtime.requestTabSwitch('output');
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = `PSET (${this.x.toString()}, ${this.y.toString()})`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        return result;
    }
}

