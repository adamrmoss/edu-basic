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
        // Reject invalid indices so callers can treat `undefined` as "no statement".
        if (lineIndex < 0 || lineIndex >= this.statements.length)
        {
            return undefined;
        }

        // Return the statement at the requested index.
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
        // Validate the insertion index (insertion at end is allowed).
        if (lineIndex < 0 || lineIndex > this.statements.length)
        {
            throw new Error(`Invalid line index: ${lineIndex}`);
        }

        // Insert the statement into the program.
        this.statements.splice(lineIndex, 0, statement);

        // Shift label indices for any labels at/after the insertion point.
        this.updateLabelsAfterInsertion(lineIndex);

        // Index the label for fast lookup if the inserted statement defines one.
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
        // Validate the deletion index.
        if (lineIndex < 0 || lineIndex >= this.statements.length)
        {
            throw new Error(`Invalid line index: ${lineIndex}`);
        }

        // Capture the statement so we can remove any label entry it owns.
        const statement = this.statements[lineIndex];

        if (statement instanceof LabelStatement)
        {
            this.labelMap.delete(statement.labelName.toUpperCase());
        }

        // Remove the statement from the program.
        this.statements.splice(lineIndex, 1);

        // Shift label indices for any labels after the deleted line.
        this.updateLabelsAfterDeletion(lineIndex);
    }

    /**
     * Replace a statement at the given line index (labels are updated appropriately).
     */
    public replaceLine(lineIndex: number, statement: Statement): void
    {
        // Validate the replacement index.
        if (lineIndex < 0 || lineIndex >= this.statements.length)
        {
            throw new Error(`Invalid line index: ${lineIndex}`);
        }

        // Remove any label owned by the previous statement at this index.
        const oldStatement = this.statements[lineIndex];

        if (oldStatement instanceof LabelStatement)
        {
            this.labelMap.delete(oldStatement.labelName.toUpperCase());
        }

        // Replace the statement in place.
        this.statements[lineIndex] = statement;

        // Add a label entry if the new statement defines one.
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
        // Append is just an insertion at the end; record the index used.
        const lineIndex = this.statements.length;
        this.statements.push(statement);

        // Index the label for fast lookup if the appended statement defines one.
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
        // Clear any prior label indices.
        this.labelMap.clear();

        // Scan the whole program and index any labels found.
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
        // Bump all stored label indices that now occur after the insertion point.
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
        // Decrement all stored label indices that were after the deleted line.
        for (const [labelName, labelIndex] of this.labelMap.entries())
        {
            if (labelIndex > deletedIndex)
            {
                this.labelMap.set(labelName, labelIndex - 1);
            }
        }
    }
}
