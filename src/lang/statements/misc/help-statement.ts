import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { valueToString } from '../../edu-basic-value';
import { CommandHelpRegistry } from './command-help-registry';

export class HelpStatement extends Statement
{
    public constructor(
        public readonly commandKeyword: Expression
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
        const consoleService = runtime.getConsoleService();

        if (!consoleService)
        {
            return { result: ExecutionResult.Continue };
        }

        const keywordValue = this.commandKeyword.evaluate(context);
        const keyword = valueToString(keywordValue).toUpperCase().trim();

        const helpForms = CommandHelpRegistry.getHelpForms(keyword);

        if (helpForms.length === 0)
        {
            consoleService.printOutput(`No help available for command: ${keyword}`);
        }
        else
        {
            for (const form of helpForms)
            {
                consoleService.printOutput(form);
            }
        }

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `HELP ${this.commandKeyword.toString()}`;
    }
}
