import { EduBasicValue, EduBasicType } from '../../edu-basic-value';
import { getColorValue, isColorName } from '../../colors';

/**
 * Resolves a color expression value to an RGBA integer
 * Supports both integer RGBA values and color name strings
 * @param value The evaluated expression value
 * @returns RGBA value as 32-bit integer
 * @throws Error if the value cannot be resolved to a color
 */
export function resolveColorValue(value: EduBasicValue): number
{
    if (value.type === EduBasicType.Integer)
    {
        return value.value as number;
    }
    
    if (value.type === EduBasicType.String)
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
    
    throw new Error('Color must be an integer or a color name');
}

/**
 * Converts a 32-bit RGBA integer to RGBA components
 * @param color 32-bit RGBA integer (format: 0xRRGGBBAA)
 * @returns RGBA components
 */
export function intToRgba(color: number): { r: number; g: number; b: number; a: number }
{
    return {
        r: (color >> 24) & 0xFF,
        g: (color >> 16) & 0xFF,
        b: (color >> 8) & 0xFF,
        a: color & 0xFF
    };
}
