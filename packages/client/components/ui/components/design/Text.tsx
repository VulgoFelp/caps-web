import { splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

import { cva } from "styled-system/css";

/**
 * Simple span Text wrapper to apply Typography styles
 *
 * @specification https://m3.material.io/styles/typography/type-scale-tokens
 */
export function Text(
  props: Parameters<typeof typography>[0] & { children: JSX.Element },
) {
  const [local, remote] = splitProps(props, ["children"]);
  return <span class={typography(remote)}>{local.children}</span>;
}

/**
 * Apply styles for chosen typography
 *
 * @specification https://m3.material.io/styles/typography/type-scale-tokens
 */
export const typography = cva({
  variants: {
    class: {
      display: {},
      headline: {},
      title: {},
      body: {},
      label: {},

      _messages: {
        fontWeight: 400,
        fontSize: "var(--message-size)",
      },

      _status: {
        fontWeight: 400,
        fontSize: "11px",
      },
    },
    size: {
      large: {},
      medium: {},
      small: {},
    },
  },
  compoundVariants: [
    // CAPS type scale: compact sizes for a dense communication UI,
    // hierarchy carried by weight (600 for headings) and tight tracking.
    {
      class: "display",
      size: "large",
      css: {
        lineHeight: "2.75rem",
        fontSize: "2.25rem",
        letterSpacing: "-0.02em",
        fontWeight: 600,
      },
    },
    {
      class: "display",
      size: "medium",
      css: {
        lineHeight: "2.375rem",
        fontSize: "1.875rem",
        letterSpacing: "-0.02em",
        fontWeight: 600,
      },
    },
    {
      class: "display",
      size: "small",
      css: {
        lineHeight: "2rem",
        fontSize: "1.625rem",
        letterSpacing: "-0.015em",
        fontWeight: 600,
      },
    },
    {
      class: "headline",
      size: "large",
      css: {
        lineHeight: "1.875rem",
        fontSize: "1.5rem",
        letterSpacing: "-0.015em",
        fontWeight: 600,
      },
    },
    {
      class: "headline",
      size: "medium",
      css: {
        lineHeight: "1.625rem",
        fontSize: "1.3125rem",
        letterSpacing: "-0.01em",
        fontWeight: 600,
      },
    },
    {
      class: "headline",
      size: "small",
      css: {
        lineHeight: "1.5rem",
        fontSize: "1.125rem",
        letterSpacing: "-0.01em",
        fontWeight: 600,
      },
    },
    {
      class: "title",
      size: "large",
      css: {
        lineHeight: "1.5rem",
        fontSize: "1.0625rem",
        letterSpacing: "-0.005em",
        fontWeight: 600,
      },
    },
    {
      class: "title",
      size: "medium",
      css: {
        lineHeight: "1.25rem",
        fontSize: "0.9375rem",
        letterSpacing: "0",
        fontWeight: 600,
      },
    },
    {
      class: "title",
      size: "small",
      css: {
        lineHeight: "1.125rem",
        fontSize: "0.8125rem",
        letterSpacing: "0",
        fontWeight: 600,
      },
    },
    {
      class: "body",
      size: "large",
      css: {
        overflowWrap: "anywhere",
        lineHeight: "1.375rem",
        fontSize: "0.9375rem",
        letterSpacing: "0",
        fontWeight: 400,
      },
    },
    {
      class: "body",
      size: "medium",
      css: {
        overflowWrap: "anywhere",
        lineHeight: "1.25rem",
        fontSize: "0.875rem",
        letterSpacing: "0",
        fontWeight: 400,
      },
    },
    {
      class: "body",
      size: "small",
      css: {
        overflowWrap: "anywhere",
        lineHeight: "1rem",
        fontSize: "0.75rem",
        letterSpacing: "0",
        fontWeight: 400,
      },
    },
    {
      class: "label",
      size: "large",
      css: {
        lineHeight: "1.125rem",
        fontSize: "0.8125rem",
        letterSpacing: "0",
        fontWeight: 500,
      },
    },
    {
      class: "label",
      size: "medium",
      css: {
        lineHeight: "1rem",
        fontSize: "0.75rem",
        letterSpacing: "0.005em",
        fontWeight: 500,
      },
    },
    {
      class: "label",
      size: "small",
      css: {
        lineHeight: "0.875rem",
        fontSize: "0.6875rem",
        letterSpacing: "0.02em",
        fontWeight: 500,
      },
    },
  ],
  defaultVariants: {
    class: "body",
    size: "medium",
  },
});
