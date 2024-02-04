import { Properties } from 'csstype'

export function mergeStyles(defaultStyles: Partial<Properties>, customStyles: Partial<Properties>): Partial<Properties> {
    const merged = { ...defaultStyles, ...customStyles };
    return merged;
}