import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GraphicsService } from '../interpreter/graphics.service';

/**
 * Output UI component hosting the graphics canvas.
 *
 * Attaches a 2D canvas context to `GraphicsService` and renders flushed `ImageData` buffers.
 */
@Component({
    selector: 'app-output',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './output.component.html',
    styleUrl: './output.component.scss'
})
export class OutputComponent implements AfterViewInit, OnDestroy
{
    /**
     * Reference to the canvas element used for graphics output.
     */
    @ViewChild('canvas', { static: false }) 
    public canvasRef!: ElementRef<HTMLCanvasElement>;
    
    /**
     * UI flag indicating whether output is currently active.
     */
    public isRunning: boolean = false;
    
    private bufferSubscription: Subscription | null = null;

    /**
     * Create a new output component.
     *
     * @param graphicsService Graphics service providing buffer updates.
     */
    public constructor(private readonly graphicsService: GraphicsService)
    {
    }

    /**
     * Initialize the canvas context and subscribe to buffer flushes.
     */
    public ngAfterViewInit(): void
    {
        const canvas = this.canvasRef.nativeElement;
        const context = canvas.getContext('2d');
        
        if (context)
        {
            this.graphicsService.setContext(context);
            
            this.bufferSubscription = this.graphicsService.buffer$.subscribe(buffer =>
            {
                if (buffer && context)
                {
                    // Redraw canvas from flushed ImageData on each buffer update.
                    context.putImageData(buffer, 0, 0);
                }
            });
        }
    }
    
    /**
     * Unsubscribe from buffer updates.
     */
    public ngOnDestroy(): void
    {
        if (this.bufferSubscription)
        {
            this.bufferSubscription.unsubscribe();
        }
    }
}
