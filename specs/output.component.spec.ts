import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { OutputComponent } from '../src/app/output/output.component';
import { GraphicsService } from '../src/app/interpreter/graphics.service';

describe('OutputComponent', () => {
    let fixture: ComponentFixture<OutputComponent>;
    let component: OutputComponent;
    let graphicsService: jest.Mocked<GraphicsService>;
    let bufferSubject: Subject<ImageData | null>;

    beforeEach(async () => {
        bufferSubject = new Subject<ImageData | null>();

        const graphicsServiceMock = {
            buffer$: bufferSubject.asObservable(),
            setContext: jest.fn()
        } as any;

        await TestBed.configureTestingModule({
            imports: [ OutputComponent ],
            providers: [
                { provide: GraphicsService, useValue: graphicsServiceMock }
            ]
        }).compileComponents();

        graphicsService = TestBed.inject(GraphicsService) as jest.Mocked<GraphicsService>;
        fixture = TestBed.createComponent(OutputComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
        jest.restoreAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set context and render buffer updates when canvas context exists', () => {
        const canvas = document.createElement('canvas');
        const putImageData = jest.fn();
        const context = { putImageData } as any;

        jest.spyOn(canvas, 'getContext').mockReturnValue(context);

        component.canvasRef = new ElementRef(canvas);
        component.ngAfterViewInit();

        expect(graphicsService.setContext).toHaveBeenCalledWith(context);

        const buffer = {
            width: 1,
            height: 1,
            data: new Uint8ClampedArray(4)
        } as any as ImageData;

        bufferSubject.next(buffer);
        expect(putImageData).toHaveBeenCalledWith(buffer, 0, 0);
    });

    it('should not set context when canvas context is null', () => {
        const canvas = document.createElement('canvas');
        jest.spyOn(canvas, 'getContext').mockReturnValue(null);

        component.canvasRef = new ElementRef(canvas);
        component.ngAfterViewInit();

        expect(graphicsService.setContext).not.toHaveBeenCalled();
    });

    it('should stop rendering after destroy', () => {
        const canvas = document.createElement('canvas');
        const putImageData = jest.fn();
        const context = { putImageData } as any;

        jest.spyOn(canvas, 'getContext').mockReturnValue(context);

        component.canvasRef = new ElementRef(canvas);
        component.ngAfterViewInit();

        const buffer = {
            width: 1,
            height: 1,
            data: new Uint8ClampedArray(4)
        } as any as ImageData;

        bufferSubject.next(buffer);
        expect(putImageData).toHaveBeenCalledTimes(1);

        component.ngOnDestroy();

        bufferSubject.next(buffer);
        expect(putImageData).toHaveBeenCalledTimes(1);
    });
});

