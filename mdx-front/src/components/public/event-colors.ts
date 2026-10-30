const ink = "#1E1033";
const white = "#FFFFFF";
const brand = {
  primary: "#EC4899",
  secondary: "#4C1D95",
  accent: "#7C3AED",
};

export type EventColorInput = {
  colorPrimary: string | null;
  colorSecondary: string | null;
  colorAccent: string | null;
};

export type EventPalette = {
  primary: string;
  secondary: string;
  accent: string;
};

function normalize(value: string | null, fallback: string): string {
  const trimmed = value?.trim() ?? "";
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return fallback;
}

function channel(hex: string, start: number): number {
  const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
  if (value <= 0.03928) return value / 12.92;
  return ((value + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  return (
    0.2126 * channel(hex, 1) +
    0.7152 * channel(hex, 3) +
    0.0722 * channel(hex, 5)
  );
}

export function contrast(background: string, foreground: string): number {
  const lighter = Math.max(luminance(background), luminance(foreground));
  const darker = Math.min(luminance(background), luminance(foreground));
  return (lighter + 0.05) / (darker + 0.05);
}

export function eventPalette(event: EventColorInput): EventPalette {
  return {
    primary: normalize(event.colorPrimary, brand.primary),
    secondary: normalize(event.colorSecondary, brand.secondary),
    accent: normalize(event.colorAccent, brand.accent),
  };
}

export function readablePair(preferred: string): { background: string; color: string } {
  if (contrast(preferred, white) >= 4.5) return { background: preferred, color: white };
  if (contrast(preferred, ink) >= 4.5) return { background: preferred, color: ink };
  return { background: brand.secondary, color: white };
}

export function textOnLight(preferred: string): string {
  if (contrast(white, preferred) >= 4.5) return preferred;
  if (contrast(white, brand.secondary) >= 4.5) return brand.secondary;
  return ink;
}
