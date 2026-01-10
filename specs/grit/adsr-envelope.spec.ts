import {
    AdsrPhase,
    DEFAULT_ADSR_PERCUSSIVE,
    DEFAULT_ADSR_SUSTAINED,
    DEFAULT_ADSR_PAD,
    DEFAULT_ADSR_PLUCK,
    cloneAdsr,
    validateAdsr,
} from '../../src/grit/adsr-envelope';

describe('ADSR Envelope', () =>
{
    describe('AdsrPhase enum', () =>
    {
        it('should have all envelope phases', () =>
        {
            expect(AdsrPhase.Idle).toBe('IDLE');
            expect(AdsrPhase.Attack).toBe('ATTACK');
            expect(AdsrPhase.Decay).toBe('DECAY');
            expect(AdsrPhase.Sustain).toBe('SUSTAIN');
            expect(AdsrPhase.Release).toBe('RELEASE');
        });
    });

    describe('Default envelope presets', () =>
    {
        describe('DEFAULT_ADSR_PERCUSSIVE', () =>
        {
            it('should have very short attack', () =>
            {
                expect(DEFAULT_ADSR_PERCUSSIVE.attack).toBe(0.001);
            });

            it('should have no sustain', () =>
            {
                expect(DEFAULT_ADSR_PERCUSSIVE.sustain).toBe(0.0);
            });

            it('should have short decay and release', () =>
            {
                expect(DEFAULT_ADSR_PERCUSSIVE.decay).toBe(0.1);
                expect(DEFAULT_ADSR_PERCUSSIVE.release).toBe(0.1);
            });
        });

        describe('DEFAULT_ADSR_SUSTAINED', () =>
        {
            it('should have short attack', () =>
            {
                expect(DEFAULT_ADSR_SUSTAINED.attack).toBe(0.01);
            });

            it('should have high sustain level', () =>
            {
                expect(DEFAULT_ADSR_SUSTAINED.sustain).toBe(0.7);
            });

            it('should have moderate decay and release', () =>
            {
                expect(DEFAULT_ADSR_SUSTAINED.decay).toBe(0.1);
                expect(DEFAULT_ADSR_SUSTAINED.release).toBe(0.2);
            });
        });

        describe('DEFAULT_ADSR_PAD', () =>
        {
            it('should have long attack', () =>
            {
                expect(DEFAULT_ADSR_PAD.attack).toBe(0.5);
            });

            it('should have high sustain level', () =>
            {
                expect(DEFAULT_ADSR_PAD.sustain).toBe(0.8);
            });

            it('should have long release', () =>
            {
                expect(DEFAULT_ADSR_PAD.release).toBe(1.0);
            });
        });

        describe('DEFAULT_ADSR_PLUCK', () =>
        {
            it('should have quick attack', () =>
            {
                expect(DEFAULT_ADSR_PLUCK.attack).toBe(0.005);
            });

            it('should have moderate sustain level', () =>
            {
                expect(DEFAULT_ADSR_PLUCK.sustain).toBe(0.3);
            });

            it('should have moderate decay and release', () =>
            {
                expect(DEFAULT_ADSR_PLUCK.decay).toBe(0.15);
                expect(DEFAULT_ADSR_PLUCK.release).toBe(0.15);
            });
        });
    });

    describe('cloneAdsr', () =>
    {
        it('should create an independent copy', () =>
        {
            const original = { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.3 };
            const cloned = cloneAdsr(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original);
        });

        it('should copy all properties', () =>
        {
            const cloned = cloneAdsr(DEFAULT_ADSR_SUSTAINED);

            expect(cloned.attack).toBe(DEFAULT_ADSR_SUSTAINED.attack);
            expect(cloned.decay).toBe(DEFAULT_ADSR_SUSTAINED.decay);
            expect(cloned.sustain).toBe(DEFAULT_ADSR_SUSTAINED.sustain);
            expect(cloned.release).toBe(DEFAULT_ADSR_SUSTAINED.release);
        });
    });

    describe('validateAdsr', () =>
    {
        it('should pass through valid values', () =>
        {
            const valid = { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.3 };
            const validated = validateAdsr(valid);

            expect(validated).toEqual(valid);
        });

        it('should clamp negative attack to 0', () =>
        {
            const invalid = { attack: -0.5, decay: 0.2, sustain: 0.5, release: 0.3 };
            const validated = validateAdsr(invalid);

            expect(validated.attack).toBe(0);
        });

        it('should clamp negative decay to 0', () =>
        {
            const invalid = { attack: 0.1, decay: -1, sustain: 0.5, release: 0.3 };
            const validated = validateAdsr(invalid);

            expect(validated.decay).toBe(0);
        });

        it('should clamp negative release to 0', () =>
        {
            const invalid = { attack: 0.1, decay: 0.2, sustain: 0.5, release: -0.1 };
            const validated = validateAdsr(invalid);

            expect(validated.release).toBe(0);
        });

        it('should clamp sustain below 0 to 0', () =>
        {
            const invalid = { attack: 0.1, decay: 0.2, sustain: -0.5, release: 0.3 };
            const validated = validateAdsr(invalid);

            expect(validated.sustain).toBe(0);
        });

        it('should clamp sustain above 1 to 1', () =>
        {
            const invalid = { attack: 0.1, decay: 0.2, sustain: 1.5, release: 0.3 };
            const validated = validateAdsr(invalid);

            expect(validated.sustain).toBe(1);
        });

        it('should allow sustain at exactly 0 and 1', () =>
        {
            expect(validateAdsr({ attack: 0.1, decay: 0.2, sustain: 0, release: 0.3 }).sustain).toBe(0);
            expect(validateAdsr({ attack: 0.1, decay: 0.2, sustain: 1, release: 0.3 }).sustain).toBe(1);
        });
    });
});

