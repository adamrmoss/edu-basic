export interface MockAudioContextOptions
{
    currentTime?: number;
    destination?: any;
    sampleRate?: number;
    state?: string;
    createGainReturn?: any;
}

export function mockAudioContext(options?: MockAudioContextOptions): void
{
    const destination = options?.destination ?? {};
    const createGainReturn = options?.createGainReturn ?? {
        gain: { value: 1 },
        connect: jest.fn(),
        disconnect: jest.fn(),
    };

    (window as any).AudioContext = jest.fn().mockImplementation(() => ({
        currentTime: options?.currentTime ?? 0,
        destination,
        sampleRate: options?.sampleRate ?? 44100,
        state: options?.state ?? 'running',
        createGain: jest.fn().mockReturnValue(createGainReturn),
    }));
}

