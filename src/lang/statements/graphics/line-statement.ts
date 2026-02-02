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
 * Implements the `LINE` graphics statement.
 */
export class LineStatement extends Statement
{
    /**
     * Start X expression.
     */
    public readonly x1: Expression;

    /**
     * Start Y expression.
     */
    public readonly y1: Expression;

    /**
     * End X expression.
     */
    public readonly x2: Expression;

    /**
     * End Y expression.
     */
    public readonly y2: Expression;

    /**
     * Optional color expression.
     */
    public readonly color: Expression | null;

    /**
     * Create a new `LINE` statement.
     *
     * @param x1 Start X expression.
     * @param y1 Start Y expression.
     * @param x2 End X expression.
     * @param y2 End Y expression.
     * @param color Optional color expression.
     */
    public constructor(x1: Expression, y1: Expression, x2: Expression, y2: Expression, color: Expression | null)
    {
        super();
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
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
        const x1Val = this.x1.evaluate(context);
        const y1Val = this.y1.evaluate(context);
        const x2Val = this.x2.evaluate(context);
        const y2Val = this.y2.evaluate(context);
        
        const x1 = Math.floor(x1Val.type === EduBasicType.Integer || x1Val.type === EduBasicType.Real ? x1Val.value as number : 0);
        const y1 = Math.floor(y1Val.type === EduBasicType.Integer || y1Val.type === EduBasicType.Real ? y1Val.value as number : 0);
        const x2 = Math.floor(x2Val.type === EduBasicType.Integer || x2Val.type === EduBasicType.Real ? x2Val.value as number : 0);
        const y2 = Math.floor(y2Val.type === EduBasicType.Integer || y2Val.type === EduBasicType.Real ? y2Val.value as number : 0);
        
        if (this.color)
        {
            const colorValue = this.color.evaluate(context);
            const rgba = resolveColorValue(colorValue);
            const color = intToRgba(rgba);
            
            graphics.drawLine(x1, y1, x2, y2, color);
        }
        else
        {
            graphics.drawLine(x1, y1, x2, y2);
        }
        
        graphics.flush();
        runtime.requestTabSwitch('output');
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        let result = `LINE FROM (${this.x1.toString()}, ${this.y1.toString()}) TO (${this.x2.toString()}, ${this.y2.toString()})`;

        if (this.color)
        {
            result += ` WITH ${this.color.toString()}`;
        }

        return result;
    }
}
