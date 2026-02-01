import { Graphics, Color } from '@/lang/graphics';

export class TestGraphics extends Graphics
{
    public clearCalled: boolean = false;
    public cursorPosition: { row: number; column: number } | null = null;
    public trackedForegroundColor: Color | null = null;
    public trackedBackgroundColor: Color | null = null;
    public printedText: string[] = [];
    public newLineCount: number = 0;

    public override setForegroundColor(color: Color): void
    {
        super.setForegroundColor(color);
        this.trackedForegroundColor = color;
    }

    public override setBackgroundColor(color: Color): void
    {
        super.setBackgroundColor(color);
        this.trackedBackgroundColor = color;
    }

    public override setCursorPosition(row: number, column: number): void
    {
        super.setCursorPosition(row, column);
        this.cursorPosition = { row, column };
    }

    public override clear(): void
    {
        this.clearCalled = true;
    }

    public override printText(text: string): void
    {
        this.printedText.push(text);
    }

    public override newLine(): void
    {
        this.newLineCount++;
    }

    public getPrintedOutput(): string
    {
        return this.printedText.join('');
    }
}

