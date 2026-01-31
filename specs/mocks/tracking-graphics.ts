import { Graphics } from '@/lang/graphics';

export class TrackingGraphics extends Graphics
{
    public lineSpacingCalls: boolean[] = [];
    public textWrapCalls: boolean[] = [];

    public lastCursor: { row: number; column: number } | null = null;
    public newLineCalls: number = 0;

    public override setLineSpacing(enabled: boolean): void
    {
        this.lineSpacingCalls.push(enabled);
        super.setLineSpacing(enabled);
    }

    public override setTextWrap(enabled: boolean): void
    {
        this.textWrapCalls.push(enabled);
        super.setTextWrap(enabled);
    }

    public override setCursorPosition(row: number, column: number): void
    {
        super.setCursorPosition(row, column);
        this.lastCursor = { row, column };
    }

    public override newLine(): void
    {
        this.newLineCalls++;
        super.newLine();
    }
}

