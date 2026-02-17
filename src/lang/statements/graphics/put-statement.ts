import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType, tryGetArrayRankSuffixFromName } from '../../edu-basic-value';
import { intToRgba } from './color-utils';

/**
 * Implements the `PUT` statement.
 */
export class PutStatement extends Statement
{
    /**
     * Source sprite array variable name.
     */
    public readonly arrayVariable: string;

    /**
     * Destination X coordinate expression.
     */
    public readonly x: Expression;

    /**
     * Destination Y coordinate expression.
     */
    public readonly y: Expression;

    /**
     * Create a new `PUT` statement.
     *
     * @param arrayVariable Source sprite array variable name.
     * @param x Destination X coordinate expression.
     * @param y Destination Y coordinate expression.
     */
    public constructor(arrayVariable: string, x: Expression, y: Expression)
    {
        super();
        this.arrayVariable = arrayVariable;
        this.x = x;
        this.y = y;
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
        // Require 1D sprite array (width, height, pixels); evaluate position; alpha-blend each pixel to buffer, flush.
        const suffix = tryGetArrayRankSuffixFromName(this.arrayVariable);
        if (suffix === null || suffix.rank !== 1)
        {
            throw new Error('PUT: source must be an array');
        }

        const spriteValue = context.getVariable(this.arrayVariable);
        if (spriteValue.type !== EduBasicType.Array)
        {
            throw new Error(`PUT: ${this.arrayVariable} is not an array`);
        }

        if (spriteValue.value.length < 2)
        {
            throw new Error('PUT: invalid sprite array');
        }

        const widthValue = spriteValue.value[0];
        const heightValue = spriteValue.value[1];
        if (widthValue.type !== EduBasicType.Integer || heightValue.type !== EduBasicType.Integer)
        {
            throw new Error('PUT: invalid sprite header');
        }

        const spriteWidth = Math.max(0, Math.floor(widthValue.value as number));
        const spriteHeight = Math.max(0, Math.floor(heightValue.value as number));

        const xVal = this.x.evaluate(context);
        const yVal = this.y.evaluate(context);
        const baseX = Math.floor(xVal.type === EduBasicType.Integer || xVal.type === EduBasicType.Real ? xVal.value as number : 0);
        const baseY = Math.floor(yVal.type === EduBasicType.Integer || yVal.type === EduBasicType.Real ? yVal.value as number : 0);

        const buffer = graphics.getBuffer();
        if (!buffer)
        {
            return { result: ExecutionResult.Continue };
        }

        const expectedPixels = spriteWidth * spriteHeight;
        if (spriteValue.value.length < 2 + expectedPixels)
        {
            throw new Error('PUT: sprite array too small');
        }

        for (let dy = 0; dy < spriteHeight; dy++)
        {
            for (let dx = 0; dx < spriteWidth; dx++)
            {
                const spriteIndex = 2 + dy * spriteWidth + dx;
                const pixelValue = spriteValue.value[spriteIndex];
                if (pixelValue.type !== EduBasicType.Integer)
                {
                    continue;
                }

                const rgbaInt = pixelValue.value as number;
                const src = intToRgba(rgbaInt);

                if (src.a === 0)
                {
                    continue;
                }

                const x = baseX + dx;
                const y = baseY + dy;

                if (x < 0 || x >= graphics.width || y < 0 || y >= graphics.height)
                {
                    continue;
                }

                const dst = PutStatement.getPixel(buffer, graphics.width, graphics.height, x, y);
                const blended = PutStatement.alphaBlend(src, dst);
                PutStatement.setPixel(buffer, graphics.width, graphics.height, x, y, blended);
            }
        }

        graphics.flush();
        runtime.requestTabSwitch('output');

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `PUT ${this.arrayVariable} AT (${this.x.toString()}, ${this.y.toString()})`;
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

    private static alphaBlend(src: { r: number; g: number; b: number; a: number }, dst: { r: number; g: number; b: number; a: number }): { r: number; g: number; b: number; a: number }
    {
        // Standard over operator: src over dst.
        const a = Math.max(0, Math.min(255, src.a));
        const invA = 255 - a;

        const r = Math.floor((src.r * a + dst.r * invA) / 255);
        const g = Math.floor((src.g * a + dst.g * invA) / 255);
        const b = Math.floor((src.b * a + dst.b * invA) / 255);
        const outA = Math.min(255, a + Math.floor((dst.a * invA) / 255));

        return { r, g, b, a: outA };
    }
}
