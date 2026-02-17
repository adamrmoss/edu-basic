import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { getColorValue, isColorName } from '../../colors';

/**
 * Resolve a color expression value to a packed RGBA integer.
 *
 * Supports both integer RGBA values and color name strings.
 *
 * @param value The evaluated expression value.
 * @returns The RGBA value as a 32-bit integer in the format \(0xRRGGBBAA\).
 * @throws If the value cannot be resolved to a color.
 */
export function resolveColorValue(value: EduBasicValue): number
{
    switch (value.type)
    {
        case EduBasicType.Integer:
            return value.value as number;
        case EduBasicType.String:
        {
            const colorName = value.value as string;

            if (isColorName(colorName))
            {
                const colorValue = getColorValue(colorName);

                if (colorValue !== undefined)
                {
                    return colorValue;
                }
            }

            throw new Error(`Unknown color name: ${colorName}`);
        }
        default:
            throw new Error('Color must be an integer or a color name');
    }
}

/**
 * Convert a packed RGBA integer into RGBA components.
 *
 * @param color The 32-bit RGBA integer in the format \(0xRRGGBBAA\).
 * @returns The RGBA components.
 */
export function intToRgba(color: number): { r: number; g: number; b: number; a: number }
{
    // Unpack 0xRRGGBBAA into r, g, b, a bytes.
    return {
        r: (color >> 24) & 0xFF,
        g: (color >> 16) & 0xFF,
        b: (color >> 8) & 0xFF,
        a: color & 0xFF
    };
}
