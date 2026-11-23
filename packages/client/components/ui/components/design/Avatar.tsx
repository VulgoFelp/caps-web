import { JSXElement, Show } from "solid-js";

import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { Initials } from "../utils";

import { Ripple } from "./Ripple";

export type Props = {
  /**
   * Avatar size
   */
  size?: number;

  /**
   * Avatar shape
   */
  shape?: "circle" | "square" | "rounded-square";

  /**
   * Image source
   */
  src?: string;

  /**
   * Fallback if no source
   */
  fallback?: string | JSXElement;

  /**
   * If this avatar falls back, use primary contrasting colours
   */
  primaryContrast?: boolean;

  /**
   * Whether the fallback content is drawn on a background circle (default true)
   */
  fallbackBackground?: boolean;

  /**
   * Punch a hole through the avatar
   */
  holepunch?:
    | "bottom-right"
    | "top-right"
    | "right"
    | "overlap"
    | "overlap-subtle"
    | "none"
    | false;

  /**
   * Specify overlay component
   */
  overlay?: JSXElement;

  /**
   * Whether this icon is interactive
   */
  interactive?: boolean;

  /**
   * Click handler
   */
  onClick?: (e: MouseEvent) => void;

  /**
   * HTML Web Component slot
   */
  slot?: string;
};

/**
 * Avatar image
 */
const Image = styled("img", {
  base: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

/**
 * Text fallback container
 */
const FallbackBase = styled("div", {
  base: {
    width: "100%",
    height: "100%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontWeight: 600,
    fontSize: "0.6875rem",
    letterSpacing: "0.01em",
    transition:
      "background-color var(--caps-dur) var(--caps-ease), color var(--caps-dur) var(--caps-ease)",
  },
  variants: {
    contrast: {
      true: {
        color: "var(--caps-on-accent)",
        background: "var(--caps-accent)",
      },
      false: {
        fill: "var(--caps-text-2)",
        color: "var(--caps-text-2)",
        background: "var(--caps-bg-raised)",
        boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",

        "*:hover > svg > g > foreignObject > div > &, a:hover &": {
          color: "var(--caps-text)",
          fill: "var(--caps-text)",
          background: "var(--caps-bg-overlay)",
        },
      },
      bare: {
        fill: "var(--caps-text-3)",
        color: "var(--caps-text-3)",

        "a:hover &": {
          color: "var(--caps-text)",
          fill: "var(--caps-text)",
        },
      },
    },
  },
  defaultVariants: {
    contrast: false,
  },
});

/**
 * Generic Avatar component
 *
 * Partially inspired by Adw.Avatar API, we allow users to specify a fallback component (usually just text) to display in case the URL is invalid.
 */
export function Avatar(props: Props) {
  return (
    <ParentBase
      slot={props.slot}
      style={{
        width: props.size + "px",
        height: props.size + "px",
      }}
      viewBox="0 0 32 32"
      interactive={props.interactive}
      onClick={props.onClick}
    >
      <g
        mask={
          props.holepunch && props.holepunch !== "none"
            ? `url(#holepunch-${props.holepunch})`
            : undefined
        }
      >
        <foreignObject
          x="0"
          y="0"
          width="32"
          height="32"
          class={css({ transition: "var(--transitions-fast) filter" })}
        >
          <Shape shape={props.shape}>
            <Show when={props.interactive}>
              <Ripple />
            </Show>
            <Show
              when={props.src}
              keyed
              fallback={
                <FallbackBase
                  contrast={
                    props.fallbackBackground === false
                      ? "bare"
                      : props.primaryContrast
                  }
                >
                  {typeof props.fallback === "string" ? (
                    <Initials input={props.fallback} maxLength={2} />
                  ) : (
                    props.fallback
                  )}
                </FallbackBase>
              }
            >
              <Image src={props.src} draggable={false} />
            </Show>
          </Shape>
        </foreignObject>
      </g>
      {props.overlay}
    </ParentBase>
  );
}

/**
 * Avatar parent container
 */
const ParentBase = styled("svg", {
  base: {
    flexShrink: 0,
    userSelect: "none",
    cursor: "inherit",
  },
  variants: {
    interactive: {
      true: {
        cursor: "pointer",
      },
      false: {},
    },
  },
  defaultVariants: {
    interactive: false,
  },
});

/**
 * Shape container (for Ripple support)
 */
const Shape = styled("div", {
  base: {
    overflow: "hidden",
    width: "100%",
    height: "100%",
  },
  variants: {
    shape: {
      circle: {
        borderRadius: "var(--borderRadius-circle)",
      },
      square: {},
      // radius in the 32-unit avatar space: 9/32 ≈ 28% (soft square)
      "rounded-square": {
        borderRadius: "9px",
      },
    },
  },
  defaultVariants: {
    shape: "circle",
  },
});
