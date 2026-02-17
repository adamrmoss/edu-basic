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
 * Implements the `RECTANGLE` statement.
 */
export class RectangleStatement extends Statement
{
    /**
     * First corner X expression.
     */
    public readonly x1: Expression;

    /**
     * First corner Y expression.
     */
    public readonly y1: Expression;

    /**
     * Second corner X expression.
     */
    public readonly x2: Expression;

    /**
     * Second corner Y expression.
     */
    public readonly y2: Expression;

    /**
     * Optional color expression.
     */
    public readonly color: Expression | null;

    /**
     * Whether the rectangle is filled.
     */
    public readonly filled: boolean;

    /**
     * Create a new `RECTANGLE` statement.
     *
     * @param x1 First corner X expression.
     * @param y1 First corner Y expression.
     * @param x2 Second corner X expression.
     * @param y2 Second corner Y expression.
     * @param color Optional color expression.
     * @param filled Whether the rectangle is filled.
     */
    public constructor(
        x1: Expression,
        y1: Expression,
        x2: Expression,
        y2: Expression,
        color: Expression | null,
        filled: boolean
    )
    {
        super();
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
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
        const x1Val = this.x1.evaluate(context);
        const y1Val = this.y1.evaluate(context);
        const x2Val = this.x2.evaluate(context);
        const y2Val = this.y2.evaluate(context);
        
        const x1 = Math.floor(x1Val.type === EduBasicType.Integer || x1Val.type === EduBasicType.Real ? x1Val.value as number : 0);
        const y1 = Math.floor(y1Val.type === EduBasicType.Integer || y1Val.type === EduBasicType.Real ? y1Val.value as number : 0);
        const x2 = Math.floor(x2Val.type === EduBasicType.Integer || x2Val.type === EduBasicType.Real ? x2Val.value as number : 0);
        const y2 = Math.floor(y2Val.type === EduBasicType.Integer || y2Val.type === EduBasicType.Real ? y2Val.value as number : 0);

        // Normalize to top-left corner and width/height regardless of corner order.
        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = resolveColorValue(colorValue);
            const color = intToRgba(rgba);
            
            graphics.drawRectangle(x, y, width, height, this.filled, color);
        }
        else
        {
            graphics.drawRectangle(x, y, width, height, this.filled);
        }
        
        graphics.flush();
        runtime.requestTabSwitch('output');
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = `RECTANGLE FROM (${this.x1.toString()}, ${this.y1.toString()}) TO (${this.x2.toString()}, ${this.y2.toString()})`;

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
