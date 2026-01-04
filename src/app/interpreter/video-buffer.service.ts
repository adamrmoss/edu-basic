import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Color
{
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface TextCursor
{
    row: number;
    column: number;
}

@Injectable({
    providedIn: 'root'
})
export class VideoBufferService
{
    public readonly width: number = 640;
    public readonly height: number = 480;
    public readonly charWidth: number = 8;
    public readonly charHeight: number = 16;
    public readonly rows: number = 30;
    public readonly columns: number = 80;

    private readonly bufferSubject = new BehaviorSubject<ImageData | null>(null);
    private readonly foregroundColorSubject = new BehaviorSubject<Color>({ r: 255, g: 255, b: 255, a: 255 });
    private readonly backgroundColorSubject = new BehaviorSubject<Color>({ r: 0, g: 0, b: 0, a: 255 });
    private readonly cursorPositionSubject = new BehaviorSubject<TextCursor>({ row: 0, column: 0 });

    public readonly buffer$: Observable<ImageData | null> = this.bufferSubject.asObservable();
    public readonly foregroundColor$: Observable<Color> = this.foregroundColorSubject.asObservable();
    public readonly backgroundColor$: Observable<Color> = this.backgroundColorSubject.asObservable();
    public readonly cursorPosition$: Observable<TextCursor> = this.cursorPositionSubject.asObservable();

    private context: CanvasRenderingContext2D | null = null;
    private buffer: ImageData | null = null;

    public get foregroundColor(): Color
    {
        return this.foregroundColorSubject.value;
    }

    public get backgroundColor(): Color
    {
        return this.backgroundColorSubject.value;
    }

    public get cursorPosition(): TextCursor
    {
        return this.cursorPositionSubject.value;
    }

    public setContext(context: CanvasRenderingContext2D): void
    {
        this.context = context;
        this.buffer = context.createImageData(this.width, this.height);
        this.clear();
    }

    public setForegroundColor(color: Color): void
    {
        this.foregroundColorSubject.next(color);
    }

    public setBackgroundColor(color: Color): void
    {
        this.backgroundColorSubject.next(color);
    }

    public setCursorPosition(row: number, column: number): void
    {
        this.cursorPositionSubject.next({
            row: Math.max(0, Math.min(row, this.rows - 1)),
            column: Math.max(0, Math.min(column, this.columns - 1))
        });
    }

    public clear(): void
    {
        if (!this.buffer)
        {
            return;
        }

        const bg = this.backgroundColor;
        
        for (let i = 0; i < this.buffer.data.length; i += 4)
        {
            this.buffer.data[i] = bg.r;
            this.buffer.data[i + 1] = bg.g;
            this.buffer.data[i + 2] = bg.b;
            this.buffer.data[i + 3] = bg.a;
        }

        this.setCursorPosition(0, 0);
        this.flush();
    }

    public printChar(char: string): void
    {
        if (char === '\n')
        {
            this.newLine();
            return;
        }

        const cursor = this.cursorPosition;
        this.drawChar(char, cursor.row, cursor.column);

        const newColumn = cursor.column + 1;
        
        if (newColumn >= this.columns)
        {
            this.newLine();
        }
        else
        {
            this.setCursorPosition(cursor.row, newColumn);
        }
    }

    public printText(text: string): void
    {
        for (const char of text)
        {
            this.printChar(char);
        }
    }

    public newLine(): void
    {
        const cursor = this.cursorPosition;
        const newRow = cursor.row + 1;
        
        if (newRow >= this.rows)
        {
            this.scrollUp();
            this.setCursorPosition(this.rows - 1, 0);
        }
        else
        {
            this.setCursorPosition(newRow, 0);
        }
    }

    public drawPixel(x: number, y: number, color: Color): void
    {
        if (!this.buffer || x < 0 || x >= this.width || y < 0 || y >= this.height)
        {
            return;
        }

        const flippedY = this.height - 1 - y;
        const index = (flippedY * this.width + x) * 4;

        this.buffer.data[index] = color.r;
        this.buffer.data[index + 1] = color.g;
        this.buffer.data[index + 2] = color.b;
        this.buffer.data[index + 3] = color.a;
    }

    public flush(): void
    {
        if (this.context && this.buffer)
        {
            this.context.putImageData(this.buffer, 0, 0);
            this.bufferSubject.next(this.buffer);
        }
    }

    private drawChar(char: string, row: number, column: number): void
    {
        const x = column * this.charWidth;
        const y = row * this.charHeight;

        const bg = this.backgroundColor;
        
        for (let dy = 0; dy < this.charHeight; dy++)
        {
            for (let dx = 0; dx < this.charWidth; dx++)
            {
                this.drawPixel(x + dx, y + dy, bg);
            }
        }

        if (this.context)
        {
            const canvasY = this.height - y - this.charHeight;
            this.context.fillStyle = `rgba(${this.foregroundColor.r}, ${this.foregroundColor.g}, ${this.foregroundColor.b}, ${this.foregroundColor.a / 255})`;
            this.context.font = '16px "IBM Plex Mono", monospace';
            this.context.fillText(char, x, canvasY + 12);
        }

        this.flush();
    }

    private scrollUp(): void
    {
        if (!this.buffer)
        {
            return;
        }

        const lineBytes = this.width * this.charHeight * 4;
        
        for (let y = 0; y < this.height - this.charHeight; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                const srcIndex = ((y + this.charHeight) * this.width + x) * 4;
                const dstIndex = (y * this.width + x) * 4;

                this.buffer.data[dstIndex] = this.buffer.data[srcIndex];
                this.buffer.data[dstIndex + 1] = this.buffer.data[srcIndex + 1];
                this.buffer.data[dstIndex + 2] = this.buffer.data[srcIndex + 2];
                this.buffer.data[dstIndex + 3] = this.buffer.data[srcIndex + 3];
            }
        }

        const bg = this.backgroundColor;
        
        for (let y = this.height - this.charHeight; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                const index = (y * this.width + x) * 4;
                this.buffer.data[index] = bg.r;
                this.buffer.data[index + 1] = bg.g;
                this.buffer.data[index + 2] = bg.b;
                this.buffer.data[index + 3] = bg.a;
            }
        }

        this.flush();
    }
}

