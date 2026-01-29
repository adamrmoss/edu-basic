import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';

export class GetStatement extends Statement
{
    public constructor(
        public readonly arrayVariable: string,
        public readonly x1: Expression,
        public readonly y1: Expression,
        public readonly x2: Expression,
        public readonly y2: Expression
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
        if (!this.arrayVariable.endsWith('[]'))
        {
            throw new Error('GET: destination must be an array');
        }

        const x1Val = this.x1.evaluate(context);
        const y1Val = this.y1.evaluate(context);
        const x2Val = this.x2.evaluate(context);
        const y2Val = this.y2.evaluate(context);

        const x1 = Math.floor(x1Val.type === EduBasicType.Integer || x1Val.type === EduBasicType.Real ? x1Val.value as number : 0);
        const y1 = Math.floor(y1Val.type === EduBasicType.Integer || y1Val.type === EduBasicType.Real ? y1Val.value as number : 0);
        const x2 = Math.floor(x2Val.type === EduBasicType.Integer || x2Val.type === EduBasicType.Real ? x2Val.value as number : 0);
        const y2 = Math.floor(y2Val.type === EduBasicType.Integer || y2Val.type === EduBasicType.Real ? y2Val.value as number : 0);

        const minX = Math.max(0, Math.min(x1, x2));
        const minY = Math.max(0, Math.min(y1, y2));
        const maxX = Math.min(graphics.width - 1, Math.max(x1, x2));
        const maxY = Math.min(graphics.height - 1, Math.max(y1, y2));

        const width = Math.max(0, maxX - minX + 1);
        const height = Math.max(0, maxY - minY + 1);

        const buffer = graphics.getBuffer();
        const values: EduBasicValue[] = [];
        values.push({ type: EduBasicType.Integer, value: width });
        values.push({ type: EduBasicType.Integer, value: height });

        if (buffer && width > 0 && height > 0)
        {
            for (let y = minY; y <= maxY; y++)
            {
                for (let x = minX; x <= maxX; x++)
                {
                    const pixel = GetStatement.getPixelRgbaInt(buffer, graphics.width, graphics.height, x, y);
                    values.push({ type: EduBasicType.Integer, value: pixel });
                }
            }
        }

        context.setVariable(this.arrayVariable, { type: EduBasicType.Array, value: values, elementType: EduBasicType.Integer }, false);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `GET ${this.arrayVariable} FROM (${this.x1.toString()}, ${this.y1.toString()}) TO (${this.x2.toString()}, ${this.y2.toString()})`;
    }

    private static getPixelRgbaInt(buffer: ImageData, width: number, height: number, x: number, y: number): number
    {
        const flippedY = height - 1 - y;
        const index = (flippedY * width + x) * 4;
        const r = buffer.data[index];
        const g = buffer.data[index + 1];
        const b = buffer.data[index + 2];
        const a = buffer.data[index + 3];
        return ((r & 0xFF) << 24) | ((g & 0xFF) << 16) | ((b & 0xFF) << 8) | (a & 0xFF);
    }
}
