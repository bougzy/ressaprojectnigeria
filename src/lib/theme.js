/**
 * Theme engine — turns two admin-picked base colours (primary/secondary) into
 * full 50–900 Tailwind-style shade scales at request time, and turns two
 * admin-picked font choices into CSS variables + a Google Fonts stylesheet.
 * No rebuild needed: everything is applied via CSS custom properties.
 */

export const FONT_OPTIONS = [
  { id: "Inter", label: "Inter (modern, clean)", stack: "'Inter', system-ui, sans-serif" },
  { id: "Poppins", label: "Poppins (rounded, friendly)", stack: "'Poppins', system-ui, sans-serif" },
  { id: "Montserrat", label: "Montserrat (bold, geometric)", stack: "'Montserrat', system-ui, sans-serif" },
  { id: "Lato", label: "Lato (neutral, professional)", stack: "'Lato', system-ui, sans-serif" },
  { id: "Raleway", label: "Raleway (elegant, thin)", stack: "'Raleway', system-ui, sans-serif" },
  { id: "Playfair Display", label: "Playfair Display (luxury serif)", stack: "'Playfair Display', Georgia, serif" },
  { id: "Merriweather", label: "Merriweather (classic serif)", stack: "'Merriweather', Georgia, serif" },
  { id: "Nunito", label: "Nunito (soft, approachable)", stack: "'Nunito', system-ui, sans-serif" },
  { id: "Work Sans", label: "Work Sans (versatile)", stack: "'Work Sans', system-ui, sans-serif" },
  { id: "DM Sans", label: "DM Sans (contemporary)", stack: "'DM Sans', system-ui, sans-serif" },
];

export const DEFAULT_THEME = {
  primary: "#dc2626", // red — matches the RESSA logo wordmark
  secondary: "#123a8f", // blue — matches the RESSA logo emblem
  fontHeading: "Inter",
  fontBody: "Inter",
  radius: "rounded", // rounded | soft | sharp
};

function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [252, 90, 19];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mix(hex, targetHex, weight) {
  const [r, g, b] = hexToRgb(hex);
  const [tr, tg, tb] = hexToRgb(targetHex);
  const m = (c, t) => Math.round(c + (t - c) * weight);
  return [m(r, tr), m(g, tg), m(b, tb)];
}

/** Generate a 50–900 shade scale (as "R G B" strings) from one base hex colour. */
export function shadeScale(baseHex) {
  const WHITE = "#ffffff";
  const BLACK = "#0b0b0c";
  const stops = {
    50: mix(baseHex, WHITE, 0.94),
    100: mix(baseHex, WHITE, 0.87),
    200: mix(baseHex, WHITE, 0.72),
    300: mix(baseHex, WHITE, 0.52),
    400: mix(baseHex, WHITE, 0.26),
    500: hexToRgb(baseHex),
    600: mix(baseHex, BLACK, 0.16),
    700: mix(baseHex, BLACK, 0.32),
    800: mix(baseHex, BLACK, 0.48),
    900: mix(baseHex, BLACK, 0.62),
  };
  const out = {};
  for (const [k, [r, g, b]] of Object.entries(stops)) out[k] = `${r} ${g} ${b}`;
  return out;
}

export function fontStack(id) {
  return FONT_OPTIONS.find((f) => f.id === id)?.stack || `'${id}', system-ui, sans-serif`;
}

/** Builds the <style> body (CSS variables) for the given theme. */
export function themeToCss(themeInput) {
  const theme = { ...DEFAULT_THEME, ...(themeInput || {}) };
  const brand = shadeScale(theme.primary || DEFAULT_THEME.primary);
  const navy = shadeScale(theme.secondary || DEFAULT_THEME.secondary);
  const radiusMap = { sharp: "0.15rem", rounded: "0.75rem", soft: "1.5rem" };
  const lines = [`:root{`];
  for (const [k, v] of Object.entries(brand)) lines.push(`--brand-${k}:${v};`);
  for (const [k, v] of Object.entries(navy)) lines.push(`--navy-${k}:${v};`);
  lines.push(`--font-sans:${fontStack(theme.fontBody)};`);
  lines.push(`--font-heading:${fontStack(theme.fontHeading)};`);
  lines.push(`--radius-base:${radiusMap[theme.radius] || radiusMap.rounded};`);
  lines.push(`}`);
  return lines.join("");
}

/** Google Fonts CSS2 URL for whichever heading/body fonts are selected. */
export function googleFontsUrl(themeInput) {
  const theme = { ...DEFAULT_THEME, ...(themeInput || {}) };
  const families = Array.from(new Set([theme.fontHeading, theme.fontBody]))
    .filter(Boolean)
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
