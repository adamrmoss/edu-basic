import {
    PRESET_CATEGORIES,
    PRESETS,
    PRESET_INFO,
    getPresetInfo,
    getPresetNoiseCode,
    getPresetsInCategory,
    searchPresets,
} from '../../src/grit/presets';
import { decodeNoiseCode } from '../../src/grit/noise-code';

describe('Presets', () =>
{
    describe('PRESET_CATEGORIES', () =>
    {
        it('should have 8 categories', () =>
        {
            expect(Object.keys(PRESET_CATEGORIES).length).toBe(8);
        });

        it('should cover indices 0-127', () =>
        {
            expect(PRESET_CATEGORIES.PURE_TONES.start).toBe(0);
            expect(PRESET_CATEGORIES.AMBIENCE.end).toBe(127);
        });

        it('should have non-overlapping ranges', () =>
        {
            const ranges = Object.values(PRESET_CATEGORIES);

            for (let i = 0; i < ranges.length - 1; i++)
            {
                expect(ranges[i].end + 1).toBe(ranges[i + 1].start);
            }
        });

        it('should have 16 presets per category', () =>
        {
            for (const category of Object.values(PRESET_CATEGORIES))
            {
                expect(category.end - category.start + 1).toBe(16);
            }
        });
    });

    describe('PRESETS array', () =>
    {
        it('should have exactly 128 presets', () =>
        {
            expect(PRESETS.length).toBe(128);
        });

        it('should contain only valid 32-bit numbers', () =>
        {
            for (const preset of PRESETS)
            {
                expect(preset).toBeGreaterThanOrEqual(0);
                expect(preset).toBeLessThanOrEqual(0xFFFFFFFF);
            }
        });

        it('should have at least one LFSR enabled for each preset', () =>
        {
            for (let i = 0; i < PRESETS.length; i++)
            {
                const fields = decodeNoiseCode(PRESETS[i]);
                const anyEnabled = fields.aEnabled || fields.bEnabled || fields.cEnabled;

                expect(anyEnabled).toBe(true);
            }
        });
    });

    describe('PRESET_INFO array', () =>
    {
        it('should have exactly 128 preset info entries', () =>
        {
            expect(PRESET_INFO.length).toBe(128);
        });

        it('should have matching noiseCode values with PRESETS array', () =>
        {
            for (let i = 0; i < PRESET_INFO.length; i++)
            {
                expect(PRESET_INFO[i].noiseCode).toBe(PRESETS[i]);
            }
        });

        it('should have non-empty names', () =>
        {
            for (const info of PRESET_INFO)
            {
                expect(info.name.length).toBeGreaterThan(0);
            }
        });

        it('should have non-empty descriptions', () =>
        {
            for (const info of PRESET_INFO)
            {
                expect(info.description.length).toBeGreaterThan(0);
            }
        });
    });

    describe('getPresetInfo', () =>
    {
        it('should return preset info for valid index', () =>
        {
            const info = getPresetInfo(0);

            expect(info).toBeDefined();
            expect(info!.name).toBe('Pure Square 50/50');
        });

        it('should return undefined for negative index', () =>
        {
            expect(getPresetInfo(-1)).toBeUndefined();
        });

        it('should return undefined for index >= 128', () =>
        {
            expect(getPresetInfo(128)).toBeUndefined();
            expect(getPresetInfo(1000)).toBeUndefined();
        });

        it('should return correct preset info for various indices', () =>
        {
            expect(getPresetInfo(64)!.name).toBe('Pitfall!');
            expect(getPresetInfo(127)!.name).toBe('Texture Final');
        });
    });

    describe('getPresetNoiseCode', () =>
    {
        it('should return noise code for valid index', () =>
        {
            expect(getPresetNoiseCode(0)).toBe(PRESETS[0]);
            expect(getPresetNoiseCode(64)).toBe(PRESETS[64]);
        });

        it('should return undefined for invalid index', () =>
        {
            expect(getPresetNoiseCode(-1)).toBeUndefined();
            expect(getPresetNoiseCode(128)).toBeUndefined();
        });
    });

    describe('getPresetsInCategory', () =>
    {
        it('should return 16 presets for each category', () =>
        {
            expect(getPresetsInCategory('PURE_TONES').length).toBe(16);
            expect(getPresetsInCategory('BASS').length).toBe(16);
            expect(getPresetsInCategory('LEAD').length).toBe(16);
            expect(getPresetsInCategory('DRUMS').length).toBe(16);
            expect(getPresetsInCategory('CLASSIC_GAMES').length).toBe(16);
            expect(getPresetsInCategory('ENGINES').length).toBe(16);
            expect(getPresetsInCategory('WEAPONS').length).toBe(16);
            expect(getPresetsInCategory('AMBIENCE').length).toBe(16);
        });

        it('should return correct presets for PURE_TONES', () =>
        {
            const tones = getPresetsInCategory('PURE_TONES');

            expect(tones[0].name).toBe('Pure Square 50/50');
            expect(tones[15].name).toBe('Pitfall Tone');
        });

        it('should return correct presets for CLASSIC_GAMES', () =>
        {
            const games = getPresetsInCategory('CLASSIC_GAMES');

            expect(games[0].name).toBe('Pitfall!');
            expect(games[2].name).toBe('Defender Engine');
        });
    });

    describe('searchPresets', () =>
    {
        it('should find presets by name', () =>
        {
            const results = searchPresets('Pitfall');

            expect(results.length).toBeGreaterThan(0);
            expect(results.some(p => p.name === 'Pitfall!')).toBe(true);
        });

        it('should find presets by description', () =>
        {
            const results = searchPresets('POKEY');

            expect(results.length).toBeGreaterThan(0);
        });

        it('should be case insensitive', () =>
        {
            const lowerResults = searchPresets('pitfall');
            const upperResults = searchPresets('PITFALL');
            const mixedResults = searchPresets('PitFall');

            expect(lowerResults.length).toBe(upperResults.length);
            expect(lowerResults.length).toBe(mixedResults.length);
        });

        it('should return empty array for no matches', () =>
        {
            const results = searchPresets('xyznonexistent123');

            expect(results.length).toBe(0);
        });

        it('should find multiple matches', () =>
        {
            const results = searchPresets('Engine');

            expect(results.length).toBeGreaterThan(1);
        });
    });

    describe('Preset validity', () =>
    {
        it('Pure Square 50/50 should decode correctly', () =>
        {
            const fields = decodeNoiseCode(PRESETS[0]);

            expect(fields.aEnabled).toBe(true);
            expect(fields.bEnabled).toBe(false);
            expect(fields.cEnabled).toBe(false);
        });

        it('Pitfall! preset should have decimation 8', () =>
        {
            const fields = decodeNoiseCode(PRESETS[64]);

            expect(fields.decimation).toBe(8);
        });
    });
});

