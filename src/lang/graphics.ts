/**
 * EduBASIC graphics runtime.
 *
 * This class provides two closely related rendering modes:
 * - Text-mode output (80 columns × 30 rows) using an internal cursor.
 * - Pixel graphics (640 × 480) using a software `ImageData` buffer.
 *
 * Coordinate systems:
 * - `drawPixel(x, y)` uses a bottom-left origin (0,0) to match EduBASIC expectations.
 * - Text rendering uses a top-left origin for rows/columns (row 0 is the top line).
 *
 * Rendering model:
 * - All drawing updates the in-memory `ImageData` buffer.
 * - `flush()` blits the current buffer to the canvas and triggers the optional callback.
 */
export interface Color
{
    r: number;
    g: number;
    b: number;
    a: number;
}

/**
 * Stateful text + pixel graphics surface backed by an `ImageData` buffer.
 *
 * Notes:
 * - Methods are generally no-ops until `setContext()` is called.
 * - Most public methods are intentionally simple building blocks used by statements
 *   (`PRINT`, `PSET`, `LINE`, `CIRCLE`, etc.).
 */
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
    private lineSpacing: number = 1;
    private textWrap: boolean = true;
    private flushCallback: (() => void) | null = null;

    /**
     * Attach the canvas context and initialize a fresh back buffer.
     *
     * This is expected to be called once during app startup, and again if the
     * canvas context is recreated.
     */
    public setContext(context: CanvasRenderingContext2D): void
    {
        // Attach the canvas context and allocate a fresh buffer.
        this.context = context;
        this.buffer = context.createImageData(this.width, this.height);

        // Initialize the surface to the current background color.
        this.clear();
    }

    /**
     * Provide a callback that runs after each `flush()`.
     *
     * The UI uses this to know when a frame has been rendered.
     */
    public setFlushCallback(callback: (() => void) | null): void
    {
        // Store the callback so `flush()` can notify the host UI.
        this.flushCallback = callback;
    }

    /**
     * Expose the current back buffer for tests/diagnostics.
     */
    public getBuffer(): ImageData | null
    {
        return this.buffer;
    }

    /**
     * Set the active color used when the caller omits `color`.
     */
    public setForegroundColor(color: Color): void
    {
        // Update the default color used by drawing routines.
        this.foregroundColor = color;
    }

    /**
     * Set the color used by `clear()` and as the "paper" behind text glyphs.
     */
    public setBackgroundColor(color: Color): void
    {
        // Update the background used by `clear()` and text cell clearing.
        this.backgroundColor = color;
    }

    /**
     * Enable/disable extra blank lines between text lines.
     */
    public setLineSpacing(enabled: boolean): void
    {
        // Treat line spacing as a 1- or 2-row cursor advance.
        this.lineSpacing = enabled ? 2 : 1;
    }

    /**
     * Enable/disable wrapping when text reaches the right edge.
     */
    public setTextWrap(enabled: boolean): void
    {
        // Enable/disable wrapping when the cursor reaches the last column.
        this.textWrap = enabled;
    }

    /**
     * Position the text cursor in row/column coordinates.
     *
     * Values are clamped to the visible grid.
     */
    public setCursorPosition(row: number, column: number): void
    {
        // Clamp cursor position to the visible text grid.
        this.cursorRow = Math.max(0, Math.min(row, this.rows - 1));
        this.cursorColumn = Math.max(0, Math.min(column, this.columns - 1));
    }

    /**
     * Clear the entire surface and reset the text cursor.
     */
    public clear(): void
    {
        // If we don't have a back buffer yet, there is nothing to clear.
        if (!this.buffer)
        {
            return;
        }

        // Fill the entire back buffer with the background color.
        const bg = this.backgroundColor;
        
        for (let i = 0; i < this.buffer.data.length; i += 4)
        {
            this.buffer.data[i] = bg.r;
            this.buffer.data[i + 1] = bg.g;
            this.buffer.data[i + 2] = bg.b;
            this.buffer.data[i + 3] = bg.a;
        }

        // Reset cursor state and render immediately.
        this.setCursorPosition(0, 0);
        this.flush();
    }

    /**
     * Print a single character at the current cursor position.
     *
     * Special cases:
     * - `\n` triggers `newLine()`.
     * - When the cursor reaches the right edge, wrapping behavior depends on `textWrap`.
     */
    public printChar(char: string): void
    {
        // Treat newline as a cursor movement operation.
        if (char === '\n')
        {
            this.newLine();
            return;
        }

        // Render the glyph into the current cell.
        this.drawChar(char, this.cursorRow, this.cursorColumn);

        // Advance the cursor and apply wrapping/clamping rules.
        const newColumn = this.cursorColumn + 1;
        
        if (newColumn >= this.columns)
        {
            if (this.textWrap)
            {
                this.newLine();
            }
            else
            {
                this.setCursorPosition(this.cursorRow, this.columns - 1);
            }
        }
        else
        {
            this.setCursorPosition(this.cursorRow, newColumn);
        }
    }

    /**
     * Print a string starting at the current cursor position.
     */
    public printText(text: string): void
    {
        // Delegate to `printChar()` so wrapping and newline behavior is consistent.
        for (const char of text)
        {
            this.printChar(char);
        }
    }

    /**
     * Move the cursor to the first column of the next line.
     *
     * When the cursor would move past the bottom of the text grid, the buffer is
     * scrolled up by one text row and the cursor stays on the last row.
     */
    public newLine(): void
    {
        // Apply line spacing by advancing multiple times.
        for (let step = 0; step < this.lineSpacing; step++)
        {
            // Move to the next row; if we're at the bottom, scroll instead.
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
    }

    /**
     * Draw a single pixel using EduBASIC coordinates.
     *
     * The Y axis is flipped so that `y = 0` is the bottom row of the visible surface.
     */
    public drawPixel(x: number, y: number, color?: Color): void
    {
        // Reject draws when the buffer is missing or the pixel is out of bounds.
        if (!this.buffer || x < 0 || x >= this.width || y < 0 || y >= this.height)
        {
            return;
        }
        
        // Compute the RGBA bytes in the back buffer (EduBASIC uses bottom-left origin).
        const actualColor = color ?? this.foregroundColor;
        const flippedY = this.height - 1 - y;
        const index = (flippedY * this.width + x) * 4;

        this.buffer.data[index] = actualColor.r;
        this.buffer.data[index + 1] = actualColor.g;
        this.buffer.data[index + 2] = actualColor.b;
        this.buffer.data[index + 3] = actualColor.a;
    }

    /**
     * Draw a line using an integer grid algorithm.
     */
    public drawLine(x1: number, y1: number, x2: number, y2: number, color?: Color): void
    {
        // Prepare integer step parameters for a grid line-walk.
        const c = color ?? this.foregroundColor;
        
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        
        let x = x1;
        let y = y1;
        
        // Walk pixel-by-pixel until the endpoint is reached.
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

    /**
     * Draw a rectangle with optional fill.
     */
    public drawRectangle(x: number, y: number, width: number, height: number, filled: boolean, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        
        if (filled)
        {
            // Fill by drawing every pixel in the rectangle's area.
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
            // Outline by drawing top/bottom and left/right edges.
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

    /**
     * Draw an oval with optional fill.
     */
    public drawOval(x: number, y: number, width: number, height: number, filled: boolean, color?: Color): void
    {
        // Convert the bounding box into ellipse center + radii.
        const c = color ?? this.foregroundColor;
        const cx = x + width / 2;
        const cy = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;
        
        if (filled)
        {
            // Filled ovals use the implicit ellipse equation to include pixels inside the shape.
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
            // Outline ovals use a midpoint-style algorithm to trace the boundary efficiently.
            let x0 = Math.floor(rx);
            let y0 = 0;
            let rx2 = rx * rx;
            let ry2 = ry * ry;
            let twoRx2 = 2 * rx2;
            let twoRy2 = 2 * ry2;
            let px = twoRy2 * x0;
            let py = 0;
            
            // Seed the algorithm with the initial two symmetric points.
            this.drawPixel(Math.floor(cx + x0), Math.floor(cy), c);
            this.drawPixel(Math.floor(cx - x0), Math.floor(cy), c);
            
            let p = Math.floor(ry2 - (rx2 * ry) + (0.25 * rx2));
            
            // Region 1: progress primarily in Y while the slope magnitude is < 1.
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
            
            // Region 2: progress primarily in X while the slope magnitude is >= 1.
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

    /**
     * Draw a circle with optional fill.
     */
    public drawCircle(x: number, y: number, radius: number, filled: boolean, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        
        if (filled)
        {
            // Filled circles draw a disk by checking the distance-to-center inequality.
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
            // Outline circles use an 8-way symmetric midpoint circle algorithm.
            let x0 = radius;
            let y0 = 0;
            let err = 0;
            
            while (x0 >= y0)
            {
                // Stamp the symmetric octant points.
                this.drawPixel(x + x0, y + y0, c);
                this.drawPixel(x + y0, y + x0, c);
                this.drawPixel(x - y0, y + x0, c);
                this.drawPixel(x - x0, y + y0, c);
                this.drawPixel(x - x0, y - y0, c);
                this.drawPixel(x - y0, y - x0, c);
                this.drawPixel(x + y0, y - x0, c);
                this.drawPixel(x + x0, y - y0, c);
                
                // Update the error term and step in Y / X as needed.
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

    /**
     * Draw a triangle with optional fill.
     */
    public drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, filled: boolean, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        
        if (filled)
        {
            // Sort vertices so we can fill in two monotonic Y ranges.
            let points = [
                { x: x1, y: y1 },
                { x: x2, y: y2 },
                { x: x3, y: y3 }
            ];
            
            points.sort((a, b) => a.y - b.y);
            
            const [p1, p2, p3] = points;
            
            // Fill helper: draw a horizontal scanline between two X coordinates.
            const fillScanline = (y: number, x1: number, x2: number) =>
            {
                const startX = Math.floor(Math.min(x1, x2));
                const endX = Math.floor(Math.max(x1, x2));
                
                for (let x = startX; x <= endX; x++)
                {
                    this.drawPixel(x, Math.floor(y), c);
                }
            };
            
            // Interpolate X position along a line segment at a given Y.
            const interpolate = (y: number, y1: number, x1: number, y2: number, x2: number): number =>
            {
                if (y2 === y1)
                {
                    return x1;
                }
                
                return x1 + (x2 - x1) * (y - y1) / (y2 - y1);
            };
            
            // Fill the upper half (p1 -> p2) against the long edge (p1 -> p3).
            for (let y = p1.y; y <= p2.y; y++)
            {
                const xa = interpolate(y, p1.y, p1.x, p3.y, p3.x);
                const xb = interpolate(y, p1.y, p1.x, p2.y, p2.x);
                fillScanline(y, xa, xb);
            }
            
            // Fill the lower half (p2 -> p3) against the long edge (p1 -> p3).
            for (let y = p2.y; y <= p3.y; y++)
            {
                const xa = interpolate(y, p1.y, p1.x, p3.y, p3.x);
                const xb = interpolate(y, p2.y, p2.x, p3.y, p3.x);
                fillScanline(y, xa, xb);
            }
        }
        else
        {
            // Outline triangles are just three line segments.
            this.drawLine(x1, y1, x2, y2, c);
            this.drawLine(x2, y2, x3, y3, c);
            this.drawLine(x3, y3, x1, y1, c);
        }
    }

    /**
     * Draw an arc (inclusive of endpoints) by sampling points along the circle.
     *
     * `startAngle` and `endAngle` are expected to be in radians.
     */
    public drawArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, color?: Color): void
    {
        const c = color ?? this.foregroundColor;
        
        // Choose a sample count based on arc length, clamped to at least one step.
        const steps = Math.max(Math.floor(Math.abs(endAngle - startAngle) * radius), 1);
        const angleStep = (endAngle - startAngle) / steps;
        
        // Sample points along the arc and plot them as pixels.
        for (let i = 0; i <= steps; i++)
        {
            const angle = startAngle + i * angleStep;
            const px = Math.floor(x + radius * Math.cos(angle));
            const py = Math.floor(y + radius * Math.sin(angle));
            this.drawPixel(px, py, c);
        }
    }

    /**
     * Blit the back buffer onto the canvas and invoke the optional callback.
     */
    public flush(): void
    {
        if (this.context && this.buffer)
        {
            // Blit the back buffer to the canvas.
            this.context.putImageData(this.buffer, 0, 0);
        }

        if (this.flushCallback)
        {
            // Notify the host UI that a frame is available.
            this.flushCallback();
        }
    }

    /**
     * Render a character glyph at the given text cell.
     *
     * Implementation notes:
     * - We "stamp" the background rectangle first to avoid artifacts from previous glyphs.
     * - Glyph rasterization is performed by drawing into a tiny temporary canvas, then
     *   alpha-blending the result into the software buffer.
     */
    private drawChar(char: string, row: number, column: number): void
    {
        // Compute the pixel-space origin of the text cell.
        const x = column * this.charWidth;
        const y = this.height - (row + 1) * this.charHeight;

        // Clear the cell to background first to prevent glyph remnants.
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
            // Rasterize the glyph using a temporary canvas to obtain per-pixel alpha.
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.charWidth;
            tempCanvas.height = this.charHeight;
            const tempContext = tempCanvas.getContext('2d');
            
            if (tempContext)
            {
                // Flip the temp canvas so text draws top-to-bottom in our buffer space.
                tempContext.translate(0, this.charHeight);
                tempContext.scale(1, -1);
                tempContext.fillStyle = `rgba(${this.foregroundColor.r}, ${this.foregroundColor.g}, ${this.foregroundColor.b}, ${this.foregroundColor.a / 255})`;
                tempContext.font = '16px "IBM Plex Mono", monospace';
                tempContext.textBaseline = 'top';
                tempContext.fillText(char, 0, 0);
                
                // Read back the glyph alpha and blend it over the existing background.
                const textData = tempContext.getImageData(0, 0, this.charWidth, this.charHeight);
                
                for (let textRow = 0; textRow < this.charHeight; textRow++)
                {
                    for (let dx = 0; dx < this.charWidth; dx++)
                    {
                        const textIndex = (textRow * this.charWidth + dx) * 4;
                        const alpha = textData.data[textIndex + 3];
                        
                        if (alpha > 0)
                        {
                            // Alpha-blend glyph color with background in software.
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

        // Flush after each character for immediate feedback during interactive output.
        this.flush();
    }

    /**
     * Scroll the entire surface up by one text row.
     *
     * The top portion is replaced with the content one character-height below it,
     * and the last text row is cleared to the background color.
     */
    private scrollUp(): void
    {
        // Scrolling requires a back buffer.
        if (!this.buffer)
        {
            return;
        }

        // Shift pixel rows upward by one character height.
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

        // Clear the newly exposed bottom text row to background.
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

        // Render the updated buffer.
        this.flush();
    }
}
