/**
 * CAPS design system — colour foundation
 *
 * "Grafite e lima": warm graphite neutrals with a single acid-lime accent.
 * The accent is reserved for primary actions, selection and focus; everything
 * else is carried by the neutral ramp so the interface stays calm for long
 * sessions.
 *
 * The palette is mapped onto the Material colour roles the app already
 * consumes (`--md-sys-color-*`), so every existing component inherits it, and
 * also exposed as purpose tokens (`--caps-*`) for the CAPS components.
 */

/**
 * Neutral ramp (warm graphite). Index = lightness step, 0 darkest.
 */
const graphite = {
  0: "#0c0c0b",
  50: "#111110",
  100: "#151514",
  150: "#191918",
  200: "#1d1d1b",
  250: "#222220",
  300: "#282825",
  350: "#2f2f2c",
  400: "#3a3a36",
  500: "#4b4a45",
  600: "#64635c",
  700: "#7d7b73",
  800: "#a3a198",
  900: "#cfcdc4",
  950: "#ecebe4",
} as const;

/**
 * Paper ramp for light mode (warm off-white).
 */
const paper = {
  0: "#ffffff",
  50: "#fbfaf7",
  100: "#f6f5f1",
  150: "#f1f0eb",
  200: "#ebeae4",
  250: "#e5e4dd",
  300: "#dddcd4",
  400: "#cbc9bf",
  500: "#a9a79d",
  600: "#85837a",
  700: "#64625b",
  800: "#4a4943",
  900: "#2b2b28",
  950: "#1a1a18",
} as const;

/**
 * Brand and semantic colours
 */
export const CAPS_BRAND = {
  lime: "#d4f24a",
  limeHover: "#def76e",
  limePressed: "#c6e33a",
  onLime: "#1a1f05",
  olive: "#4f6100", // lime equivalent with contrast on light surfaces
  amber: "#f0b45a",
  coral: "#f2685b",
  green: "#3abf7e",
  blue: "#6cb6ff",
} as const;

type Palette = Record<string, string>;

/**
 * Material role mapping (dark)
 */
const DARK: Palette = {
  primary: CAPS_BRAND.lime,
  "on-primary": CAPS_BRAND.onLime,
  // neutral container: the lime is reserved for the accent itself
  "primary-container": graphite[300],
  "on-primary-container": graphite[950],
  secondary: graphite[900],
  "on-secondary": graphite[200],
  "secondary-container": graphite[350],
  "on-secondary-container": graphite[950],
  tertiary: CAPS_BRAND.amber,
  "on-tertiary": "#2e1d02",
  "tertiary-container": "#3a2a12",
  "on-tertiary-container": "#fbd9a6",
  error: CAPS_BRAND.coral,
  "on-error": "#2b0703",
  "error-container": "#45201b",
  "on-error-container": "#ffd9d3",

  "primary-fixed": "#e3f5a0",
  "primary-fixed-dim": CAPS_BRAND.lime,
  "on-primary-fixed": CAPS_BRAND.onLime,
  "on-primary-fixed-variant": "#3c4710",
  "secondary-fixed": graphite[900],
  "secondary-fixed-dim": graphite[800],
  "on-secondary-fixed": graphite[100],
  "on-secondary-fixed-variant": graphite[400],
  "tertiary-fixed": "#fbd9a6",
  "tertiary-fixed-dim": CAPS_BRAND.amber,
  "on-tertiary-fixed": "#2e1d02",
  "on-tertiary-fixed-variant": "#5c3f12",

  "surface-dim": graphite[50],
  surface: graphite[150],
  "surface-bright": graphite[350],

  "surface-container-lowest": graphite[0],
  "surface-container-low": graphite[100],
  "surface-container": graphite[200],
  "surface-container-high": graphite[250],
  "surface-container-highest": graphite[300],

  "on-surface": graphite[950],
  "on-surface-variant": graphite[800],
  outline: graphite[500],
  "outline-variant": graphite[350],

  "inverse-surface": graphite[950],
  "inverse-on-surface": graphite[150],
  "inverse-primary": CAPS_BRAND.olive,

  scrim: "#000000",
  shadow: "#000000",
};

/**
 * Material role mapping (light)
 */
const LIGHT: Palette = {
  primary: CAPS_BRAND.olive,
  "on-primary": "#ffffff",
  "primary-container": paper[250],
  "on-primary-container": paper[950],
  secondary: paper[800],
  "on-secondary": "#ffffff",
  "secondary-container": paper[250],
  "on-secondary-container": paper[950],
  tertiary: "#8a5a10",
  "on-tertiary": "#ffffff",
  "tertiary-container": "#fbe3bd",
  "on-tertiary-container": "#2e1d02",
  error: "#c23a2d",
  "on-error": "#ffffff",
  "error-container": "#fde0db",
  "on-error-container": "#410a04",

  "primary-fixed": "#e4f59c",
  "primary-fixed-dim": CAPS_BRAND.lime,
  "on-primary-fixed": CAPS_BRAND.onLime,
  "on-primary-fixed-variant": "#3c4710",
  "secondary-fixed": paper[250],
  "secondary-fixed-dim": paper[400],
  "on-secondary-fixed": paper[950],
  "on-secondary-fixed-variant": paper[800],
  "tertiary-fixed": "#fbe3bd",
  "tertiary-fixed-dim": CAPS_BRAND.amber,
  "on-tertiary-fixed": "#2e1d02",
  "on-tertiary-fixed-variant": "#5c3f12",

  "surface-dim": paper[200],
  surface: paper[50],
  "surface-bright": paper[0],

  "surface-container-lowest": paper[0],
  "surface-container-low": paper[100],
  "surface-container": paper[150],
  "surface-container-high": paper[200],
  "surface-container-highest": paper[250],

  "on-surface": paper[950],
  "on-surface-variant": paper[700],
  outline: paper[500],
  "outline-variant": paper[300],

  "inverse-surface": paper[900],
  "inverse-on-surface": paper[100],
  "inverse-primary": CAPS_BRAND.lime,

  scrim: "#000000",
  shadow: "#1a1a18",
};

/**
 * Material colour roles for the CAPS preset
 * @param darkMode Dark mode
 */
export function createCapsMaterialScheme(darkMode: boolean): Palette {
  return darkMode ? DARK : LIGHT;
}

/**
 * CAPS purpose tokens (`--caps-*`). Components should prefer these.
 * @param darkMode Dark mode
 */
export function createCapsTokens(darkMode: boolean): Record<string, string> {
  const d = darkMode;
  return {
    // surfaces: rail < sidebar < app < raised < overlay
    "--caps-bg-rail": d ? graphite[0] : paper[200],
    "--caps-bg-sidebar": d ? graphite[100] : paper[100],
    "--caps-bg-app": d ? graphite[150] : paper[50],
    "--caps-bg-raised": d ? graphite[200] : paper[0],
    "--caps-bg-overlay": d ? graphite[250] : paper[0],
    "--caps-bg-field": d ? graphite[50] : paper[0],
    "--caps-bg-inset": d ? graphite[100] : paper[150],

    // interaction washes (layered over any surface)
    "--caps-hover": d ? "rgba(236, 235, 228, 0.055)" : "rgba(26, 26, 24, 0.05)",
    "--caps-active": d
      ? "rgba(236, 235, 228, 0.09)"
      : "rgba(26, 26, 24, 0.085)",
    "--caps-selected": d
      ? "rgba(236, 235, 228, 0.085)"
      : "rgba(26, 26, 24, 0.075)",

    // lines
    "--caps-line": d ? graphite[300] : paper[300],
    "--caps-line-soft": d ? graphite[250] : paper[250],
    "--caps-line-strong": d ? graphite[400] : paper[400],

    // text
    "--caps-text": d ? graphite[950] : paper[950],
    "--caps-text-2": d ? graphite[800] : paper[700],
    "--caps-text-3": d ? graphite[700] : "#74726a",
    "--caps-text-disabled": d ? graphite[600] : paper[600],

    // accent
    "--caps-accent": d ? CAPS_BRAND.lime : CAPS_BRAND.olive,
    "--caps-accent-hover": d ? CAPS_BRAND.limeHover : "#435300",
    "--caps-accent-pressed": d ? CAPS_BRAND.limePressed : "#384500",
    "--caps-on-accent": d ? CAPS_BRAND.onLime : "#ffffff",
    "--caps-accent-soft": d
      ? "rgba(212, 242, 74, 0.12)"
      : "rgba(79, 97, 0, 0.1)",
    "--caps-accent-text": d ? "#d7ef6a" : CAPS_BRAND.olive,

    // semantic
    "--caps-mention": CAPS_BRAND.amber,
    "--caps-mention-soft": d
      ? "rgba(240, 180, 90, 0.09)"
      : "rgba(240, 180, 90, 0.16)",
    "--caps-danger": d ? CAPS_BRAND.coral : "#c23a2d",
    "--caps-danger-soft": d
      ? "rgba(242, 104, 91, 0.12)"
      : "rgba(194, 58, 45, 0.09)",
    "--caps-success": CAPS_BRAND.green,
    "--caps-warning": CAPS_BRAND.amber,
    "--caps-info": CAPS_BRAND.blue,

    // focus ring: 2px accent, offset from the surface
    "--caps-focus-ring": d
      ? `0 0 0 2px ${graphite[150]}, 0 0 0 4px rgba(212, 242, 74, 0.7)`
      : `0 0 0 2px ${paper[50]}, 0 0 0 4px rgba(79, 97, 0, 0.55)`,

    // shadows: only for floating layers
    "--caps-shadow-pop": d
      ? "0 0 0 1px rgba(255, 255, 255, 0.04), 0 8px 24px -6px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.35)"
      : "0 0 0 1px rgba(26, 26, 24, 0.06), 0 8px 24px -6px rgba(26, 26, 24, 0.18), 0 2px 6px rgba(26, 26, 24, 0.08)",
    "--caps-shadow-modal": d
      ? "0 0 0 1px rgba(255, 255, 255, 0.05), 0 24px 64px -12px rgba(0, 0, 0, 0.7)"
      : "0 0 0 1px rgba(26, 26, 24, 0.06), 0 24px 64px -12px rgba(26, 26, 24, 0.28)",
    "--caps-scrim": d ? "rgba(6, 6, 5, 0.72)" : "rgba(26, 26, 24, 0.42)",
  };
}

/**
 * Scale tokens that do not depend on the colour mode
 */
export const CAPS_SCALE: Record<string, string> = {
  // spacing (4px grid, with 2/6 for dense UI)
  "--caps-space-1": "2px",
  "--caps-space-2": "4px",
  "--caps-space-3": "6px",
  "--caps-space-4": "8px",
  "--caps-space-5": "12px",
  "--caps-space-6": "16px",
  "--caps-space-7": "20px",
  "--caps-space-8": "24px",
  "--caps-space-9": "32px",
  "--caps-space-10": "48px",

  // radii: restrained, never pill-shaped for containers
  "--caps-radius-xs": "3px",
  "--caps-radius-sm": "5px",
  "--caps-radius-md": "7px",
  "--caps-radius-lg": "10px",
  "--caps-radius-server": "12px",

  // control heights (compact)
  "--caps-h-xs": "24px",
  "--caps-h-sm": "28px",
  "--caps-h-md": "32px",
  "--caps-h-lg": "36px",

  // type scale
  "--caps-text-xs": "11px",
  "--caps-text-sm": "12px",
  "--caps-text-md": "13px",
  "--caps-text-base": "14px",
  "--caps-text-lg": "15px",
  "--caps-text-xl": "18px",
  "--caps-text-2xl": "22px",
  "--caps-text-3xl": "28px",

  // motion
  "--caps-ease": "cubic-bezier(0.2, 0, 0, 1)",
  "--caps-ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "--caps-dur-fast": "90ms",
  "--caps-dur": "150ms",
  "--caps-dur-slow": "240ms",

  // layout
  "--caps-rail-width": "64px",
  "--caps-sidebar-width": "240px",
  "--caps-members-width": "232px",
  "--caps-header-height": "48px",
};
