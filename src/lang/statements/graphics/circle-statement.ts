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
 * Implements the `CIRCLE` statement.
 */
export class CircleStatement extends Statement
{
    /**
     * Circle center X expression.
     */
    public readonly centerX: Expression;

    /**
     * Circle center Y expression.
     */
    public readonly centerY: Expression;

    /**
     * Radius expression.
     */
    public readonly radius: Expression;

    /**
     * Optional color expression.
     */
    public readonly color: Expression | null;

    /**
     * Whether the circle is filled.
     */
    public readonly filled: boolean;

    /**
     * Create a new `CIRCLE` statement.
     *
     * @param centerX Circle center X expression.
     * @param centerY Circle center Y expression.
     * @param radius Radius expression.
     * @param color Optional color expression.
     * @param filled Whether the circle is filled.
     */
    public constructor(centerX: Expression, centerY: Expression, radius: Expression, color: Expression | null, filled: boolean)
    {
        super();
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.color = color;
        this.filled = filled;
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
        
        const cx = Math.floor(cxVal.type === EduBasicType.Integer || cxVal.type === EduBasicType.Real ? cxVal.value as number : 0);
        const cy = Math.floor(cyVal.type === EduBasicType.Integer || cyVal.type === EduBasicType.Real ? cyVal.value as number : 0);
        const radius = Math.floor(rVal.type === EduBasicType.Integer || rVal.type === EduBasicType.Real ? rVal.value as number : 0);
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = resolveColorValue(colorValue);
            const color = intToRgba(rgba);
            
            graphics.drawCircle(cx, cy, radius, this.filled, color);
        }
        else
        {
            graphics.drawCircle(cx, cy, radius, this.filled);
        }
        
        graphics.flush();
        runtime.requestTabSwitch('output');
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
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
