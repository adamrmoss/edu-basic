export interface Color
{
    r: number;
    g: number;
    b: number;
    a: number;
}

export class Graphics
{
    public readonly width: number = 640;
    public readonly height: number = 480;
    public readonly charWidth: number = 8;
    public readonly charHeight: number = 16;
    public readonly rows: number = 30;
    public readonly columns: number = 80;

    private context: CanvasRenderingContext2D | null = null;
    private buffer: ImageData | null = null;
    private foregroundColor: Color = { r: 255, g: 255, b: 255, a: 255 };
    private backgroundColor: Color = { r: 0, g: 0, b: 0, a: 255 };
    private cursorRow: number = 0;
    private cursorColumn: number = 0;

    public setContext(context: CanvasRenderingContext2D): void
    {
        this.context = context;
        this.buffer = context.createImageData(this.width, this.height);
        this.clear();
    }

    public setForegroundColor(color: Color): void
    {
        this.foregroundColor = color;
    }

    public setBackgroundColor(color: Color): void
    {
        this.backgroundColor = color;
    }

    public setCursorPosition(row: number, column: number): void
    {
        this.cursorRow = Math.max(0, Math.min(row, this.rows - 1));
        this.cursorColumn = Math.max(0, Math.min(column, this.columns - 1));
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

        this.drawChar(char, this.cursorRow, this.cursorColumn);

        const newColumn = this.cursorColumn + 1;
        
        if (newColumn >= this.columns)
        {
            this.newLine();
        }
        else
        {
            this.setCursorPosition(this.cursorRow, newColumn);
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
        const newRow = this.cursorRow + 1;
        
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

    public drawPixel(x: number, y: number, color?: Color): void
    {
        if (!this.buffer || x < 0 || x >= this.width || y < 0 || y >= this.height)
        {
            return;
        }
        
        const actualColor = color ?? this.foregroundColor;
        const flippedY = this.height - 1 - y;
        const index = (flippedY * this.width + x) * 4;

        this.buffer.data[index] = actualColor.r;
        this.buffer.data[index + 1] = actualColor.g;
        this.buffer.data[index + 2] = actualColor.b;
        this.buffer.data[index + 3] = actualColor.a;
    }

    public drawLine(x1: number, y1: number, x2: number, y2: number, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        
        let x = x1;
        let y = y1;
        
        while (true)
        {
            this.drawPixel(x, y, c);
            
            if (x === x2 && y === y2)
            {
                break;
            }
            
            const e2 = 2 * err;
            
            if (e2 > -dy)
            {
                err -= dy;
                x += sx;
            }
            
            if (e2 < dx)
            {
                err += dx;
                y += sy;
            }
        }
    }

    public drawRectangle(x: number, y: number, width: number, height: number, filled: boolean, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        
        if (filled)
        {
            for (let dy = 0; dy < height; dy++)
            {
                for (let dx = 0; dx < width; dx++)
                {
                    this.drawPixel(x + dx, y + dy, c);
                }
            }
        }
        else
        {
            for (let dx = 0; dx < width; dx++)
            {
                this.drawPixel(x + dx, y, c);
                this.drawPixel(x + dx, y + height - 1, c);
            }
            
            for (let dy = 0; dy < height; dy++)
            {
                this.drawPixel(x, y + dy, c);
                this.drawPixel(x + width - 1, y + dy, c);
            }
        }
    }

    public drawOval(x: number, y: number, width: number, height: number, filled: boolean, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        const cx = x + width / 2;
        const cy = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;
        
        if (filled)
        {
            for (let dy = 0; dy < height; dy++)
            {
                for (let dx = 0; dx < width; dx++)
                {
                    const px = x + dx;
                    const py = y + dy;
                    const nx = (px - cx) / rx;
                    const ny = (py - cy) / ry;
                    
                    if (nx * nx + ny * ny <= 1)
                    {
                        this.drawPixel(px, py, c);
                    }
                }
            }
        }
        else
        {
            let x0 = Math.floor(rx);
            let y0 = 0;
            let rx2 = rx * rx;
            let ry2 = ry * ry;
            let twoRx2 = 2 * rx2;
            let twoRy2 = 2 * ry2;
            let px = twoRy2 * x0;
            let py = 0;
            
            this.drawPixel(Math.floor(cx + x0), Math.floor(cy), c);
            this.drawPixel(Math.floor(cx - x0), Math.floor(cy), c);
            
            let p = Math.floor(ry2 - (rx2 * ry) + (0.25 * rx2));
            
            while (px > py)
            {
                y0++;
                py += twoRx2;
                
                if (p < 0)
                {
                    p += ry2 + py;
                }
                else
                {
                    x0--;
                    px -= twoRy2;
                    p += ry2 + py - px;
                }
                
                this.drawPixel(Math.floor(cx + x0), Math.floor(cy + y0), c);
                this.drawPixel(Math.floor(cx - x0), Math.floor(cy + y0), c);
                this.drawPixel(Math.floor(cx + x0), Math.floor(cy - y0), c);
                this.drawPixel(Math.floor(cx - x0), Math.floor(cy - y0), c);
            }
            
            p = Math.floor(ry2 * (x0 + 0.5) * (x0 + 0.5) + rx2 * (y0 - ry) * (y0 - ry) - rx2 * ry2);
            
            while (x0 >= 0)
            {
                this.drawPixel(Math.floor(cx + x0), Math.floor(cy + y0), c);
                this.drawPixel(Math.floor(cx - x0), Math.floor(cy + y0), c);
                this.drawPixel(Math.floor(cx + x0), Math.floor(cy - y0), c);
                this.drawPixel(Math.floor(cx - x0), Math.floor(cy - y0), c);
                
                x0--;
                px -= twoRy2;
                
                if (p > 0)
                {
                    p += rx2 - px;
                }
                else
                {
                    y0++;
                    py += twoRx2;
                    p += rx2 - px + py;
                }
            }
        }
    }

    public drawCircle(x: number, y: number, radius: number, filled: boolean, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        
        if (filled)
        {
            for (let dy = -radius; dy <= radius; dy++)
            {
                for (let dx = -radius; dx <= radius; dx++)
                {
                    if (dx * dx + dy * dy <= radius * radius)
                    {
                        this.drawPixel(x + dx, y + dy, c);
                    }
                }
            }
        }
        else
        {
            let x0 = radius;
            let y0 = 0;
            let err = 0;
            
            while (x0 >= y0)
            {
                this.drawPixel(x + x0, y + y0, c);
                this.drawPixel(x + y0, y + x0, c);
                this.drawPixel(x - y0, y + x0, c);
                this.drawPixel(x - x0, y + y0, c);
                this.drawPixel(x - x0, y - y0, c);
                this.drawPixel(x - y0, y - x0, c);
                this.drawPixel(x + y0, y - x0, c);
                this.drawPixel(x + x0, y - y0, c);
                
                if (err <= 0)
                {
                    y0 += 1;
                    err += 2 * y0 + 1;
                }
                
                if (err > 0)
                {
                    x0 -= 1;
                    err -= 2 * x0 + 1;
                }
            }
        }
    }

    public drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, filled: boolean, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        
        if (filled)
        {
            let points = [
                { x: x1, y: y1 },
                { x: x2, y: y2 },
                { x: x3, y: y3 }
            ];
            
            points.sort((a, b) => a.y - b.y);
            
            const [p1, p2, p3] = points;
            
            const fillScanline = (y: number, x1: number, x2: number) =>
            {
                const startX = Math.floor(Math.min(x1, x2));
                const endX = Math.floor(Math.max(x1, x2));
                
                for (let x = startX; x <= endX; x++)
                {
                    this.drawPixel(x, Math.floor(y), c);
                }
            };
            
            const interpolate = (y: number, y1: number, x1: number, y2: number, x2: number): number =>
            {
                if (y2 === y1)
                {
                    return x1;
                }
                
                return x1 + (x2 - x1) * (y - y1) / (y2 - y1);
            };
            
            for (let y = p1.y; y <= p2.y; y++)
            {
                const xa = interpolate(y, p1.y, p1.x, p3.y, p3.x);
                const xb = interpolate(y, p1.y, p1.x, p2.y, p2.x);
                fillScanline(y, xa, xb);
            }
            
            for (let y = p2.y; y <= p3.y; y++)
            {
                const xa = interpolate(y, p1.y, p1.x, p3.y, p3.x);
                const xb = interpolate(y, p2.y, p2.x, p3.y, p3.x);
                fillScanline(y, xa, xb);
            }
        }
        else
        {
            this.drawLine(x1, y1, x2, y2, c);
            this.drawLine(x2, y2, x3, y3, c);
            this.drawLine(x3, y3, x1, y1, c);
        }
    }

    public drawArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        
        const steps = Math.max(Math.floor(Math.abs(endAngle - startAngle) * radius), 1);
        const angleStep = (endAngle - startAngle) / steps;
        
        for (let i = 0; i <= steps; i++)
        {
            const angle = startAngle + i * angleStep;
            const px = Math.floor(x + radius * Math.cos(angle));
            const py = Math.floor(y + radius * Math.sin(angle));
            this.drawPixel(px, py, c);
        }
    }

    public flush(): void
    {
        if (this.context && this.buffer)
        {
            this.context.putImageData(this.buffer, 0, 0);
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

        if (this.context && this.buffer)
        {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.charWidth;
            tempCanvas.height = this.charHeight;
            const tempContext = tempCanvas.getContext('2d');
            
            if (tempContext)
            {
                tempContext.translate(0, this.charHeight);
                tempContext.scale(1, -1);
                tempContext.fillStyle = `rgba(${this.foregroundColor.r}, ${this.foregroundColor.g}, ${this.foregroundColor.b}, ${this.foregroundColor.a / 255})`;
                tempContext.font = '16px "IBM Plex Mono", monospace';
                tempContext.textBaseline = 'top';
                tempContext.fillText(char, 0, 0);
                
                const textData = tempContext.getImageData(0, 0, this.charWidth, this.charHeight);
                
                for (let textRow = 0; textRow < this.charHeight; textRow++)
                {
                    for (let dx = 0; dx < this.charWidth; dx++)
                    {
                        const textIndex = (textRow * this.charWidth + dx) * 4;
                        const alpha = textData.data[textIndex + 3];
                        
                        if (alpha > 0)
                        {
                            const fg = this.foregroundColor;
                            const blendedR = Math.floor((fg.r * alpha + bg.r * (255 - alpha)) / 255);
                            const blendedG = Math.floor((fg.g * alpha + bg.g * (255 - alpha)) / 255);
                            const blendedB = Math.floor((fg.b * alpha + bg.b * (255 - alpha)) / 255);
                            
                            this.drawPixel(x + dx, y + textRow, { r: blendedR, g: blendedG, b: blendedB, a: 255 });
                        }
                    }
                }
            }
        }

        this.flush();
    }

    private scrollUp(): void
    {
        if (!this.buffer)
        {
            return;
        }

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

