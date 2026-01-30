import { TestBed } from '@angular/core/testing';
import { AudioService } from '@/app/interpreter/audio.service';

describe('AudioService', () => {
    let service: AudioService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AudioService],
        });

        service = TestBed.inject(AudioService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return a stable Audio instance', () => {
        const audio1 = service.getAudio();
        const audio2 = service.getAudio();

        expect(audio1).toBe(audio2);
    });

    it('should delegate muted state', () => {
        service.setMuted(true);
        expect(service.getMuted()).toBe(true);

        service.setMuted(false);
        expect(service.getMuted()).toBe(false);
    });
});

