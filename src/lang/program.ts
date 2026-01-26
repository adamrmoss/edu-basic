import { Statement } from './statements/statement';
import { LabelStatement } from './statements/control-flow';
import { Graphics } from './graphics';
import { Audio } from './audio';

export class Program
{
    private statements: Statement[];
    private labelMap: Map<string, number>;

    public constructor()
    {
        this.statements = [];
        this.labelMap = new Map<string, number>();
    }

    public getStatement(lineIndex: number): Statement | undefined
    {
        if (lineIndex < 0 || lineIndex >= this.statements.length)
        {
            return undefined;
        }

        return this.statements[lineIndex];
    }

    public getStatements(): readonly Statement[]
    {
        return this.statements;
    }

    public getLineCount(): number
    {
        return this.statements.length;
    }

    public insertLine(lineIndex: number, statement: Statement): void
    {
        if (lineIndex < 0 || lineIndex > this.statements.length)
        {
            throw new Error(`Invalid line index: ${lineIndex}`);
        }

        this.statements.splice(lineIndex, 0, statement);

        this.updateLabelsAfterInsertion(lineIndex);

        if (statement instanceof LabelStatement)
        {
            this.labelMap.set(statement.labelName.toUpperCase(), lineIndex);
        }
    }

    public deleteLine(lineIndex: number): void
    {
        if (lineIndex < 0 || lineIndex >= this.statements.length)
        {
            throw new Error(`Invalid line index: ${lineIndex}`);
        }

        const statement = this.statements[lineIndex];

        if (statement instanceof LabelStatement)
        {
            this.labelMap.delete(statement.labelName.toUpperCase());
        }

        this.statements.splice(lineIndex, 1);

        this.updateLabelsAfterDeletion(lineIndex);
    }

    public replaceLine(lineIndex: number, statement: Statement): void
    {
        if (lineIndex < 0 || lineIndex >= this.statements.length)
        {
            throw new Error(`Invalid line index: ${lineIndex}`);
        }

        const oldStatement = this.statements[lineIndex];

        if (oldStatement instanceof LabelStatement)
        {
            this.labelMap.delete(oldStatement.labelName.toUpperCase());
        }

        this.statements[lineIndex] = statement;

        if (statement instanceof LabelStatement)
        {
            this.labelMap.set(statement.labelName.toUpperCase(), lineIndex);
        }
    }

    public appendLine(statement: Statement): void
    {
        const lineIndex = this.statements.length;
        this.statements.push(statement);

        if (statement instanceof LabelStatement)
        {
            this.labelMap.set(statement.labelName.toUpperCase(), lineIndex);
        }
    }

    public getLabelIndex(labelName: string): number | undefined
    {
        return this.labelMap.get(labelName.toUpperCase());
    }

    public hasLabel(labelName: string): boolean
    {
        return this.labelMap.has(labelName.toUpperCase());
    }

    public clear(): void
    {
        this.statements = [];
        this.labelMap.clear();
    }

    public rebuildLabelMap(): void
    {
        this.labelMap.clear();

        for (let i = 0; i < this.statements.length; i++)
        {
            const statement = this.statements[i];

            if (statement instanceof LabelStatement)
            {
                this.labelMap.set(statement.labelName.toUpperCase(), i);
            }
        }
    }

    private updateLabelsAfterInsertion(insertedIndex: number): void
    {
        for (const [labelName, labelIndex] of this.labelMap.entries())
        {
            if (labelIndex >= insertedIndex)
            {
                this.labelMap.set(labelName, labelIndex + 1);
            }
        }
    }

    private updateLabelsAfterDeletion(deletedIndex: number): void
    {
        for (const [labelName, labelIndex] of this.labelMap.entries())
        {
            if (labelIndex > deletedIndex)
            {
                this.labelMap.set(labelName, labelIndex - 1);
            }
        }
    }
}
