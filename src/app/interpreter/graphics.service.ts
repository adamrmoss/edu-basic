import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Graphics } from '../../lang/graphics';

/**
 * Owns the shared `Graphics` runtime instance and exposes buffer flushes to the UI.
 *
 * Typical flow:
 * - UI provides a `CanvasRenderingContext2D` via `setContext(...)`.
 * - The language runtime calls `Graphics.flush()`.
 * - A flush callback reads `Graphics.getBuffer()` and emits it on `buffer$`.
 */
@Injectable({
    providedIn: 'root'
})
export class GraphicsService
{
    private readonly graphics: Graphics;
    private readonly bufferSubject = new BehaviorSubject<ImageData | null>(null);

    /**
     * Observable stream of the most recently flushed graphics buffer.
     */
    public readonly buffer$: Observable<ImageData | null> = this.bufferSubject.asObservable();

    /**
     * Create a new graphics service with a shared `Graphics` runtime instance.
     */
    public constructor()
    {
        this.graphics = new Graphics();
    }

    /**
     * Get the shared graphics runtime instance.
     */
    public getGraphics(): Graphics
    {
        return this.graphics;
    }

    /**
     * Attach a canvas rendering context to the graphics runtime and begin emitting buffers on flush.
     *
     * @param context Canvas 2D rendering context.
     */
    public setContext(context: CanvasRenderingContext2D): void
    {
        this.graphics.setContext(context);
        this.graphics.setFlushCallback(() => {
            const buffer = this.graphics.getBuffer();
            if (buffer)
            {
                this.bufferSubject.next(buffer);
            }
        });
    }
}
