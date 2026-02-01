import { TestBed } from '@angular/core/testing';
import { filter, take } from 'rxjs';

import { GraphicsService } from '@/app/interpreter/graphics.service';

describe('GraphicsService', () => {
    let service: GraphicsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GraphicsService],
        });

        service = TestBed.inject(GraphicsService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return a stable Graphics instance', () => {
        const g1 = service.getGraphics();
        const g2 = service.getGraphics();

        expect(g1).toBe(g2);
    });

    it('should publish buffer on flush callback after setContext', async () => {
        const putImageData = jest.fn();
        const context = {
            createImageData: jest.fn().mockReturnValue(new ImageData(640, 480)),
            putImageData,
        } as any as CanvasRenderingContext2D;

        const promise = new Promise<ImageData | null>((resolve) => {
            service.buffer$
                .pipe(filter((v) => v !== null), take(1))
                .subscribe((value) => resolve(value));
        });

        service.setContext(context);
        service.getGraphics().flush();

        const buffer = await promise;
        expect(buffer).not.toBeNull();
        expect(putImageData).toHaveBeenCalled();
    });
});

