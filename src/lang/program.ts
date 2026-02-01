import { Statement } from './statements/statement';
import { LabelStatement } from './statements/control-flow';
import { Graphics } from './graphics';
import { Audio } from './audio';

/**
 * In-memory representation of a BASIC program as an ordered list of statements.
 *
 * Important terminology:
 * - "Line index" here means a 0-based index into `statements`.
 * - This is distinct from any source-code line numbers that might exist in editor UI.
 *
 * Labels:
 * - `LabelStatement` lines are indexed in `labelMap` for fast GOTO/GOSUB resolution.
 * - Label keys are stored uppercase for case-insensitive lookup.
 */
export class Program
{
    private statements: Statement[];
    private labelMap: Map<string, number>;

    public constructor()
    {
        this.statements = [];
        this.labelMap = new Map<string, number>();
    }

    /**
     * Get the statement at the given 0-based line index.
     */
    public getStatement(lineIndex: number): Statement | undefined
    {
        if (lineIndex < 0 || lineIndex >= this.statements.length)
        {
            return undefined;
        }

        return this.statements[lineIndex];
    }

    /**
     * Get the full statement list.
     *
     * The returned array should be treated as read-only by callers.
     */
    public getStatements(): readonly Statement[]
    {
        return this.statements;
    }

    /**
     * Total number of statements in the program.
     */
    public getLineCount(): number
    {
        return this.statements.length;
    }

    /**
     * Insert a statement at the given line index and update label indices.
     */
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

    /**
     * Delete a statement at the given line index and update label indices.
     */
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

    /**
     * Replace a statement at the given line index (labels are updated appropriately).
     */
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

    /**
     * Append a statement to the end of the program.
     */
    public appendLine(statement: Statement): void
    {
        const lineIndex = this.statements.length;
        this.statements.push(statement);

        if (statement instanceof LabelStatement)
        {
            this.labelMap.set(statement.labelName.toUpperCase(), lineIndex);
        }
    }

    /**
     * Resolve a label name to its 0-based line index, or undefined if missing.
     */
    public getLabelIndex(labelName: string): number | undefined
    {
        return this.labelMap.get(labelName.toUpperCase());
    }

    /**
     * Whether a label exists in the program.
     */
    public hasLabel(labelName: string): boolean
    {
        return this.labelMap.has(labelName.toUpperCase());
    }

    /**
     * Remove all statements and labels.
     */
    public clear(): void
    {
        this.statements = [];
        this.labelMap.clear();
    }

    /**
     * Rebuild label indices from the current statement list.
     *
     * This is useful when statements are mutated outside the normal insert/delete path.
     */
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

    /**
     * After inserting a line, bump any label indices at or after the insertion point.
     */
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

    /**
     * After deleting a line, decrement any label indices that were after the deleted line.
     */
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
