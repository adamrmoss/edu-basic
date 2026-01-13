import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GraphicsService } from '../interpreter/graphics.service';

@Component({
    selector: 'app-output',
    imports: [ CommonModule ],
    templateUrl: './output.component.html',
    styleUrl: './output.component.scss'
})
export class OutputComponent implements AfterViewInit, OnDestroy
{
    @ViewChild('canvas', { static: false })
    public canvasRef!: ElementRef<HTMLCanvasElement>;
    
    public isRunning: boolean = false;
    
    private bufferSubscription: Subscription | null = null;

    public constructor(private readonly graphicsService: GraphicsService)
    {
    }

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
                    context.putImageData(buffer, 0, 0);
                }
            });
        }
    }
    
    public ngOnDestroy(): void
    {
        if (this.bufferSubscription)
        {
            this.bufferSubscription.unsubscribe();
        }
    }
}

