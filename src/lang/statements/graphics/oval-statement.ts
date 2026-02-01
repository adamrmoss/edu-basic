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
 * Implements the `OVAL` statement.
 */
export class OvalStatement extends Statement
{
    /**
     * Oval center X expression.
     */
    public readonly centerX: Expression;

    /**
     * Oval center Y expression.
     */
    public readonly centerY: Expression;

    /**
     * X-radius expression.
     */
    public readonly radiusX: Expression;

    /**
     * Y-radius expression.
     */
    public readonly radiusY: Expression;

    /**
     * Optional color expression.
     */
    public readonly color: Expression | null;

    /**
     * Whether the oval is filled.
     */
    public readonly filled: boolean;

    /**
     * Create a new `OVAL` statement.
     *
     * @param centerX Oval center X expression.
     * @param centerY Oval center Y expression.
     * @param radiusX X-radius expression.
     * @param radiusY Y-radius expression.
     * @param color Optional color expression.
     * @param filled Whether the oval is filled.
     */
    public constructor(
        centerX: Expression,
        centerY: Expression,
        radiusX: Expression,
        radiusY: Expression,
        color: Expression | null,
        filled: boolean
    )
    {
        super();
        this.centerX = centerX;
        this.centerY = centerY;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
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
            const rgba = resolveColorValue(colorValue);
            const color = intToRgba(rgba);
            
            graphics.drawOval(x, y, width, height, this.filled, color);
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
