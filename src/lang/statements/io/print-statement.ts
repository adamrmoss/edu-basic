import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class PrintStatement extends Statement
{
    public constructor(
        public readonly expressions: Expression[],
        public readonly newline: boolean = true
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Need output mechanism - for now just evaluate expressions
        // In a real implementation, this would send output to console/display
        const values = this.expressions.map(expr => expr.evaluate(context));

        // TODO: Format and output the values
        // TODO: Handle newline parameter
        // Placeholder: would call something like context.output(values, this.newline)

        return { result: ExecutionResult.Continue };
    }
}
