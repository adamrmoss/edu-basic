import { Graphics, Color } from '@/lang/graphics';

export class MockGraphics extends Graphics
{
    public clearCalled: boolean = false;
    public cursorPosition: { row: number; column: number } | null = null;
    public trackedForegroundColor: Color | null = null;
    public trackedBackgroundColor: Color | null = null;
    public pixels: Array<{ x: number; y: number; color?: Color }> = [];
    public lines: Array<{ x1: number; y1: number; x2: number; y2: number; color?: Color }> = [];
    public rectangles: Array<{ x: number; y: number; width: number; height: number; filled: boolean; color?: Color }> = [];
    public ovals: Array<{ x: number; y: number; width: number; height: number; filled: boolean; color?: Color }> = [];
    public circles: Array<{ x: number; y: number; radius: number; filled: boolean; color?: Color }> = [];
    public triangles: Array<{ x1: number; y1: number; x2: number; y2: number; x3: number; y3: number; filled: boolean; color?: Color }> = [];
    public arcs: Array<{ x: number; y: number; radius: number; startAngle: number; endAngle: number; color?: Color }> = [];
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

    public override drawPixel(x: number, y: number, color?: Color): void
    {
        this.pixels.push({ x, y, color });
    }

    public override drawLine(x1: number, y1: number, x2: number, y2: number, color?: Color): void
    {
        this.lines.push({ x1, y1, x2, y2, color });
    }

    public override drawRectangle(x: number, y: number, width: number, height: number, filled: boolean, color?: Color): void
    {
        this.rectangles.push({ x, y, width, height, filled, color });
    }

    public override drawOval(x: number, y: number, width: number, height: number, filled: boolean, color?: Color): void
    {
        this.ovals.push({ x, y, width, height, filled, color });
    }

    public override drawCircle(x: number, y: number, radius: number, filled: boolean, color?: Color): void
    {
        this.circles.push({ x, y, radius, filled, color });
    }

    public override drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, filled: boolean, color?: Color): void
    {
        this.triangles.push({ x1, y1, x2, y2, x3, y3, filled, color });
    }

    public override drawArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, color?: Color): void
    {
        this.arcs.push({ x, y, radius, startAngle, endAngle, color });
    }

    public override clear(): void
    {
        this.clearCalled = true;
    }

    public override printText(text: string): void
    {
        this.printedText.push(text);
        super.printText(text);
    }

    public override newLine(): void
    {
        this.newLineCount++;
        super.newLine();
    }

    public getPrintedOutput(): string
    {
        return this.printedText.join('');
    }
}

