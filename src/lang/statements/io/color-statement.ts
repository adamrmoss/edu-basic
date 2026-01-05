import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { EduBasicType } from '../../edu-basic-value';

export class ColorStatement extends Statement
{
    public constructor(
        public readonly foregroundExpr: Expression,
        public readonly backgroundExpr: Expression | null = null
    )
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        const foreground = this.foregroundExpr.evaluate(context);
        
        if (foreground.type !== EduBasicType.Integer)
        {
            throw new Error('COLOR foreground must be an integer');
        }

        const foregroundColor = this.intToRgba(foreground.value as number);
        graphics.setForegroundColor(foregroundColor);

        if (this.backgroundExpr)
        {
            const background = this.backgroundExpr.evaluate(context);
            
            if (background.type !== EduBasicType.Integer)
            {
                throw new Error('COLOR background must be an integer');
            }

            const backgroundColor = this.intToRgba(background.value as number);
            graphics.setBackgroundColor(backgroundColor);
        }

        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        if (this.backgroundExpr)
        {
            return `COLOR ${this.foregroundExpr.toString()}, ${this.backgroundExpr.toString()}`;
        }
        
        return `COLOR ${this.foregroundExpr.toString()}`;
    }

    private intToRgba(color: number): { r: number; g: number; b: number; a: number }
    {
        return {
            r: (color >> 24) & 0xFF,
            g: (color >> 16) & 0xFF,
            b: (color >> 8) & 0xFF,
            a: color & 0xFF
        };
    }
}

