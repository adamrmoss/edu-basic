import { Graphics } from '@/lang/graphics';

function createContext(): { ctx: CanvasRenderingContext2D; putImageData: jest.Mock } {
    const putImageData = jest.fn();

    const ctx = {
        createImageData: jest.fn().mockImplementation((w: number, h: number) => new ImageData(w, h)),
        putImageData,
    } as any as CanvasRenderingContext2D;

    return { ctx, putImageData };
}

function getBottomLeftPixel(buffer: ImageData, width: number, height: number, x: number, y: number): { r: number; g: number; b: number; a: number } {
    const flippedY = height - 1 - y;
    const index = (flippedY * width + x) * 4;
    return {
        r: buffer.data[index],
        g: buffer.data[index + 1],
        b: buffer.data[index + 2],
        a: buffer.data[index + 3],
    };
}

function setTopLeftPixel(buffer: ImageData, width: number, x: number, y: number, rgba: { r: number; g: number; b: number; a: number }): void {
    const index = (y * width + x) * 4;
    buffer.data[index] = rgba.r;
    buffer.data[index + 1] = rgba.g;
    buffer.data[index + 2] = rgba.b;
    buffer.data[index + 3] = rgba.a;
}

describe('Graphics', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should clear buffer and flush on setContext', () => {
        const g = new Graphics();
        const { ctx, putImageData } = createContext();

        g.setContext(ctx);

        const buffer = g.getBuffer();
        expect(buffer).not.toBeNull();
        expect(putImageData).toHaveBeenCalled();
    });

    it('should draw pixels using bottom-left origin and respect bounds', () => {
        const g = new Graphics();
        const { ctx } = createContext();
        g.setContext(ctx);

        g.setForegroundColor({ r: 9, g: 8, b: 7, a: 255 });

        // Out of bounds should no-op.
        g.drawPixel(-1, 0);
        g.drawPixel(0, -1);
        g.drawPixel(g.width, 0);
        g.drawPixel(0, g.height);

        // In bounds should set pixel.
        g.drawPixel(1, 2);

        const buffer = g.getBuffer()!;
        expect(getBottomLeftPixel(buffer, g.width, g.height, 1, 2)).toEqual({ r: 9, g: 8, b: 7, a: 255 });
    });

    it('should draw line/rectangle/circle/triangle branches (filled and outline)', () => {
        const g = new Graphics();
        const { ctx } = createContext();
        g.setContext(ctx);

        g.setForegroundColor({ r: 255, g: 0, b: 0, a: 255 });

        g.drawLine(0, 0, 3, 0);
        g.drawRectangle(10, 10, 4, 3, false);
        g.drawRectangle(20, 20, 3, 2, true);
        g.drawCircle(40, 40, 3, false);
        g.drawCircle(50, 50, 2, true);
        g.drawTriangle(60, 60, 64, 60, 62, 64, false);
        g.drawTriangle(70, 70, 74, 70, 72, 74, true);

        const buffer = g.getBuffer()!;
        expect(getBottomLeftPixel(buffer, g.width, g.height, 0, 0).r).toBe(255);
        expect(getBottomLeftPixel(buffer, g.width, g.height, 3, 0).r).toBe(255);

        // Rectangle outline corner.
        expect(getBottomLeftPixel(buffer, g.width, g.height, 10, 10).r).toBe(255);
        expect(getBottomLeftPixel(buffer, g.width, g.height, 13, 12).r).toBe(255);

        // Filled rectangle interior.
        expect(getBottomLeftPixel(buffer, g.width, g.height, 21, 21).r).toBe(255);

        // Circle filled center.
        expect(getBottomLeftPixel(buffer, g.width, g.height, 50, 50).r).toBe(255);
    });

    it('should draw ovals and arcs', () => {
        const g = new Graphics();
        const { ctx } = createContext();
        g.setContext(ctx);
        g.setForegroundColor({ r: 0, g: 255, b: 0, a: 255 });

        g.drawOval(100, 100, 20, 10, true);
        g.drawOval(130, 100, 20, 10, false);
        g.drawArc(200, 200, 10, 0, Math.PI / 2);

        const buffer = g.getBuffer()!;
        expect(getBottomLeftPixel(buffer, g.width, g.height, 110, 105).g).toBe(255);
        expect(getBottomLeftPixel(buffer, g.width, g.height, 200, 210).g).toBe(255);
    });

    it('should render characters with and without a 2D temp context', () => {
        const g = new Graphics();
        const { ctx } = createContext();
        g.setContext(ctx);

        g.setBackgroundColor({ r: 0, g: 0, b: 255, a: 255 });
        g.clear();
        g.setForegroundColor({ r: 255, g: 0, b: 0, a: 255 });

        const originalCreateElement = document.createElement.bind(document);

        // No temp context: should not draw any foreground pixels (remains background).
        const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
            if (tagName !== 'canvas') {
                return originalCreateElement(tagName);
            }

            return {
                width: 0,
                height: 0,
                getContext: () => null,
            } as any;
        }) as any);

        g.setCursorPosition(0, 0);
        g.printChar('A');

        let buffer = g.getBuffer()!;
        const y0 = g.height - g.charHeight;
        expect(getBottomLeftPixel(buffer, g.width, g.height, 0, y0)).toEqual({ r: 0, g: 0, b: 255, a: 255 });

        // With temp context: alpha>0 at (0,0) should blend foreground onto background.
        createElementSpy.mockRestore();

        jest.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
            if (tagName !== 'canvas') {
                return originalCreateElement(tagName);
            }

            const textData = new ImageData(g.charWidth, g.charHeight);
            textData.data.fill(0);
            // alpha 255 at first pixel
            textData.data[3] = 255;

            const tempContext = {
                translate: jest.fn(),
                scale: jest.fn(),
                fillText: jest.fn(),
                getImageData: jest.fn().mockReturnValue(textData),
                set fillStyle(_: any) { },
                set font(_: any) { },
                set textBaseline(_: any) { },
            } as any;

            return {
                width: 0,
                height: 0,
                getContext: () => tempContext,
            } as any;
        }) as any);

        g.setCursorPosition(0, 0);
        g.printChar('A');

        buffer = g.getBuffer()!;
        expect(getBottomLeftPixel(buffer, g.width, g.height, 0, y0)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });

    it('should handle wrap/no-wrap and line spacing via drawn positions', () => {
        const g = new Graphics();
        const { ctx } = createContext();
        g.setContext(ctx);

        g.setBackgroundColor({ r: 0, g: 0, b: 0, a: 255 });
        g.clear();
        g.setForegroundColor({ r: 255, g: 255, b: 255, a: 255 });

        const originalCreateElement = document.createElement.bind(document);

        // Provide temp context that marks alpha 255 at first pixel.
        jest.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
            if (tagName !== 'canvas') {
                return originalCreateElement(tagName);
            }

            const textData = new ImageData(g.charWidth, g.charHeight);
            textData.data.fill(0);
            textData.data[3] = 255;

            const tempContext = {
                translate: jest.fn(),
                scale: jest.fn(),
                fillText: jest.fn(),
                getImageData: jest.fn().mockReturnValue(textData),
                set fillStyle(_: any) { },
                set font(_: any) { },
                set textBaseline(_: any) { },
            } as any;

            return { width: 0, height: 0, getContext: () => tempContext } as any;
        }) as any);

        // Wrap on: second char should go to next line (row 1, col 0).
        g.setTextWrap(true);
        g.setCursorPosition(0, g.columns - 1);
        g.printChar('A');
        g.printChar('B');

        const buffer = g.getBuffer()!;
        const xLast = (g.columns - 1) * g.charWidth;
        const yRow0 = g.height - g.charHeight;
        const yRow1 = g.height - 2 * g.charHeight;
        expect(getBottomLeftPixel(buffer, g.width, g.height, xLast, yRow0)).toEqual({ r: 255, g: 255, b: 255, a: 255 });
        expect(getBottomLeftPixel(buffer, g.width, g.height, 0, yRow1)).toEqual({ r: 255, g: 255, b: 255, a: 255 });

        // Wrap off: both chars should land on last column, same row (no move to col 0).
        g.clear();
        g.setTextWrap(false);
        g.setCursorPosition(0, g.columns - 1);
        g.printChar('A');
        g.printChar('B');
        expect(getBottomLeftPixel(buffer, g.width, g.height, xLast, yRow0)).toEqual({ r: 255, g: 255, b: 255, a: 255 });
        expect(getBottomLeftPixel(buffer, g.width, g.height, 0, yRow1)).toEqual({ r: 0, g: 0, b: 0, a: 255 });

        // Line spacing: newline should advance 2 rows when enabled.
        g.clear();
        g.setLineSpacing(true);
        g.setCursorPosition(0, 0);
        g.printChar('\n');
        g.printChar('C');
        const yRow2 = g.height - 3 * g.charHeight;
        expect(getBottomLeftPixel(buffer, g.width, g.height, 0, yRow2)).toEqual({ r: 255, g: 255, b: 255, a: 255 });
    });

    it('should scroll up when printing past last row', () => {
        const g = new Graphics();
        const { ctx } = createContext();
        g.setContext(ctx);

        g.setBackgroundColor({ r: 1, g: 2, b: 3, a: 4 });
        g.clear();

        const buffer = g.getBuffer()!;
        // Write a sentinel into the buffer using top-left indexing (matches scrollUp internals).
        setTopLeftPixel(buffer, g.width, 0, g.charHeight, { r: 9, g: 8, b: 7, a: 6 });

        g.setCursorPosition(g.rows - 1, 0);
        g.newLine();

        // After scroll, pixel from y=charHeight should have moved to y=0.
        const topIndex = 0;
        expect(buffer.data[topIndex]).toBe(9);
        expect(buffer.data[topIndex + 1]).toBe(8);
        expect(buffer.data[topIndex + 2]).toBe(7);
        expect(buffer.data[topIndex + 3]).toBe(6);

        // Bottom line should be background.
        const bottomIndex = ((g.height - 1) * g.width + 0) * 4;
        expect(buffer.data[bottomIndex]).toBe(1);
        expect(buffer.data[bottomIndex + 1]).toBe(2);
        expect(buffer.data[bottomIndex + 2]).toBe(3);
        expect(buffer.data[bottomIndex + 3]).toBe(4);
    });
});

