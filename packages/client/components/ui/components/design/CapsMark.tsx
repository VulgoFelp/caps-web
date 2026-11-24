import { JSX, splitProps } from "solid-js";

/**
 * CAPS symbol: a keycap "C" with the Caps Lock light on
 *
 * The "C" follows `currentColor`; the light uses the accent unless
 * `mono` is set. Source of truth: `branding/build_identity.py`.
 */
export function CapsMark(
  props: {
    /**
     * Size in pixels (default 20)
     */
    size?: number;
    /**
     * Draw the light in the same colour as the "C"
     */
    mono?: boolean;
  } & JSX.SvgSVGAttributes<SVGSVGElement>,
) {
  const [local, rest] = splitProps(props, ["size", "mono"]);
  return (
    <svg
      viewBox="0 0 24 24"
      width={local.size ?? 20}
      height={local.size ?? 20}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M17.5 6.5H9a2.5 2.5 0 0 0-2.5 2.5v6A2.5 2.5 0 0 0 9 17.5h8.5"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      />
      <circle
        cx="16.6"
        cy="12"
        r="1.9"
        fill={local.mono ? "currentColor" : "var(--caps-accent)"}
      />
    </svg>
  );
}
