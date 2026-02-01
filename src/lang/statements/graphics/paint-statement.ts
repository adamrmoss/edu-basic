import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { resolveColorValue, intToRgba } from './color-utils';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `PAINT` statement.
 */
export class PaintStatement extends Statement
{
    /**
     * X coordinate expression.
     */
    public readonly x: Expression;

    /**
     * Y coordinate expression.
     */
    public readonly y: Expression;

    /**
     * Fill color expression.
     */
    public readonly color: Expression;

    /**
     * Create a new `PAINT` statement.
     *
     * @param x X coordinate expression.
     * @param y Y coordinate expression.
     * @param color Fill color expression.
     */
    public constructor(x: Expression, y: Expression, color: Expression)
    {
        super();
        this.x = x;
        this.y = y;
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
        const xValue = this.x.evaluate(context);
        const yValue = this.y.evaluate(context);
        const x = Math.floor(xValue.type === EduBasicType.Integer || xValue.type === EduBasicType.Real ? xValue.value as number : 0);
        const y = Math.floor(yValue.type === EduBasicType.Integer || yValue.type === EduBasicType.Real ? yValue.value as number : 0);

        const colorValue = this.color.evaluate(context);
        const rgba = resolveColorValue(colorValue);
        const fill = intToRgba(rgba);

        const buffer = graphics.getBuffer();
        if (!buffer)
        {
            return { result: ExecutionResult.Continue };
        }

        if (x < 0 || x >= graphics.width || y < 0 || y >= graphics.height)
        {
            return { result: ExecutionResult.Continue };
        }

        const target = PaintStatement.getPixel(buffer, graphics.width, graphics.height, x, y);
        if (target.r === fill.r && target.g === fill.g && target.b === fill.b && target.a === fill.a)
        {
            return { result: ExecutionResult.Continue };
        }

        const visited = new Uint8Array(graphics.width * graphics.height);
        const stackX: number[] = [x];
        const stackY: number[] = [y];

        while (stackX.length > 0)
        {
            const cx = stackX.pop()!;
            const cy = stackY.pop()!;

            const visitIndex = cy * graphics.width + cx;
            if (visited[visitIndex])
            {
                continue;
            }
            visited[visitIndex] = 1;

            const current = PaintStatement.getPixel(buffer, graphics.width, graphics.height, cx, cy);
            if (current.r !== target.r || current.g !== target.g || current.b !== target.b || current.a !== target.a)
            {
                continue;
            }

            PaintStatement.setPixel(buffer, graphics.width, graphics.height, cx, cy, fill);

            if (cx > 0)
            {
                stackX.push(cx - 1);
                stackY.push(cy);
            }
            if (cx < graphics.width - 1)
            {
                stackX.push(cx + 1);
                stackY.push(cy);
            }
            if (cy > 0)
            {
                stackX.push(cx);
                stackY.push(cy - 1);
            }
            if (cy < graphics.height - 1)
            {
                stackX.push(cx);
                stackY.push(cy + 1);
            }
        }

        graphics.flush();
        runtime.requestTabSwitch('output');

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `PAINT (${this.x.toString()}, ${this.y.toString()}) WITH ${this.color.toString()}`;
    }

    private static getPixel(buffer: ImageData, width: number, height: number, x: number, y: number): { r: number; g: number; b: number; a: number }
    {
        const flippedY = height - 1 - y;
        const index = (flippedY * width + x) * 4;
        return {
            r: buffer.data[index],
            g: buffer.data[index + 1],
            b: buffer.data[index + 2],
            a: buffer.data[index + 3]
        };
    }

    private static setPixel(buffer: ImageData, width: number, height: number, x: number, y: number, color: { r: number; g: number; b: number; a: number }): void
    {
        const flippedY = height - 1 - y;
        const index = (flippedY * width + x) * 4;
        buffer.data[index] = color.r;
        buffer.data[index + 1] = color.g;
        buffer.data[index + 2] = color.b;
        buffer.data[index + 3] = color.a;
    }
}
