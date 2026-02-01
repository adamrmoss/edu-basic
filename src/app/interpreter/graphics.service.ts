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

    public readonly buffer$: Observable<ImageData | null> = this.bufferSubject.asObservable();

    public constructor()
    {
        this.graphics = new Graphics();
    }

    public getGraphics(): Graphics
    {
        return this.graphics;
    }

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
