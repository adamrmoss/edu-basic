import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { StatementHelpRegistry } from './statement-help-registry';

export class HelpStatement extends Statement
{
    public constructor(
        public readonly keyword: string
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

        const upperKeyword = this.keyword.toUpperCase();

        const helpForms = StatementHelpRegistry.getHelpForms(upperKeyword);

        if (helpForms.length === 0)
        {
            consoleService.printOutput(`No help available for statement: ${upperKeyword}`);
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
        return `HELP ${this.keyword}`;
    }
}
