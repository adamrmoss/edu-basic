import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { resolveColorValue, intToRgba } from './color-utils';

/**
 * Implements the `ARC` statement.
 */
export class ArcStatement extends Statement
{
    /**
     * Arc center X expression.
     */
    public readonly centerX: Expression;

    /**
     * Arc center Y expression.
     */
    public readonly centerY: Expression;

    /**
     * Radius expression.
     */
    public readonly radius: Expression;

    /**
     * Start angle expression.
     */
    public readonly startAngle: Expression;

    /**
     * End angle expression.
     */
    public readonly endAngle: Expression;

    /**
     * Optional color expression.
     */
    public readonly color: Expression | null;

    /**
     * Create a new `ARC` statement.
     *
     * @param centerX Arc center X expression.
     * @param centerY Arc center Y expression.
     * @param radius Radius expression.
     * @param startAngle Start angle expression.
     * @param endAngle End angle expression.
     * @param color Optional color expression.
     */
    public constructor(
        centerX: Expression,
        centerY: Expression,
        radius: Expression,
        startAngle: Expression,
        endAngle: Expression,
        color: Expression | null
    )
    {
        super();
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.color = color;
    }

    /**
     * Execute the statement.
     *
     * @returns Execution status.
     */
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
        
        const cx = Math.floor(cxVal.type === EduBasicType.Integer || cxVal.type === EduBasicType.Real ? cxVal.value as number : 0);
        const cy = Math.floor(cyVal.type === EduBasicType.Integer || cyVal.type === EduBasicType.Real ? cyVal.value as number : 0);
        const radius = Math.floor(rVal.type === EduBasicType.Integer || rVal.type === EduBasicType.Real ? rVal.value as number : 0);
        const startAngle = startVal.type === EduBasicType.Integer || startVal.type === EduBasicType.Real ? startVal.value as number : 0;
        const endAngle = endVal.type === EduBasicType.Integer || endVal.type === EduBasicType.Real ? endVal.value as number : 0;
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = resolveColorValue(colorValue);
            const color = intToRgba(rgba);
            
            graphics.drawArc(cx, cy, radius, startAngle, endAngle, color);
        }
        else
        {
            graphics.drawArc(cx, cy, radius, startAngle, endAngle);
        }
        
        graphics.flush();
        runtime.requestTabSwitch('output');
        
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
