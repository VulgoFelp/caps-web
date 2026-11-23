import { SelectedTheme } from "@revolt/state/stores/Theme";

import { CAPS_SCALE, createCapsTokens } from "./capsTheme";

/**
 * Generate Stoat for Web variables
 * @param theme Theme
 * @returns CSS Variables
 */
export function createStoatWebVariables(theme: SelectedTheme) {
  return {
    // helper variables
    "--unset-fg": "red",
    "--unset-bg": "linear-gradient(to right, red, blue)",

    // message size
    "--message-size": `${theme.messageSize}px`,
    "--message-group-spacing": `${theme.messageGroupSpacing}px`,

    // emoji size
    "--emoji-size": "1.4em",
    "--emoji-size-medium": "48px",
    "--emoji-size-large": "96px",

    // effects
    "--effects-blur-md": theme.blur ? "blur(20px)" : "unset",
    "--effects-invert-black": theme.darkMode ? "invert(100%)" : "invert(0%)",
    "--effects-invert-light": theme.darkMode ? "invert(0%)" : "invert(1000%)",

    // transitions
    "--transitions-fast": "90ms cubic-bezier(0.2, 0, 0, 1)",
    "--transitions-medium": "150ms cubic-bezier(0.2, 0, 0, 1)",

    // brand
    "--brand-presence-online": "#3ABF7E",
    "--brand-presence-idle": "#F39F00",
    "--brand-presence-busy": "#F84848",
    "--brand-presence-focus": "#4799F0",
    "--brand-presence-invisible": "#A5A5A5",

    // font
    "--fonts-primary": `"${theme.interfaceFont}", "Inter", sans-serif`,
    "--fonts-monospace": `"${theme.monospaceFont}", "Jetbrains Mono", sans-serif`,

    // load constants
    ...reduceWithPrefix(themeConstants.borderRadius, "--borderRadius-"),
    ...reduceWithPrefix(themeConstants.gap, "--gap-"),
    ...reduceWithPrefix(themeConstants.layout, "--layout-"),
    ...reduceWithPrefix(themeConstants.elevation, "--md-sys-elevation-"),

    // CAPS design system tokens
    ...CAPS_SCALE,
    ...createCapsTokens(theme.darkMode),
  };
}

/**
 * Add prefix to all keys in an object
 * @param object Object
 * @param prefix Prefix
 * @returns New object
 */
function reduceWithPrefix(object: Record<string, string>, prefix: string) {
  return Object.entries(object).reduce(
    (d, [k, v]) => ({ ...d, [`${prefix}${k}`]: v }),
    {},
  );
}

const themeConstants = {
  borderRadius: {
    // CAPS: a compressed shape scale. Containers stay crisp; only avatars,
    // status dots and toggles are fully round.
    none: "0px",
    xs: "3px",
    sm: "5px",
    md: "7px",
    lg: "8px",
    li: "10px",
    xl: "12px",
    xli: "14px",
    xxl: "16px",
    full: "calc(infinity * 1px)",
    circle: "100%",
  },
  /**
   * @deprecated decide this at a component level
   */
  gap: {
    none: "0",
    xxs: "1px",
    xs: "2px",
    s: "6px",
    sm: "4px",
    md: "8px",
    l: "12px",
    lg: "15px",
    x: "28px",
    xl: "32px",
    xxl: "64px",
  },
  /**
   * Material shadow elevation tokens
   *
   * {@link https://m3.material.io/styles/elevation/applying-elevation}
   */
  elevation: {
    // CAPS: depth is expressed with surface steps and hairlines; shadows are
    // reserved for floating layers.
    0: "unset",
    1: "0 0 0 1px rgba(from var(--md-sys-color-shadow) r g b / 0.12)",
    2: "0 1px 2px rgba(from var(--md-sys-color-shadow) r g b / 0.25)",
    3: "var(--caps-shadow-pop)",
    4: "var(--caps-shadow-pop)",
    5: "var(--caps-shadow-modal)",
  },
  layout: {
    "width-channel-sidebar": "240px",
    "width-user-context-menu-truncate": "300px",
    "height-message-box": "32vh",
  },
};
