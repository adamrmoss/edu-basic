/**
 * GRIT Preset NoiseCode Values
 * 
 * 128 presets optimized for retro music instruments and sound effects.
 * Each preset is a single 32-bit NoiseCode value.
 * 
 * Categories:
 *   0-15:   Pure Tones
 *   16-31:  Bass Instruments
 *   32-47:  Lead Instruments
 *   48-63:  Drums & Percussion
 *   64-79:  Classic Game Sounds
 *   80-95:  Engines & Motors
 *   96-111: Weapons & Impacts
 *   112-127: Ambience & Textures
 */

/**
 * Preset category ranges
 */
export const PRESET_CATEGORIES =
{
    PURE_TONES: { start: 0, end: 15, name: 'Pure Tones' },
    BASS: { start: 16, end: 31, name: 'Bass Instruments' },
    LEAD: { start: 32, end: 47, name: 'Lead Instruments' },
    DRUMS: { start: 48, end: 63, name: 'Drums & Percussion' },
    CLASSIC_GAMES: { start: 64, end: 79, name: 'Classic Game Sounds' },
    ENGINES: { start: 80, end: 95, name: 'Engines & Motors' },
    WEAPONS: { start: 96, end: 111, name: 'Weapons & Impacts' },
    AMBIENCE: { start: 112, end: 127, name: 'Ambience & Textures' },
} as const;

/**
 * Preset metadata
 */
export interface PresetInfo
{
    name: string;
    noiseCode: number;
    description: string;
}

/**
 * All 128 preset NoiseCode values
 */
export const PRESETS: number[] =
[
    // Pure Tones (0-15)
    0x00000010,
    0x00001010,
    0x08000010,
    0x10000010,
    0x38000010,
    0x08001010,
    0x10001010,
    0x00002010,
    0x00002810,
    0x00003010,
    0x38003010,
    0x05000010,
    0x05001010,
    0x06000010,
    0x06001010,
    0x38003010,

    // Bass Instruments (16-31)
    0x00000010,
    0x00001010,
    0x00002010,
    0x38003010,
    0x00000030,
    0x00000430,
    0x10001010,
    0x00000070,
    0x00200030,
    0x00400030,
    0x01000010,
    0x06000010,
    0x00000430,
    0x38003010,
    0x10002010,
    0x10002810,

    // Lead Instruments (32-47)
    0x00000010,
    0x00001010,
    0x00000030,
    0x00003010,
    0x00000070,
    0x00400030,
    0x01000010,
    0x06000010,
    0x00000430,
    0x00200030,
    0x00600030,
    0x00003010,
    0x38003010,
    0x00800030,
    0x00A00030,
    0x10000010,

    // Drums & Percussion (48-63)
    0x00002010,
    0x00002810,
    0x00003010,
    0x00000030,
    0x00000070,
    0x00200030,
    0x00400030,
    0x00600070,
    0x00002010,
    0x00002810,
    0x00003010,
    0x00000030,
    0x00000070,
    0x00200030,
    0x00400030,
    0x00600030,

    // Classic Game Sounds (64-79)
    0x38003010,
    0x10003010,
    0x00006430,
    0x01006030,
    0x00003010,
    0x00006030,
    0x00002010,
    0x00003010,
    0x00000010,
    0x00001010,
    0x01000010,
    0x00003010,
    0x00002810,
    0x00002010,
    0x00006030,
    0x00000030,

    // Engines & Motors (80-95)
    0x38006470,
    0x00006430,
    0x10006430,
    0x00006030,
    0x00206030,
    0x38006030,
    0x00406030,
    0x00006070,
    0x01006030,
    0x38003010,
    0x00003430,
    0x00006430,
    0x00206030,
    0x10006430,
    0x20006430,
    0x00606030,

    // Weapons & Impacts (96-111)
    0x01006030,
    0x00006030,
    0x00206030,
    0x01006030,
    0x00406030,
    0x06006030,
    0x00006070,
    0x01006030,
    0x00006030,
    0x00806030,
    0x00A06030,
    0x00606030,
    0x00206030,
    0x00406030,
    0x00206030,
    0x00206030,

    // Ambience & Textures (112-127)
    0x00006030,
    0x00006070,
    0x38006030,
    0x00006030,
    0x00206030,
    0x00406030,
    0x00006070,
    0x00806030,
    0x38003010,
    0x00606030,
    0x00A06030,
    0x00606030,
    0x00606030,
    0x00206030,
    0x00206030,
    0x00006070,
];

/**
 * Preset names and descriptions
 */
export const PRESET_INFO: PresetInfo[] =
[
    // Pure Tones (0-15)
    { name: 'Pure Square 50/50', noiseCode: PRESETS[0], description: 'A=1-bit square (0), enabled only' },
    { name: 'Pure Pulse 25/75', noiseCode: PRESETS[1], description: 'A=25/75 pulse (1), enabled only' },
    { name: 'Square Decim 2', noiseCode: PRESETS[2], description: 'A=1-bit square (0), decim ÷2' },
    { name: 'Square Decim 4', noiseCode: PRESETS[3], description: 'A=1-bit square (0), decim ÷4' },
    { name: 'Square Decim 8', noiseCode: PRESETS[4], description: 'A=1-bit square (0), decim ÷8' },
    { name: 'Pulse Decim 2', noiseCode: PRESETS[5], description: 'A=25/75 pulse (1), decim ÷2' },
    { name: 'Pulse Decim 4', noiseCode: PRESETS[6], description: 'A=25/75 pulse (1), decim ÷4' },
    { name: '4-bit Tone', noiseCode: PRESETS[7], description: 'A=4-bit (2), enabled only' },
    { name: '5-bit Tone', noiseCode: PRESETS[8], description: 'A=5-bit (3), enabled only' },
    { name: '9-bit Tone', noiseCode: PRESETS[9], description: 'A=9-bit (4), enabled only' },
    { name: '9-bit Decim 8', noiseCode: PRESETS[10], description: 'A=9-bit (4), decim ÷8 (Pitfall! style)' },
    { name: 'Square AM', noiseCode: PRESETS[11], description: 'A=1-bit square (0), SHAPE=AM (5)' },
    { name: 'Pulse AM', noiseCode: PRESETS[12], description: 'A=25/75 pulse (1), SHAPE=AM (5)' },
    { name: 'Square Ring', noiseCode: PRESETS[13], description: 'A=1-bit square (0), SHAPE=RING (6)' },
    { name: 'Pulse Ring', noiseCode: PRESETS[14], description: 'A=25/75 pulse (1), SHAPE=RING (6)' },
    { name: 'Pitfall Tone', noiseCode: PRESETS[15], description: 'A=9-bit (4), decim ÷8, classic Pitfall!' },

    // Bass Instruments (16-31)
    { name: 'Deep Bass', noiseCode: PRESETS[16], description: 'A=1-bit square (0), use 60-200 Hz' },
    { name: 'Bass Pulse', noiseCode: PRESETS[17], description: 'A=25/75 pulse (1), use 60-200 Hz' },
    { name: 'Sub Bass', noiseCode: PRESETS[18], description: 'A=4-bit (2), sub-bass texture' },
    { name: 'Bass Rumble', noiseCode: PRESETS[19], description: 'A=9-bit (4), decim ÷8, rumbly' },
    { name: 'Bass Layer', noiseCode: PRESETS[20], description: 'A=1-bit (0), B=1-bit (0), XOR' },
    { name: 'Bass Clock', noiseCode: PRESETS[21], description: 'A=9-bit (4), B=4-bit (2), B_CLK_A, XOR' },
    { name: 'Deep Pulse', noiseCode: PRESETS[22], description: 'A=25/75 pulse (1), decim ÷4' },
    { name: 'Bass Texture', noiseCode: PRESETS[23], description: 'A=1-bit (0), B=1-bit (0), C=1-bit (0), XOR' },
    { name: 'Bass Complex', noiseCode: PRESETS[24], description: 'A=1-bit (0), B=1-bit (0), AND' },
    { name: 'Bass Warm', noiseCode: PRESETS[25], description: 'A=1-bit (0), B=1-bit (0), OR' },
    { name: 'Bass Metallic', noiseCode: PRESETS[26], description: 'A=1-bit square (0), SHAPE=XOR_SQUARE (1)' },
    { name: 'Bass Bell', noiseCode: PRESETS[27], description: 'A=1-bit square (0), SHAPE=RING (6)' },
    { name: 'Bass Sync', noiseCode: PRESETS[28], description: 'A=9-bit (4), B=4-bit (2), clock-coupled' },
    { name: 'Bass Classic', noiseCode: PRESETS[29], description: 'A=9-bit (4), decim ÷8, classic POKEY' },
    { name: 'Bass Variant 1', noiseCode: PRESETS[30], description: 'A=4-bit (2), decim ÷4' },
    { name: 'Bass Variant 2', noiseCode: PRESETS[31], description: 'A=5-bit (3), decim ÷4' },

    // Lead Instruments (32-47)
    { name: 'Lead Square', noiseCode: PRESETS[32], description: 'A=1-bit square (0), bright lead' },
    { name: 'Lead Pulse', noiseCode: PRESETS[33], description: 'A=25/75 pulse (1), punchy lead' },
    { name: 'Lead Layered', noiseCode: PRESETS[34], description: 'A=1-bit (0), B=1-bit (0), XOR' },
    { name: 'Lead Arp', noiseCode: PRESETS[35], description: 'A=9-bit (4), arpeggio-like' },
    { name: 'Lead Bright', noiseCode: PRESETS[36], description: 'A=1-bit (0), B=1-bit (0), C=1-bit (0), XOR' },
    { name: 'Lead Warm', noiseCode: PRESETS[37], description: 'A=1-bit (0), B=1-bit (0), OR' },
    { name: 'Lead Metallic', noiseCode: PRESETS[38], description: 'A=1-bit square (0), SHAPE=XOR_SQUARE (1)' },
    { name: 'Lead Bell', noiseCode: PRESETS[39], description: 'A=1-bit square (0), SHAPE=RING (6)' },
    { name: 'Lead Sync', noiseCode: PRESETS[40], description: 'A=9-bit (4), B=4-bit (2), clock-coupled' },
    { name: 'Lead Complex', noiseCode: PRESETS[41], description: 'A=1-bit (0), B=1-bit (0), AND' },
    { name: 'Lead Glitch', noiseCode: PRESETS[42], description: 'A=1-bit (0), B=1-bit (0), NAND' },
    { name: 'Lead Sweep', noiseCode: PRESETS[43], description: 'A=9-bit (4), good for sweeps' },
    { name: 'Lead Classic', noiseCode: PRESETS[44], description: 'A=9-bit (4), decim ÷8, classic' },
    { name: 'Lead Ambient', noiseCode: PRESETS[45], description: 'A=1-bit (0), B=1-bit (0), NOR' },
    { name: 'Lead Impact', noiseCode: PRESETS[46], description: 'A=1-bit (0), B=1-bit (0), XNOR' },
    { name: 'Lead Variant', noiseCode: PRESETS[47], description: 'A=1-bit square (0), decim ÷4' },

    // Drums & Percussion (48-63)
    { name: 'Kick Deep', noiseCode: PRESETS[48], description: 'A=4-bit (2), deep kick, use 40-80 Hz' },
    { name: 'Kick Punch', noiseCode: PRESETS[49], description: 'A=5-bit (3), punchy kick, use 50-100 Hz' },
    { name: 'Kick Classic', noiseCode: PRESETS[50], description: 'A=9-bit (4), classic kick, use 60-120 Hz' },
    { name: 'Snare Sharp', noiseCode: PRESETS[51], description: 'A=1-bit (0), B=1-bit (0), XOR, sharp' },
    { name: 'Snare Classic', noiseCode: PRESETS[52], description: 'A=1-bit (0), B=1-bit (0), C=1-bit (0), XOR' },
    { name: 'HiHat Closed', noiseCode: PRESETS[53], description: 'A=1-bit (0), B=1-bit (0), AND, sparse' },
    { name: 'HiHat Open', noiseCode: PRESETS[54], description: 'A=1-bit (0), B=1-bit (0), OR, dense' },
    { name: 'Crash', noiseCode: PRESETS[55], description: 'A=1-bit (0), B=1-bit (0), C=1-bit (0), NAND' },
    { name: 'Tom Low', noiseCode: PRESETS[56], description: 'A=4-bit (2), low tom, use 80-150 Hz' },
    { name: 'Tom Mid', noiseCode: PRESETS[57], description: 'A=5-bit (3), mid tom, use 100-200 Hz' },
    { name: 'Tom High', noiseCode: PRESETS[58], description: 'A=9-bit (4), high tom, use 150-300 Hz' },
    { name: 'Clap', noiseCode: PRESETS[59], description: 'A=1-bit (0), B=1-bit (0), XOR, clap texture' },
    { name: 'Rimshot', noiseCode: PRESETS[60], description: 'A=1-bit (0), B=1-bit (0), C=1-bit (0), XOR' },
    { name: 'Shaker', noiseCode: PRESETS[61], description: 'A=1-bit (0), B=1-bit (0), AND, sparse' },
    { name: 'Tambourine', noiseCode: PRESETS[62], description: 'A=1-bit (0), B=1-bit (0), OR, dense' },
    { name: 'Perc Glitch', noiseCode: PRESETS[63], description: 'A=1-bit (0), B=1-bit (0), NAND, glitchy' },

    // Classic Game Sounds (64-79)
    { name: 'Pitfall!', noiseCode: PRESETS[64], description: 'A=9-bit (4), decim ÷8, classic Pitfall!' },
    { name: 'Pitfall Variant', noiseCode: PRESETS[65], description: 'A=9-bit (4), decim ÷4, variant' },
    { name: 'Defender Engine', noiseCode: PRESETS[66], description: 'A=17-bit (6), B=9-bit (4), B_CLK_A, XOR' },
    { name: 'Defender Weapon', noiseCode: PRESETS[67], description: 'A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE' },
    { name: 'POKEY Classic', noiseCode: PRESETS[68], description: 'A=9-bit (4), classic POKEY tone' },
    { name: 'POKEY Noise', noiseCode: PRESETS[69], description: 'A=17-bit (6), B=17-bit (6), XOR' },
    { name: 'POKEY Tone', noiseCode: PRESETS[70], description: 'A=4-bit (2), POKEY-style tone' },
    { name: 'TIA Sound', noiseCode: PRESETS[71], description: 'A=9-bit (4), TIA-style sound' },
    { name: 'Game Beep', noiseCode: PRESETS[72], description: 'A=1-bit square (0), classic beep' },
    { name: 'Game Blip', noiseCode: PRESETS[73], description: 'A=25/75 pulse (1), classic blip' },
    { name: 'Game Zap', noiseCode: PRESETS[74], description: 'A=1-bit square (0), SHAPE=XOR_SQUARE' },
    { name: 'Game Powerup', noiseCode: PRESETS[75], description: 'A=9-bit (4), powerup sound' },
    { name: 'Game Coin', noiseCode: PRESETS[76], description: 'A=5-bit (3), coin collection' },
    { name: 'Game Jump', noiseCode: PRESETS[77], description: 'A=4-bit (2), jump sound' },
    { name: 'Game Explosion', noiseCode: PRESETS[78], description: 'A=17-bit (6), B=17-bit (6), XOR, explosion' },
    { name: 'Game Victory', noiseCode: PRESETS[79], description: 'A=1-bit (0), B=1-bit (0), XOR, victory fanfare' },

    // Engines & Motors (80-95)
    { name: 'Engine Rumble', noiseCode: PRESETS[80], description: 'A=17-bit (6), B=9-bit (4), C=4-bit (2), B_CLK_A, C_CLK_B, XOR, decim ÷8' },
    { name: 'Engine Idle', noiseCode: PRESETS[81], description: 'A=17-bit (6), B=9-bit (4), B_CLK_A, XOR' },
    { name: 'Engine Rev', noiseCode: PRESETS[82], description: 'A=17-bit (6), B=9-bit (4), B_CLK_A, XOR, decim ÷4' },
    { name: 'Motor Hum', noiseCode: PRESETS[83], description: 'A=17-bit (6), B=17-bit (6), XOR' },
    { name: 'Motor Fast', noiseCode: PRESETS[84], description: 'A=17-bit (6), B=17-bit (6), AND' },
    { name: 'Motor Slow', noiseCode: PRESETS[85], description: 'A=17-bit (6), B=17-bit (6), XOR, decim ÷8' },
    { name: 'Engine Complex', noiseCode: PRESETS[86], description: 'A=17-bit (6), B=17-bit (6), OR' },
    { name: 'Engine Layered', noiseCode: PRESETS[87], description: 'A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR' },
    { name: 'Engine Metallic', noiseCode: PRESETS[88], description: 'A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE' },
    { name: 'Engine Classic', noiseCode: PRESETS[89], description: 'A=9-bit (4), decim ÷8, classic style' },
    { name: 'Motor Rhythmic', noiseCode: PRESETS[90], description: 'A=9-bit (4), B=4-bit (2), B_CLK_A, XOR' },
    { name: 'Engine Sync', noiseCode: PRESETS[91], description: 'A=17-bit (6), B=9-bit (4), B_CLK_A, XOR' },
    { name: 'Motor Texture', noiseCode: PRESETS[92], description: 'A=17-bit (6), B=17-bit (6), AND' },
    { name: 'Engine Variant 1', noiseCode: PRESETS[93], description: 'A=17-bit (6), B=9-bit (4), B_CLK_A, XOR, decim ÷4' },
    { name: 'Engine Variant 2', noiseCode: PRESETS[94], description: 'A=17-bit (6), B=9-bit (4), B_CLK_A, XOR, decim ÷5' },
    { name: 'Engine Glitch', noiseCode: PRESETS[95], description: 'A=17-bit (6), B=17-bit (6), NAND' },

    // Weapons & Impacts (96-111)
    { name: 'Metallic Impact', noiseCode: PRESETS[96], description: 'A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE' },
    { name: 'Weapon Laser', noiseCode: PRESETS[97], description: 'A=17-bit (6), B=17-bit (6), XOR, sharp' },
    { name: 'Weapon Blast', noiseCode: PRESETS[98], description: 'A=17-bit (6), B=17-bit (6), AND, sparse' },
    { name: 'Impact Sharp', noiseCode: PRESETS[99], description: 'A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE' },
    { name: 'Impact Deep', noiseCode: PRESETS[100], description: 'A=17-bit (6), B=17-bit (6), OR, dense' },
    { name: 'Weapon Zap', noiseCode: PRESETS[101], description: 'A=17-bit (6), B=17-bit (6), XOR, SHAPE=RING' },
    { name: 'Weapon Beam', noiseCode: PRESETS[102], description: 'A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR' },
    { name: 'Impact Metallic', noiseCode: PRESETS[103], description: 'A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE' },
    { name: 'Weapon Classic', noiseCode: PRESETS[104], description: 'A=17-bit (6), B=17-bit (6), XOR' },
    { name: 'Impact Complex', noiseCode: PRESETS[105], description: 'A=17-bit (6), B=17-bit (6), NOR' },
    { name: 'Weapon Layered', noiseCode: PRESETS[106], description: 'A=17-bit (6), B=17-bit (6), XNOR' },
    { name: 'Impact Glitch', noiseCode: PRESETS[107], description: 'A=17-bit (6), B=17-bit (6), NAND' },
    { name: 'Weapon Variant 1', noiseCode: PRESETS[108], description: 'A=17-bit (6), B=17-bit (6), AND' },
    { name: 'Impact Variant 1', noiseCode: PRESETS[109], description: 'A=17-bit (6), B=17-bit (6), OR' },
    { name: 'Weapon Sparse', noiseCode: PRESETS[110], description: 'A=17-bit (6), B=17-bit (6), AND, sparse' },
    { name: 'Impact Sparse', noiseCode: PRESETS[111], description: 'A=17-bit (6), B=17-bit (6), AND, sparse' },

    // Ambience & Textures (112-127)
    { name: 'Wind', noiseCode: PRESETS[112], description: 'A=17-bit (6), B=17-bit (6), XOR, wind texture' },
    { name: 'Static', noiseCode: PRESETS[113], description: 'A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR' },
    { name: 'Texture Deep', noiseCode: PRESETS[114], description: 'A=17-bit (6), B=17-bit (6), XOR, decim ÷8' },
    { name: 'Texture Bright', noiseCode: PRESETS[115], description: 'A=17-bit (6), B=17-bit (6), XOR, bright' },
    { name: 'Ambience Dark', noiseCode: PRESETS[116], description: 'A=17-bit (6), B=17-bit (6), AND, dark' },
    { name: 'Ambience Light', noiseCode: PRESETS[117], description: 'A=17-bit (6), B=17-bit (6), OR, light' },
    { name: 'Texture Layered', noiseCode: PRESETS[118], description: 'A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR' },
    { name: 'Texture Complex', noiseCode: PRESETS[119], description: 'A=17-bit (6), B=17-bit (6), NOR' },
    { name: 'Ambience Classic', noiseCode: PRESETS[120], description: 'A=9-bit (4), decim ÷8, classic' },
    { name: 'Texture Variant 1', noiseCode: PRESETS[121], description: 'A=17-bit (6), B=17-bit (6), NAND' },
    { name: 'Ambience Variant 1', noiseCode: PRESETS[122], description: 'A=17-bit (6), B=17-bit (6), XNOR' },
    { name: 'Texture Glitch', noiseCode: PRESETS[123], description: 'A=17-bit (6), B=17-bit (6), NAND' },
    { name: 'Ambience Glitch', noiseCode: PRESETS[124], description: 'A=17-bit (6), B=17-bit (6), NAND' },
    { name: 'Texture Sparse', noiseCode: PRESETS[125], description: 'A=17-bit (6), B=17-bit (6), AND' },
    { name: 'Ambience Sparse', noiseCode: PRESETS[126], description: 'A=17-bit (6), B=17-bit (6), AND' },
    { name: 'Texture Final', noiseCode: PRESETS[127], description: 'A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR' },
];

/**
 * Gets preset info by index
 */
export function getPresetInfo(index: number): PresetInfo | undefined
{
    if (index < 0 || index >= PRESET_INFO.length)
    {
        return undefined;
    }

    return PRESET_INFO[index];
}

/**
 * Gets preset NoiseCode by index
 */
export function getPresetNoiseCode(index: number): number | undefined
{
    if (index < 0 || index >= PRESETS.length)
    {
        return undefined;
    }

    return PRESETS[index];
}

/**
 * Gets presets in a category
 */
export function getPresetsInCategory(category: keyof typeof PRESET_CATEGORIES): PresetInfo[]
{
    const range = PRESET_CATEGORIES[category];
    const result: PresetInfo[] = [];

    for (let i = range.start; i <= range.end; i++)
    {
        result.push(PRESET_INFO[i]);
    }

    return result;
}

/**
 * Finds presets matching a search term
 */
export function searchPresets(searchTerm: string): PresetInfo[]
{
    const term = searchTerm.toLowerCase();

    return PRESET_INFO.filter(preset =>
        preset.name.toLowerCase().includes(term) ||
        preset.description.toLowerCase().includes(term)
    );
}
