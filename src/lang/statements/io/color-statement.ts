import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType, EduBasicValue } from '../../edu-basic-value';
import { getColorValue, isColorName } from '../../colors';
import { resolveColorValue, intToRgba } from '../graphics/color-utils';

export class ColorStatement extends Statement
{
    public constructor(
        public readonly foregroundExpr: Expression,
        public readonly backgroundExpr: Expression | null = null
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
        const foreground = this.foregroundExpr.evaluate(context);
        const foregroundRgba = resolveColorValue(foreground);
        const foregroundColor = intToRgba(foregroundRgba);
        graphics.setForegroundColor(foregroundColor);

        if (this.backgroundExpr)
        {
            const background = this.backgroundExpr.evaluate(context);
            const backgroundRgba = resolveColorValue(background);
            const backgroundColor = intToRgba(backgroundRgba);
            graphics.setBackgroundColor(backgroundColor);
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        if (this.backgroundExpr)
        {
            return `COLOR ${this.foregroundExpr.toString()}, ${this.backgroundExpr.toString()}`;
        }
        
        return `COLOR ${this.foregroundExpr.toString()}`;
    }

}
