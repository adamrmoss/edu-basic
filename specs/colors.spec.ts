import { getAllColorInfo, getAllColorNames, getColorValue, isColorName } from '../src/lang/colors';

describe('colors', () => {
    it('should resolve known color values case-insensitively', () => {
        expect(getColorValue('red')).toBeDefined();
        expect(getColorValue('RED')).toBe(getColorValue('red'));
    });

    it('should report valid and invalid color names', () => {
        expect(isColorName('blue')).toBe(true);
        expect(isColorName('BlUe')).toBe(true);
        expect(isColorName('not-a-color')).toBe(false);
    });

    it('should return color names sorted and unique', () => {
        const names = getAllColorNames();
        expect(names.length).toBeGreaterThan(10);

        const sorted = names.slice().sort();
        expect(names).toEqual(sorted);

        const unique = new Set(names);
        expect(unique.size).toBe(names.length);
    });

    it('should return color info with hex and rgba fields', () => {
        const info = getAllColorInfo();
        expect(info.length).toBeGreaterThan(10);

        // Alphabetical.
        const sorted = info.slice().sort((a, b) => a.name.localeCompare(b.name));
        expect(info.map(i => i.name)).toEqual(sorted.map(i => i.name));

        const red = info.find(i => i.name === 'red');
        expect(red).toBeDefined();
        expect(red!.hex).toBe('#ff0000');
        expect(red!.rgba).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });

    it('should include standard aliases that map to the same RGBA', () => {
        const info = getAllColorInfo();

        const aqua = info.find(i => i.name === 'aqua');
        const cyan = info.find(i => i.name === 'cyan');
        expect(aqua).toBeDefined();
        expect(cyan).toBeDefined();
        expect(cyan!.rgba).toEqual(aqua!.rgba);
    });
});

