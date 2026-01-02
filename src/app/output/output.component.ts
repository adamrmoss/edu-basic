import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-output',
    imports: [ CommonModule ],
    templateUrl: './output.component.html',
    styleUrl: './output.component.scss'
})
export class OutputComponent implements AfterViewInit
{
    @ViewChild('canvas', { static: false }) 
    public canvasRef!: ElementRef<HTMLCanvasElement>;
    
    public isRunning: boolean = false;
    private context: CanvasRenderingContext2D | null = null;

    public ngAfterViewInit(): void
    {
        const canvas = this.canvasRef.nativeElement;
        this.context = canvas.getContext('2d');
        
        if (this.context)
        {
            this.clearCanvas();
        }
    }

    public clearCanvas(): void
    {
        if (this.context)
        {
            this.context.fillStyle = '#000000';
            this.context.fillRect(0, 0, 640, 480);
        }
    }

    public drawPixel(x: number, y: number, r: number, g: number, b: number, a: number = 255): void
    {
        if (this.context)
        {
            this.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            this.context.fillRect(x, y, 1, 1);
        }
    }

    public drawText(x: number, y: number, text: string, color: string = '#FFFFFF'): void
    {
        if (this.context)
        {
            this.context.fillStyle = color;
            this.context.font = '16px "IBM Plex Mono", monospace';
            this.context.fillText(text, x, y);
        }
    }

    public getImageData(): ImageData | null
    {
        if (this.context)
        {
            return this.context.getImageData(0, 0, 640, 480);
        }
        
        return null;
    }

    public putImageData(imageData: ImageData): void
    {
        if (this.context)
        {
            this.context.putImageData(imageData, 0, 0);
        }
    }
}

